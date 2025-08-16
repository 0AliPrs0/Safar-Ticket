import jwt
import datetime
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY

def generate_access_token(user_id, email, user_type): # Added user_type parameter
    payload = {
        'token_type': 'access',
        'user_id': user_id,
        'email': email,
        'user_type': user_type, # Added user_type to payload
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60), # Increased expiration for better UX
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def generate_refresh_token(user_id):
    payload = {
        'token_type': 'refresh',
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7), # Increased expiration
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def verify_jwt(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None