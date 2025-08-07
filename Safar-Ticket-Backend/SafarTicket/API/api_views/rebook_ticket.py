import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
import json
from datetime import timedelta, timezone
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class RebookTicketAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
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

            new_reservation_time = datetime.datetime.utcnow()
            new_expiration_time = new_reservation_time + timedelta(minutes=10)

            cursor.execute("""
                UPDATE Reservation
                SET reservation_time = %s, expiration_time = %s
                WHERE reservation_id = %s
            """, (new_reservation_time, new_expiration_time, reservation_id))

            conn.commit()

            # --- اصلاح کلیدی: ثبت اطلاعات رزرو جدید در Redis ---
            try:
                reservation_cache_data = {
                    "status": "reserved",
                    "user_id": user_id,
                    "ticket_id": expired_booking['ticket_id'],
                    "price": expired_booking['price']
                }
                redis_key = f"reservation_details:{reservation_id}"
                redis_client.setex(redis_key, timedelta(minutes=10), json.dumps(reservation_cache_data))
            except redis.exceptions.RedisError:
                pass #  اگر ردیس در دسترس نبود، برنامه نباید کرش کند

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
