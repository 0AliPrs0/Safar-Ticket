from rest_framework.views import APIView
from rest_framework.response import Response

class TransportCompanyListView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)
        
        transport_type = request.query_params.get('transport_type', None)

        conn = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = conn.cursor()

            query = "SELECT DISTINCT company_name FROM TransportCompany"
            params = []

            if transport_type:
                # 'plane' در دیتابیس شما معادل 'airplane' است
                db_transport_type = 'airplane' if transport_type == 'plane' else transport_type
                query += " WHERE transport_type = %s"
                params.append(db_transport_type)
            
            query += " ORDER BY company_name ASC"
            
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            companies = [row[0] for row in rows]
            return Response(companies)
            
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()
