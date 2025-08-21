import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import os

class TransportCompanyListView(APIView):
    def get(self, request):
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
            
            query = "SELECT DISTINCT company_name FROM TransportCompany ORDER BY company_name"
            cursor.execute(query)
            
            companies = [row['company_name'] for row in cursor.fetchall()]
            
            return Response(companies)
            
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()
