import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from ..utils.translations import CITIES_FA, COMPANIES_FA, translate_from_dict
import os

class AdminBookingsListView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)
        
        lang = request.headers.get('Accept-Language', 'en')
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
                    r.reservation_id, r.status, r.reservation_time,
                    u.email as user_email, u.first_name, u.last_name,
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
                ORDER BY r.reservation_time DESC
            """
            cursor.execute(query)
            bookings = cursor.fetchall()
            
            for booking in bookings:
                booking['departure_city'] = translate_from_dict(booking['departure_city'], lang, CITIES_FA)
                booking['destination_city'] = translate_from_dict(booking['destination_city'], lang, CITIES_FA)
                booking['transport_company'] = translate_from_dict(booking['transport_company'], lang, COMPANIES_FA)
                if booking.get('reservation_time'):
                    booking['reservation_time'] = booking['reservation_time'].isoformat() + "Z"
                if booking.get('departure_time'):
                    booking['departure_time'] = booking['departure_time'].isoformat() + "Z"

            return Response(bookings)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()