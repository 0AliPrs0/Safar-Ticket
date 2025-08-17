import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import os

class TicketCancelAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        reservation_id = request.data.get("reservation_id")
        if not reservation_id:
            return Response({"error": "reservation_id is required"}, status=400)

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor(MySQLdb.cursors.DictCursor)
            conn.begin()

            cursor.execute("SELECT status FROM Reservation WHERE reservation_id = %s AND user_id = %s FOR UPDATE", (reservation_id, user_info.get('user_id')))
            reservation = cursor.fetchone()

            if not reservation:
                conn.rollback()
                return Response({"error": "Reservation not found or you do not have permission."}, status=404)

            current_status = reservation["status"]
            if current_status != 'paid':
                conn.rollback()
                return Response({"error": "Only paid reservations can be requested for cancellation."}, status=400)

            cursor.execute("UPDATE Reservation SET status = 'cancellation_pending' WHERE reservation_id = %s", (reservation_id,))
            
            conn.commit()
            
            return Response({"message": "Cancellation request submitted. An admin will review it shortly."})

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()