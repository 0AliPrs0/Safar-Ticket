import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import os

class AdminProfileUpdateAPIView(APIView):
    def put(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)
        user_id = user_info.get('user_id')
        data = request.data
        if not data:
            return Response({'error': 'No data provided for update'}, status=400)
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
            cursor = conn.cursor(MySQLdb.cursors.DictCursor)
            conn.begin()
            update_fields = {}
            allowed_fields = ['first_name', 'last_name', 'phone_number', 'birth_date']
            for field in allowed_fields:
                if field in data:
                    update_fields[field] = data[field]
            if 'city_name' in data:
                city_name_en = data['city_name']
                cursor.execute("SELECT city_id FROM City WHERE city_name = %s", (city_name_en,))
                city_result = cursor.fetchone()
                if not city_result:
                    conn.rollback()
                    return Response({"error": f"City '{city_name_en}' not found"}, status=404)
                update_fields['city_id'] = city_result["city_id"]
            if not update_fields:
                conn.rollback()
                return Response({'error': 'No valid fields for update'}, status=400)
            set_clause = ", ".join([f"{key} = %s" for key in update_fields.keys()])
            query_params = list(update_fields.values()) + [user_id]
            query = f"UPDATE User SET {set_clause} WHERE user_id = %s"
            cursor.execute(query, tuple(query_params))
            conn.commit()
            return Response({'message': 'Admin profile updated successfully'})
        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn: conn.close()