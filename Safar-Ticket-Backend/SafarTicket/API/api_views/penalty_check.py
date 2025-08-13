import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta

class PenaltyCheckAPIView(APIView):
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
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor,
                use_unicode=True
            )
            cursor = conn.cursor()

            cursor.execute("""
                SELECT r.status, tr.departure_time, tr.price
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                WHERE r.reservation_id = %s
            """, (reservation_id,))
            result = cursor.fetchone()

            if not result:
                return Response({"error": "Reservation not found"}, status=404)

            if result["status"] != "paid":
                return Response({"error": "Only paid reservations have a penalty policy"}, status=400)

            now = datetime.now()
            remaining_time = result["departure_time"] - now

            if remaining_time <= timedelta(hours=1):
                penalty_percent = 90
            elif remaining_time <= timedelta(hours=3):
                penalty_percent = 50
            else:
                penalty_percent = 10

            penalty_amount = round(float(result["price"]) * penalty_percent / 100)
            refund_amount = float(result["price"]) - penalty_amount

            return Response({
                "reservation_id": reservation_id,
                "penalty_percent": penalty_percent,
                "penalty_amount": penalty_amount,
                "refund_amount": refund_amount
            })

        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
