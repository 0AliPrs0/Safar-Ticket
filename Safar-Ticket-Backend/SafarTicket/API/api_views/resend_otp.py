import redis
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import timedelta
import random
from ..utils.email_utils import send_otp_email

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class ResendOtpAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=400)

        try:
            temp_user_key = f"temp_user:{email}"
            if not redis_client.exists(temp_user_key):
                return Response({'error': 'No pending verification found for this email. Please register again.'}, status=404)

            otp = str(random.randint(100000, 999999))
            
            redis_client.setex(f"signup_otp:{email}", timedelta(minutes=5), otp)
            
            send_otp_email(email, otp)
            
            return Response({'message': 'A new OTP has been sent to your email.'}, status=200)

        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
