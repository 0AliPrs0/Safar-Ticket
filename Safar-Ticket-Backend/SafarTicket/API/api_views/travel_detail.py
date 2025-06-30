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

            # مرحله ۱: گرفتن اطلاعات اصلی سفر (کوئری‌ای که می‌دانیم کار می‌کند)
            main_query = """
                SELECT 
                    tr.travel_id, tr.price, tr.transport_type, tr.travel_class,
                    tr.departure_time, tr.arrival_time, tr.return_time, tr.is_round_trip,
                    tc.company_name AS transport_company_name,
                    dep_city.city_name AS departure_city,
                    dest_city.city_name AS destination_city
                FROM Travel tr
                LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
                LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                WHERE tr.travel_id = %s
            """
            cursor.execute(main_query, (travel_id,))
            travel_details = cursor.fetchone()

            if not travel_details:
                return Response({"error": "Travel not found"}, status=404)

            # مرحله ۲: پیدا کردن وسیله نقلیه (vehicle) مربوط به این سفر
            # برای این کار از جدول Ticket استفاده می‌کنیم
            cursor.execute("SELECT vehicle_id FROM Ticket WHERE travel_id = %s LIMIT 1", (travel_id,))
            ticket_info = cursor.fetchone()
            
            facilities = {}
            if ticket_info:
                vehicle_id = ticket_info['vehicle_id']
                
                # مرحله ۳: پیدا کردن نوع وسیله نقلیه (flight, train, or bus)
                cursor.execute("SELECT vehicle_type FROM VehicleDetail WHERE vehicle_id = %s", (vehicle_id,))
                vehicle_info = cursor.fetchone()

                if vehicle_info:
                    vehicle_type = vehicle_info['vehicle_type']
                    # بر اساس نوع وسیله نقلیه، از جدول مخصوص به خودش اطلاعات را می‌خوانیم
                    
                    detail_table = ""
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
                        # مرحله ۴: گرفتن اطلاعات facilities از جدول صحیح
                        # استفاده از f-string اینجا امن است چون نام جدول از ورودی کاربر نمی‌آید
                        facilities_query = f"SELECT facilities FROM {detail_table} WHERE {pk_name} = %s"
                        cursor.execute(facilities_query, (vehicle_id,))
                        facilities_result = cursor.fetchone()
                        
                        if facilities_result and facilities_result.get('facilities'):
                            # دیتابیس یک رشته JSON برمی‌گرداند، ما آن را به آبجکت پایتون تبدیل می‌کنیم
                            facilities = json.loads(facilities_result['facilities'])

            # افزودن facilities به نتیجه نهایی
            travel_details['facilities'] = facilities

            # تبدیل آبجکت‌های datetime به رشته برای پاسخ نهایی
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