import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
import json
import redis
import os

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class VerifyOtpAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=400)

        otp_key = f"signup_otp:{email}"
        user_data_key = f"temp_user:{email}"

        saved_otp = redis_client.get(otp_key)
        if not saved_otp or saved_otp != otp:
            return Response({'error': 'Invalid or expired OTP'}, status=400)

        temp_user_data_json = redis_client.get(user_data_key)
        if not temp_user_data_json:
            return Response({'error': 'Registration session expired. Please sign up again.'}, status=400)

        temp_user_data = json.loads(temp_user_data_json)
        
        conn = None
        cursor = None
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

            conn.begin()
            
            # City ID is hardcoded to 1 for simplicity, can be changed later
            city_id = 1

            cursor.execute("""
                INSERT INTO User (first_name, last_name, email, phone_number, password_hash, user_type, city_id, registration_date, account_status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                temp_user_data['first_name'], temp_user_data['last_name'], temp_user_data['email'],
                temp_user_data['phone_number'], temp_user_data['password_hash'], 'CUSTOMER',
                city_id, datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'ACTIVE'
            ))

            conn.commit()

            redis_client.delete(otp_key)
            redis_client.delete(user_data_key)

            return Response({'message': 'Account activated successfully. You can now log in.'}, status=201)

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({'error': f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            if conn: conn.rollback()
            return Response({'error': str(e)}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()