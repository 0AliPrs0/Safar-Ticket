import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils.translations import COMPANIES_FA, translate_from_dict
import os

class TransportCompanyListView(APIView):
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'en')
        transport_type = request.query_params.get('transport_type', None)
        conn = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
            )
            cursor = conn.cursor()
            
            query = "SELECT DISTINCT company_name FROM TransportCompany"
            params = []
            if transport_type:
                db_transport_type = 'airplane' if transport_type == 'plane' else transport_type
                query += " WHERE transport_type = %s"
                params.append(db_transport_type)
            
            query += " ORDER BY company_name ASC"
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            
            companies = [translate_from_dict(row[0], lang, COMPANIES_FA) for row in rows]
            return Response(companies)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()