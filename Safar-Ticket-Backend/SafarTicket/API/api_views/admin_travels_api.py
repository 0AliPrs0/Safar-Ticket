import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import os
from ..es_utils import index_travel_by_id

class AdminCreateTravelAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info or user_info.get('user_type') != 'ADMIN':
            return Response({"error": "Permission denied."}, status=403)

        data = request.data
        required_fields = [
            'transport_type', 'departure_terminal_id', 'destination_terminal_id',
            'departure_time', 'arrival_time', 'total_capacity',
            'company_name', 'price', 'travel_class'
        ]
        if not all(field in data for field in required_fields):
            return Response({"error": "Missing one or more required fields."}, status=400)

        is_round_trip = data.get('is_round_trip', False)
        return_time = data.get('return_time', None)

        if is_round_trip and not return_time:
            return Response({"error": "Return time is required for round trips."}, status=400)
        
        conn = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'), user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'), database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')), 
                cursorclass=MySQLdb.cursors.DictCursor,
                charset='utf8mb4',
                use_unicode=True
            )
            cursor = conn.cursor()

            cursor.execute("SELECT transport_company_id FROM TransportCompany WHERE company_name = %s", (data['company_name'],))
            company = cursor.fetchone()
            if not company:
                conn.rollback()
                return Response({"error": f"Transport company '{data['company_name']}' not found."}, status=404)
            transport_company_id = company['transport_company_id']
            
            query = """
                INSERT INTO Travel (
                    transport_type, departure_terminal_id, destination_terminal_id,
                    departure_time, arrival_time, total_capacity, remaining_capacity,
                    transport_company_id, price, travel_class, is_round_trip, return_time
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            params = (
                data['transport_type'], data['departure_terminal_id'], data['destination_terminal_id'],
                data['departure_time'], data['arrival_time'], data['total_capacity'], data['total_capacity'],
                transport_company_id, data['price'], data['travel_class'],
                is_round_trip, return_time
            )

            cursor.execute(query, params)
            conn.commit()
            
            new_travel_id = cursor.lastrowid

            try:
                index_travel_by_id(new_travel_id)
            except Exception as e:
                print(f"Failed to index new travel {new_travel_id}: {e}")

            return Response({"message": "Travel created successfully.", "travel_id": new_travel_id}, status=201)

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            if conn: conn.rollback()
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()
