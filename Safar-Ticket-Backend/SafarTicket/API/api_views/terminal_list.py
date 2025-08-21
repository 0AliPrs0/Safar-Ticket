import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import os

class TerminalListView(APIView):
    def get(self, request):
        city_id = request.query_params.get('city_id')
        transport_type = request.query_params.get('transport_type')

        if not city_id:
            return Response({"error": "city_id query parameter is required."}, status=400)

        conn = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
                cursorclass=MySQLdb.cursors.DictCursor,
                charset='utf8mb4',
                use_unicode=True
            )
            cursor = conn.cursor()
            
            # --- FIX: Add filtering based on transport_type ---
            query = "SELECT terminal_id, terminal_name FROM Terminal WHERE city_id = %s"
            params = [city_id]

            if transport_type:
                type_map = {
                    'plane': 'airport',
                    'train': 'train_station',
                    'bus': 'bus_terminal'
                }
                db_terminal_type = type_map.get(transport_type)
                if db_terminal_type:
                    query += " AND terminal_type = %s"
                    params.append(db_terminal_type)
            
            query += " ORDER BY terminal_name"

            cursor.execute(query, tuple(params))
            terminals = cursor.fetchall()
            return Response(terminals)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()