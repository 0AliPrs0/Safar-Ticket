import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response

class SeatListAPIView(APIView):
    def get(self, request, travel_id):
        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            cursor.execute("SELECT total_capacity FROM Travel WHERE travel_id = %s", (travel_id,))
            travel_info = cursor.fetchone()

            if not travel_info:
                return Response({"error": f"Travel with ID {travel_id} not found."}, status=404)

            capacity = travel_info['total_capacity']

            cursor.execute("""
                SELECT t.seat_number 
                FROM Reservation r
                JOIN Ticket t ON r.ticket_id = t.ticket_id
                WHERE t.travel_id = %s AND (r.status = 'paid' OR (r.status = 'reserved' AND r.expiration_time > NOW()))
            """, (travel_id,))
            
            reserved_seats_tuples = cursor.fetchall()
            reserved_seat_numbers = {item['seat_number'] for item in reserved_seats_tuples}

            all_seats = []
            for seat_num in range(1, capacity + 1):
                all_seats.append({
                    "seat_number": seat_num,
                    "is_available": seat_num not in reserved_seat_numbers
                })

            return Response(all_seats)

        except MySQLdb.Error as e:
            return Response({"error": f"Database error in seat_list: {str(e)}"}, status=500)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred in seat_list: {str(e)}"}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
