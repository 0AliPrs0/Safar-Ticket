import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.translations import CITIES_FA, COMPANIES_FA, translate_from_dict
import os

class AdminUserListView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        search_term = request.query_params.get('search', '')
        lang = request.headers.get('Accept-Language', 'en')
        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor,
                charset='utf8mb4', use_unicode=True
            )
            cursor = conn.cursor()

            query = """
                SELECT 
                    u.user_id, u.first_name, u.last_name, u.email, u.phone_number, 
                    u.account_status, u.registration_date, c.city_name
                FROM User u
                LEFT JOIN City c ON u.city_id = c.city_id
                WHERE u.user_type = 'CUSTOMER'
            """
            params = []
            if search_term:
                query += """
                    AND (u.first_name LIKE %s OR u.last_name LIKE %s OR u.email LIKE %s OR c.city_name LIKE %s)
                """
                like_term = f"%{search_term}%"
                params.extend([like_term, like_term, like_term, like_term])
            
            query += " ORDER BY u.registration_date DESC"

            cursor.execute(query, params)
            users = cursor.fetchall()
            
            for user in users:
                if user.get('city_name'):
                    user['city_name'] = translate_from_dict(user['city_name'], lang, CITIES_FA)
                if user.get('registration_date'):
                    user['registration_date'] = user['registration_date'].isoformat() + "Z"

            return Response(users)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()


class AdminUserDetailView(APIView):
    def get(self, request, user_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor,
                charset='utf8mb4', use_unicode=True
            )
            cursor = conn.cursor()

            # Get total reservations
            cursor.execute("SELECT COUNT(*) as total_reservations FROM Reservation WHERE user_id = %s", (user_id,))
            total_reservations = cursor.fetchone()['total_reservations']

            # Get active reservations
            cursor.execute("SELECT COUNT(*) as active_reservations FROM Reservation WHERE user_id = %s AND status IN ('paid', 'reserved')", (user_id,))
            active_reservations = cursor.fetchone()['active_reservations']
            
            response_data = {
                "total_reservations": total_reservations,
                "active_reservations": active_reservations
            }

            return Response(response_data)

        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()

class AdminUserBookingsView(APIView):
    def get(self, request, user_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        status_filter = request.query_params.get('status', None)
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
                    r.reservation_id, r.status, r.reservation_time, tr.departure_time, tr.price,
                    dep_city.city_name AS departure_city, dest_city.city_name AS destination_city,
                    tc.company_name AS transport_company
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE r.user_id = %s
            """
            params = [user_id]

            if status_filter == 'active':
                query += " AND r.status IN ('paid', 'reserved')"
            
            query += " ORDER BY r.reservation_time DESC"
            
            cursor.execute(query, params)
            bookings = cursor.fetchall()

            for booking in bookings:
                booking['departure_city'] = translate_from_dict(booking['departure_city'], lang, CITIES_FA)
                booking['destination_city'] = translate_from_dict(booking['destination_city'], lang, CITIES_FA)
                booking['transport_company'] = translate_from_dict(booking['transport_company'], lang, COMPANIES_FA)
                booking['reservation_time'] = booking['reservation_time'].isoformat() + "Z"
                booking['departure_time'] = booking['departure_time'].isoformat() + "Z"

            return Response(bookings)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()

class AdminUserStatusView(APIView):
    def post(self, request, user_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info :
            return Response({"error": "Permission denied."}, status=403)

        new_status = request.data.get("status")
        if new_status not in ['ACTIVE', 'INACTIVE']:
            return Response({"error": "Invalid status provided."}, status=400)

        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306
            )
            cursor = conn.cursor()
            cursor.execute("UPDATE User SET account_status = %s WHERE user_id = %s", (new_status, user_id))
            conn.commit()

            if cursor.rowcount == 0:
                return Response({"error": "User not found."}, status=404)

            return Response({"message": f"User status successfully updated to {new_status}."})
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()