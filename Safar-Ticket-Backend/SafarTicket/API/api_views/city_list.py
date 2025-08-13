import MySQLdb
from django.http import JsonResponse
from rest_framework.views import APIView
from ..utils.translations import CITIES_FA, translate_from_dict

class CityListView(APIView):
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'en')
        db = None
        try:
            db = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = db.cursor()
            
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