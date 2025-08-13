import MySQLdb
import redis
import secrets
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.email_utils import send_otp_email

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class ChangeEmailRequestAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = user_info.get('user_id')
        new_email = request.data.get('new_email')

        if not new_email:
            return Response({"error": "New email is required."}, status=400)


        conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306, cursorclass=MySQLdb.cursors.DictCursor, use_unicode=True)
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM User WHERE email = %s", (new_email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return Response({"error": "This email is already in use by another account."}, status=409)
        
        cursor.close()
        conn.close()

        otp = str(secrets.randbelow(1000000)).zfill(6)
        redis_key = f"change_email_otp:{user_id}"
        redis_data = f"{new_email}:{otp}"
        redis_client.setex(redis_key, timedelta(minutes=10), redis_data)

        try:
            send_otp_email(new_email, otp)
            return Response({"message": f"An OTP has been sent to {new_email} for verification."})
        except Exception as e:
            return Response({"error": f"Failed to send OTP email: {str(e)}"}, status=500)

class ChangeEmailVerifyAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = user_info.get('user_id')
        otp = request.data.get('otp')

        redis_key = f"change_email_otp:{user_id}"
        redis_data = redis_client.get(redis_key)

        if not redis_data:
            return Response({"error": "OTP has expired or is invalid. Please request a new one."}, status=400)

        new_email, saved_otp = redis_data.split(':')
        
        if otp != saved_otp:
            return Response({"error": "The provided OTP is incorrect."}, status=400)

        conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
        cursor = conn.cursor()
        cursor.execute("UPDATE User SET email = %s WHERE user_id = %s", (new_email, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        redis_client.delete(redis_key)

        return Response({"message": "Your email has been updated successfully."})

class ToggleRemindersAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = user_info.get('user_id')
        allow_reminders = request.data.get('allow_reminders')

        if allow_reminders is None or not isinstance(allow_reminders, bool):
            return Response({"error": "'allow_reminders' (boolean) is required."}, status=400)

        conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
        cursor = conn.cursor()
        cursor.execute("UPDATE User SET allow_payment_reminders = %s WHERE user_id = %s", (allow_reminders, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        status = "enabled" if allow_reminders else "disabled"
        return Response({"message": f"Payment reminders have been {status}."})

class DeactivateAccountAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = user_info.get('user_id')
        
        conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
        cursor = conn.cursor()
        cursor.execute("UPDATE User SET account_status = 'INACTIVE' WHERE user_id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return Response({"message": "Your account has been deactivated. You will be logged out."})