import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.translations import CITIES_FA, translate_from_dict

class ProfileUserDetailAPIView(APIView):
    def get(self, request):
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
                SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number, 
                       u.birth_date, u.wallet, u.profile_image_url, c.city_name,
                       u.allow_payment_reminders, u.preferred_language
                FROM User u
                LEFT JOIN City c ON u.city_id = c.city_id
                WHERE u.user_id = %s
            """
            cursor.execute(query, (user_id,))
            user_data = cursor.fetchone()

            if not user_data:
                return Response({"error": "User not found."}, status=404)

            user_data['city_name'] = translate_from_dict(user_data['city_name'], lang, CITIES_FA)
            user_data['allow_payment_reminders'] = bool(user_data['allow_payment_reminders'])
            return Response(user_data)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()