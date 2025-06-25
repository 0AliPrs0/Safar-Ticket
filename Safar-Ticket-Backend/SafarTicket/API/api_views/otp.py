import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import json
import redis
import sys

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class VerifyEmailAPIView(APIView):
    def get(self, request, token):
        redis_key = f"verify_token:{token}"
        user_data_json = redis_client.get(redis_key)
        
        if not user_data_json:
            return Response(
                {'error': 'Invalid or expired verification link. Please try to register again.'}, 
                status=400
            )
        
        redis_client.delete(redis_key)
        user_data = json.loads(user_data_json)
        
        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = conn.cursor()
            
            cursor.execute("SELECT user_id FROM User WHERE email = %s", (user_data['email'],))
            if cursor.fetchone():
                return Response({'error': 'This account has already been verified.'}, status=400)
            
            query = """
                INSERT INTO User (first_name, last_name, email, phone_number, password_hash, user_type, city_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                user_data['first_name'],
                user_data['last_name'],
                user_data['email'],
                user_data['phone_number'],
                user_data['password_hash'],
                'CUSTOMER',
                1
            )

            cursor.execute(query, values)
            conn.commit()
            
            return Response({"message": "Email verified successfully. You can now log in."}, status=200)

        except MySQLdb.Error as e:
            return Response({'error': f"Database error during final verification: {str(e)}"}, status=500)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
