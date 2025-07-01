import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response

class ProfileUserDetailAPIView(APIView):
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
                SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number, 
                       u.birth_date, u.wallet, u.profile_image_url, c.city_name
                FROM User u
                LEFT JOIN City c ON u.city_id = c.city_id
                WHERE u.user_id = %s
            """
            cursor.execute(query, (user_id,))
            user_data = cursor.fetchone()

            if not user_data:
                return Response({"error": "User not found."}, status=404)

            return Response(user_data)

        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
