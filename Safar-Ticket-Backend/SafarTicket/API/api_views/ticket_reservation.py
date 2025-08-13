import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
from django.http import JsonResponse
import redis
import json
from datetime import timedelta, timezone
from ..utils.email_utils import send_payment_reminder_email

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class ReserveTicketAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        user_email = user_info.get('email')
        travel_id = request.data.get("travel_id")
        seat_number = request.data.get("seat_number")

        if not all([travel_id, seat_number]):
            return Response({"error": "travel_id and seat_number are required"}, status=400)

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db",
                user="root",
                password="Aliprs2005",
                database="safarticket",
                port=3306,
                cursorclass=MySQLdb.cursors.DictCursor,
                use_unicode=True
            )
            cursor = conn.cursor()
            conn.begin()
            
            cursor.execute("""
                SELECT tr.remaining_capacity, tr.total_capacity, tr.transport_type, tr.departure_time, tr.price,
                       dep_city.city_name AS departure_city, dest_city.city_name AS destination_city
                FROM Travel tr
                JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE tr.travel_id = %s FOR UPDATE
            """, (travel_id,))
            travel_info = cursor.fetchone()

            if not travel_info:
                conn.rollback()
                return Response({"error": "Travel not found"}, status=404)
            
            if travel_info["departure_time"] < datetime.datetime.now(timezone.utc).replace(tzinfo=None):
                conn.rollback()
                return Response({"error": "This travel has already departed and cannot be reserved."}, status=400)

            if travel_info["remaining_capacity"] <= 0:
                conn.rollback()
                return Response({"error": "No remaining capacity for this travel"}, status=400)

            if not (1 <= int(seat_number) <= travel_info['total_capacity']):
                conn.rollback()
                return Response({"error": f"Invalid seat number. Must be between 1 and {travel_info['total_capacity']}."}, status=400)

            cursor.execute("""
                SELECT r.status FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                WHERE t.travel_id = %s AND t.seat_number = %s AND (r.status = 'paid' OR (r.status = 'reserved' AND r.expiration_time > NOW()))
            """, (travel_id, seat_number))
            
            if cursor.fetchone():
                conn.rollback()
                return Response({"error": f"Seat {seat_number} is already occupied."}, status=400)

            cursor.execute("SELECT vehicle_id FROM Ticket WHERE travel_id = %s LIMIT 1", (travel_id,))
            ticket_info = cursor.fetchone()
            vehicle_id = ticket_info['vehicle_id'] if ticket_info else None
            
            if not vehicle_id:
                transport_map = {'plane': 'flight', 'bus': 'bus', 'train': 'train'}
                vehicle_type = transport_map.get(travel_info['transport_type'])
                if not vehicle_type:
                    conn.rollback()
                    return Response({"error": "Invalid transport type for vehicle assignment."}, status=500)
                
                cursor.execute("SELECT vehicle_id FROM VehicleDetail WHERE vehicle_type = %s ORDER BY RAND() LIMIT 1", (vehicle_type,))
                random_vehicle = cursor.fetchone()
                if not random_vehicle:
                    conn.rollback()
                    return Response({"error": f"No available vehicles of type '{vehicle_type}' found."}, status=500)
                vehicle_id = random_vehicle['vehicle_id']

            cursor.execute("INSERT INTO Ticket (travel_id, vehicle_id, seat_number) VALUES (%s, %s, %s)", (travel_id, vehicle_id, seat_number))
            new_ticket_id = cursor.lastrowid

            reservation_time = datetime.datetime.utcnow()
            expiration_time = reservation_time + timedelta(minutes=10)

            cursor.execute("INSERT INTO Reservation (user_id, ticket_id, status, reservation_time, expiration_time) VALUES (%s, %s, 'reserved', %s, %s)", (user_id, new_ticket_id, reservation_time, expiration_time))
            new_reservation_id = cursor.lastrowid

            cursor.execute("UPDATE Travel SET remaining_capacity = remaining_capacity - 1 WHERE travel_id = %s", (travel_id,))
            conn.commit()

            # --- Caching and Email logic restored here ---
            try:
                cursor.execute("SELECT allow_payment_reminders FROM User WHERE user_id = %s", (user_id,))
                user_prefs = cursor.fetchone()
                
                reservation_cache_data = {
                    "status": "reserved",
                    "user_id": user_id,
                    "ticket_id": new_ticket_id,
                    "price": float(travel_info["price"])
                }
                redis_key = f"reservation_details:{new_reservation_id}"
                redis_client.setex(redis_key, timedelta(minutes=10), json.dumps(reservation_cache_data, default=str))
                
                if user_prefs and user_prefs.get('allow_payment_reminders'):
                    email_details = {
                        "reservation_id": new_reservation_id,
                        "departure_city": travel_info['departure_city'],
                        "destination_city": travel_info['destination_city'],
                        "departure_time": travel_info['departure_time'].strftime('%Y-%m-%d %H:%M')
                    }
                    if user_email:
                        send_payment_reminder_email(user_email, expiration_time.strftime('%Y-%m-%d %H:%M:%S'), email_details)
            except (redis.exceptions.RedisError, MySQLdb.Error, TypeError) as e:
                print(f"Could not cache or send email for reservation: {e}")
                pass
            # --- End of restored logic ---
            
            return Response({
                "message": "Ticket reserved successfully. Please complete the payment.",
                "reservation_id": new_reservation_id,
                "expires_at": expiration_time.isoformat() + "Z"
            }, status=201)

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            print(f"DATABASE ERROR in ReserveTicket: {e}")
            return Response({"error": "An unexpected error occurred with the database. Please try again."}, status=500)
        except Exception as e:
            if conn: conn.rollback()
            print(f"GENERAL ERROR in ReserveTicket: {e}")
            return Response({"error": "An unexpected server error occurred."}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()


class UserReservationsAPIView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')

        try:
            conn = MySQLdb.connect(
                host="db",
                user="root",
                password="Aliprs2005",
                database="safarticket",
                port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()
            cursor.execute("""
                SELECT r.reservation_id, r.status, r.reservation_time, r.expiration_time,
                       t.travel_id, t.seat_number
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                WHERE r.user_id = %s
                ORDER BY r.reservation_time DESC
            """, (user_id,))
            reservations = cursor.fetchall()
            
            for r in reservations:
                if isinstance(r.get('reservation_time'), datetime.datetime):
                    r['reservation_time'] = r['reservation_time'].isoformat() + "Z"
                if isinstance(r.get('expiration_time'), datetime.datetime):
                    r['expiration_time'] = r['expiration_time'].isoformat() + "Z"
            
            return Response(reservations)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            if 'conn' in locals() and conn.open:
                cursor.close()
                conn.close()