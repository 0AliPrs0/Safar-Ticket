import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
import json
from datetime import timedelta, timezone
import redis
from ..utils.email_utils import send_payment_reminder_email

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class RebookTicketAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        user_email = user_info.get('email') # Get user email for sending notification
        reservation_id = request.data.get("reservation_id")
        if not reservation_id:
            return Response({"error": "Reservation ID is required."}, status=400)

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()
            conn.begin()

            cursor.execute("""
                SELECT t.travel_id, t.seat_number, t.ticket_id, tr.price
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                WHERE r.reservation_id = %s AND r.status = 'reserved' AND r.expiration_time <= NOW()
            """, (reservation_id,))
            
            expired_booking = cursor.fetchone()
            if not expired_booking:
                conn.rollback()
                return Response({"error": "This reservation is not expired or does not exist."}, status=404)

            travel_id = expired_booking['travel_id']
            seat_number = expired_booking['seat_number']

            cursor.execute("""
                SELECT r.status FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                WHERE t.travel_id = %s AND t.seat_number = %s AND (r.status = 'paid' OR (r.status = 'reserved' AND r.expiration_time > NOW()))
            """, (travel_id, seat_number))

            if cursor.fetchone():
                conn.rollback()
                return Response({"error": "Sorry, this seat has been taken by another user."}, status=409)
            
            # --- FIX STARTS HERE ---
            # Fetch travel details needed for the email notification
            cursor.execute("""
                SELECT tr.departure_time,
                       dep_city.city_name AS departure_city,
                       dest_city.city_name AS destination_city
                FROM Travel tr
                JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE tr.travel_id = %s
            """, (travel_id,))
            travel_info = cursor.fetchone()
            if not travel_info:
                conn.rollback()
                return Response({"error": "Could not retrieve travel details for the notification."}, status=404)
            # --- FIX ENDS HERE ---

            new_reservation_time = datetime.datetime.utcnow()
            new_expiration_time = new_reservation_time + timedelta(minutes=10)

            cursor.execute("""
                UPDATE Reservation
                SET reservation_time = %s, expiration_time = %s
                WHERE reservation_id = %s
            """, (new_reservation_time, new_expiration_time, reservation_id))

            conn.commit()
           
            try:
                reservation_cache_data = {
                    "status": "reserved",
                    "user_id": user_id,
                    "ticket_id": expired_booking['ticket_id'],
                    "price": float(expired_booking['price'])
                }
                redis_key = f"reservation_details:{reservation_id}"
                redis_client.setex(redis_key, timedelta(minutes=10), json.dumps(reservation_cache_data, default=str))

                email_details = {
                    "reservation_id": reservation_id,
                    "departure_city": travel_info['departure_city'],
                    "destination_city": travel_info['destination_city'],
                    "departure_time": travel_info['departure_time'].strftime('%Y-%m-%d %H:%M')
                }
                # Ensure user_email is available before sending
                if user_email:
                    send_payment_reminder_email(user_email, new_expiration_time.strftime('%Y-%m-%d %H:%M:%S'), email_details)
            except (redis.exceptions.RedisError, TypeError) as e:
                print(f"Could not cache or send email for rebook: {e}")
                pass 

            return Response({
                "message": "Reservation has been successfully re-booked.",
                "reservation_id": reservation_id,
                "new_expiration_time": new_expiration_time.isoformat() + "Z"
            }, status=200)

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            if conn: conn.rollback()
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()