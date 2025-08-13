import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import json
from ..utils.translations import CITIES_FA, COMPANIES_FA, TERMINALS_FA, translate_from_dict

class TravelDetailAPIView(APIView):
    def get(self, request, travel_id):
        lang = request.headers.get('Accept-Language', 'en')
        conn = None
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
                    tr.remaining_capacity,
                    tc.company_name AS transport_company_name,
                    c_dep.city_name AS departure_city,
                    c_dest.city_name AS destination_city
                FROM Travel tr
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal t_dep ON tr.departure_terminal_id = t_dep.terminal_id
                LEFT JOIN City c_dep ON t_dep.city_id = c_dep.city_id
                LEFT JOIN Terminal t_dest ON tr.destination_terminal_id = t_dest.terminal_id
                LEFT JOIN City c_dest ON t_dest.city_id = c_dest.city_id
                WHERE tr.travel_id = %s
            """
            cursor.execute(main_query, (travel_id,))
            travel_details = cursor.fetchone()

            if not travel_details:
                return Response({"error": "Travel not found"}, status=404)
            
            travel_details['transport_company_name'] = translate_from_dict(travel_details['transport_company_name'], lang, COMPANIES_FA)
            travel_details['departure_city'] = translate_from_dict(travel_details['departure_city'], lang, CITIES_FA)
            travel_details['destination_city'] = translate_from_dict(travel_details['destination_city'], lang, CITIES_FA)
            
            cursor.execute("SELECT vehicle_id FROM Ticket WHERE travel_id = %s LIMIT 1", (travel_id,))
            ticket_info = cursor.fetchone()
            
            facilities = {}
            if ticket_info:
                vehicle_id = ticket_info['vehicle_id']
                cursor.execute("SELECT vehicle_type FROM VehicleDetail WHERE vehicle_id = %s", (vehicle_id,))
                vehicle_info = cursor.fetchone()
                if vehicle_info:
                    vehicle_type_map = {'flight': "FlightDetail", 'train': "TrainDetail", 'bus': "BusDetail"}
                    pk_map = {'flight': "flight_id", 'train': "train_id", 'bus': "bus_id"}
                    detail_table = vehicle_type_map.get(vehicle_info['vehicle_type'])
                    pk_name = pk_map.get(vehicle_info['vehicle_type'])
                    if detail_table:
                        cursor.execute(f"SELECT facilities FROM {detail_table} WHERE {pk_name} = %s", (vehicle_id,))
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
            if conn:
                conn.close()