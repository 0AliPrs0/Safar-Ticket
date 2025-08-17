import MySQLdb
from django.http import JsonResponse
from rest_framework.views import APIView
from ..utils.translations import CITIES_FA, translate_from_dict
import os

class CityListView(APIView):
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'en')
        db = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
            )
            cursor = conn.cursor()
            
            cursor.execute("SELECT city_id, province_name, city_name FROM City")
            rows = cursor.fetchall()
            
            cities = []
            for row in rows:
                cities.append({
                    "city_id": row[0],
                    "province_name": row[1],
                    "city_name": translate_from_dict(row[2], lang, CITIES_FA)
                })

            return JsonResponse(cities, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        finally:
            if db:
                db.close()