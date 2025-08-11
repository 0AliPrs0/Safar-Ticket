import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class UserBookingsAPIView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            query = """
                SELECT 
                    r.reservation_id AS booking_id,
                    r.status,
                    r.expiration_time,
                    t.ticket_id,
                    t.travel_id,
                    t.seat_number,
                    tr.price,
                    tr.departure_time,
                    tr.arrival_time,
                    tc.company_name AS transport_company_name,
                    dep_city.city_name AS departure_city_name,
                    dest_city.city_name AS destination_city_name,
                    CASE WHEN rp.report_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_report
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                LEFT JOIN Report rp ON t.ticket_id = rp.ticket_id
                WHERE r.user_id = %s
                ORDER BY 
                    CASE WHEN r.status = 'canceled' THEN 1 ELSE 0 END ASC, 
                    r.reservation_time DESC
            """
            
            cursor.execute(query, (user_id,))
            bookings = cursor.fetchall()
            
            for booking in bookings:
                if isinstance(booking.get('departure_time'), datetime):
                    booking['departure_time'] = booking['departure_time'].isoformat() + "Z"
                if isinstance(booking.get('arrival_time'), datetime):
                    booking['arrival_time'] = booking['arrival_time'].isoformat() + "Z"
                if isinstance(booking.get('expiration_time'), datetime):
                    booking['expiration_time'] = booking['expiration_time'].isoformat() + "Z"

            return Response(bookings)

        except MySQLdb.Error as e:
            return Response({"error": f"Database query error: {str(e)}"}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()