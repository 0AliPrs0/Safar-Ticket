import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import hashlib
from ..utils.jwt import generate_access_token, generate_refresh_token
import os

class AdminLoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('username')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)

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

            cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
            user_data = cursor.fetchone()

            if not user_data:
                return Response({'error': 'Invalid credentials'}, status=401)

            if user_data.get('user_type') != 'ADMIN':
                return Response({'error': 'You do not have permission to access the admin panel.'}, status=403)

            if user_data['account_status'] != 'ACTIVE':
                return Response({'error': 'Account is not active.'}, status=403)

            password_hash = hashlib.sha256(password.encode()).hexdigest()
            if user_data['password_hash'] != password_hash:
                return Response({'error': 'Invalid credentials'}, status=401)

            user_id = user_data['user_id']
            user_type = user_data['user_type']

            access_token = generate_access_token(user_id, email, user_type)
            refresh_token = generate_refresh_token(user_id)

            return Response({
                'access': access_token,
                'refresh': refresh_token
            }, status=200)

        except MySQLdb.Error as e:
            return Response({'error': f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()