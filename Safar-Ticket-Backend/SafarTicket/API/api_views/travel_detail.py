import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import json

class TravelDetailAPIView(APIView):
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

            main_query = """
                SELECT 
                    tr.travel_id, tr.price, tr.transport_type, tr.travel_class,
                    tr.departure_time, tr.arrival_time, tr.return_time, tr.is_round_trip,
                    tr.remaining_capacity
                FROM Travel tr
                WHERE tr.travel_id = %s
            """
            cursor.execute(main_query, (travel_id,))
            travel_details = cursor.fetchone()

            if not travel_details:
                return Response({"error": "Travel not found"}, status=404)

            # Add other details like company name, cities etc.
            # This part can be optimized, but is broken down for clarity
            
            cursor.execute("SELECT company_name FROM TransportCompany tc JOIN Travel tr ON tc.transport_company_id = tr.transport_company_id WHERE tr.travel_id = %s", (travel_id,))
            company_info = cursor.fetchone()
            travel_details['transport_company_name'] = company_info['company_name'] if company_info else 'N/A'

            cursor.execute("SELECT c.city_name FROM City c JOIN Terminal t ON c.city_id = t.city_id JOIN Travel tr ON t.terminal_id = tr.departure_terminal_id WHERE tr.travel_id = %s", (travel_id,))
            dep_city_info = cursor.fetchone()
            travel_details['departure_city'] = dep_city_info['city_name'] if dep_city_info else 'N/A'
            
            cursor.execute("SELECT c.city_name FROM City c JOIN Terminal t ON c.city_id = t.city_id JOIN Travel tr ON t.terminal_id = tr.destination_terminal_id WHERE tr.travel_id = %s", (travel_id,))
            dest_city_info = cursor.fetchone()
            travel_details['destination_city'] = dest_city_info['city_name'] if dest_city_info else 'N/A'


            cursor.execute("SELECT vehicle_id FROM Ticket WHERE travel_id = %s LIMIT 1", (travel_id,))
            ticket_info = cursor.fetchone()
            
            facilities = {}
            if ticket_info:
                vehicle_id = ticket_info['vehicle_id']
                
                cursor.execute("SELECT vehicle_type FROM VehicleDetail WHERE vehicle_id = %s", (vehicle_id,))
                vehicle_info = cursor.fetchone()

                if vehicle_info:
                    vehicle_type = vehicle_info['vehicle_type']
                    
                    detail_table = ""
                    pk_name = ""
                    if vehicle_type == 'flight':
                        detail_table = "FlightDetail"
                        pk_name = "flight_id"
                    elif vehicle_type == 'train':
                        detail_table = "TrainDetail"
                        pk_name = "train_id"
                    elif vehicle_type == 'bus':
                        detail_table = "BusDetail"
                        pk_name = "bus_id"
                    
                    if detail_table:
                        facilities_query = f"SELECT facilities FROM {detail_table} WHERE {pk_name} = %s"
                        cursor.execute(facilities_query, (vehicle_id,))
                        facilities_result = cursor.fetchone()
                        
                        if facilities_result and facilities_result.get('facilities'):
                            facilities = json.loads(facilities_result['facilities'])

            travel_details['facilities'] = facilities

            for key in ['departure_time', 'arrival_time', 'return_time']:
                if travel_details.get(key):
                    travel_details[key] = travel_details[key].isoformat()

            return Response(travel_details)

        except MySQLdb.Error as e:
            return Response({"error": f"Database error during detail fetch: {str(e)}"}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()