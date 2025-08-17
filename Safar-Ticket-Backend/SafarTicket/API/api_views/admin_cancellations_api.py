import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import os

class AdminCancellationsListView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        conn = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            query = """
                SELECT 
                    r.reservation_id, r.reservation_time,
                    u.email as user_email,
                    tr.departure_time,
                    tr.price,
                    dep_city.city_name AS departure_city,
                    dest_city.city_name AS destination_city,
                    tc.company_name AS transport_company
                FROM Reservation r
                JOIN User u ON r.user_id = u.user_id
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE r.status = 'cancellation_pending'
                ORDER BY r.reservation_time ASC
            """
            cursor.execute(query)
            requests = cursor.fetchall()
            
            for req in requests:
                # Calculate penalty for display
                departure_time = req["departure_time"]
                remaining_time = departure_time - datetime.now()
                price = float(req["price"])

                if remaining_time <= timedelta(hours=1): penalty_percent = 90
                elif remaining_time <= timedelta(hours=3): penalty_percent = 50
                else: penalty_percent = 10
                
                req['penalty_amount'] = round(price * penalty_percent / 100)
                req['refund_amount'] = price - req['penalty_amount']

                if req.get('reservation_time'):
                    req['reservation_time'] = req['reservation_time'].isoformat() + "Z"
                if req.get('departure_time'):
                    req['departure_time'] = req['departure_time'].isoformat() + "Z"

            return Response(requests)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()