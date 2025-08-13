import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from ..utils.translations import CITIES_FA, COMPANIES_FA, translate_from_dict

class BookingDetailAPIView(APIView):
    def get(self, request, reservation_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        lang = request.headers.get('Accept-Language', 'en')

        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            query = """
                SELECT 
                    r.reservation_id AS booking_id, r.status, r.expiration_time,
                    t.travel_id, t.seat_number, tr.price,
                    tr.departure_time, tr.arrival_time,
                    tc.company_name AS transport_company_name,
                    dep_city.city_name AS departure_city_name,
                    dest_city.city_name AS destination_city_name
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE r.reservation_id = %s AND r.user_id = %s
            """
            
            cursor.execute(query, (reservation_id, user_id))
            booking = cursor.fetchone()

            if not booking:
                return Response({"error": "Booking not found or you do not have permission to view it."}, status=404)
            
            booking['transport_company_name'] = translate_from_dict(booking['transport_company_name'], lang, COMPANIES_FA)
            booking['departure_city_name'] = translate_from_dict(booking['departure_city_name'], lang, CITIES_FA)
            booking['destination_city_name'] = translate_from_dict(booking['destination_city_name'], lang, CITIES_FA)

            for key in ['departure_time', 'arrival_time', 'expiration_time']:
                if isinstance(booking.get(key), datetime):
                    booking[key] = booking[key].isoformat() + "Z"

            return Response(booking)

        except MySQLdb.Error as e:
            return Response({"error": f"Database query error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()