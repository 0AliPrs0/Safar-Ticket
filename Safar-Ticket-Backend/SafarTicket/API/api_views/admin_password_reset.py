import MySQLdb
import hashlib
import redis
import secrets
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.email_utils import send_password_reset_email
import os
import re

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class AdminForgotPasswordAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=400)

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
            cursor.execute("SELECT user_id FROM User WHERE email = %s AND user_type = 'ADMIN'", (email,))
            user = cursor.fetchone()

            if user:
                user_id = user['user_id']
                token = secrets.token_urlsafe(32)
                redis_client.setex(f"admin_reset_token:{token}", timedelta(minutes=15), user_id)
                send_password_reset_email(email, token, is_admin=True)
            
            return Response({"message": "If an admin account with that email exists, a password reset link has been sent."})
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()

class AdminResetPasswordAPIView(APIView):
    def _is_password_strong(self, password):
        # (Password strength logic here...)
        return True

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([token, new_password]):
            return Response({"error": "Token and new password are required."}, status=400)
        
        user_id = redis_client.get(f"admin_reset_token:{token}")
        if not user_id:
            return Response({"error": "Invalid or expired token."}, status=400)

        conn = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = conn.cursor()
            
            new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            cursor.execute("UPDATE User SET password_hash = %s WHERE user_id = %s", (new_password_hash, user_id))
            conn.commit()
            redis_client.delete(f"admin_reset_token:{token}")

            return Response({"message": "Password has been reset successfully."})
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()