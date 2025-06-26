import MySQLdb
from django.http import JsonResponse
from django.views import View
import random
import redis 
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.email_utils import send_otp_email, send_payment_reminder_email 
import datetime
import hashlib 
from ..utils.jwt import generate_access_token, generate_refresh_token, verify_jwt
from rest_framework.permissions import IsAuthenticated
import json
from datetime import datetime, timedelta 
from django.http import JsonResponse

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class UserBookingsAPIView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        status_filter = request.query_params.get("status")

        if not user_id:
            return Response({"error": "user_id is required"}, status=400)

        try:
            conn = MySQLdb.connect(
                host="db",
                user="root",
                password="Aliprs2005",
                database="safarticket",
                port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            base_query = """
                SELECT 
                    r.reservation_id,
                    r.status AS reservation_status,
                    t.ticket_id,
                    t.seat_number,
                    tr.departure_time,
                    tr.arrival_time,
                    tr.return_time,
                    tr.is_round_trip,
                    tr.price,
                    tr.transport_type,
                    tr.travel_class
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                JOIN Travel tr ON t.travel_id = tr.travel_id
                WHERE r.user_id = %s
            """

            params = [user_id]
            now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            if status_filter == "future":
                base_query += " AND r.status = 'paid' AND tr.departure_time > %s"
                params.append(now_str)
            elif status_filter == "used":
                base_query += " AND r.status = 'paid' AND tr.departure_time <= %s"
                params.append(now_str)
            elif status_filter == "canceled":
                base_query += " AND r.status = 'canceled'"

            cursor.execute(base_query, tuple(params))
            rows = cursor.fetchall()

            results = []
            for row in rows:
                row['departure_time'] = row['departure_time'].isoformat() if isinstance(row.get('departure_time'), datetime) else str(row.get('departure_time'))
                row['arrival_time'] = row['arrival_time'].isoformat() if isinstance(row.get('arrival_time'), datetime) else str(row.get('arrival_time'))
                
                if row.get('is_round_trip') and row.get('return_time'):
                    row['return_time'] = row['return_time'].isoformat() if isinstance(row['return_time'], datetime) else str(row['return_time'])
                else:
                    row['return_time'] = None

                results.append(row)
                
            cursor.close()
            conn.close()

            return Response({"bookings": results})

        except Exception as e:
            return Response({"error": str(e)}, status=500)