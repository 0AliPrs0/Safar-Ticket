import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response

class AdminReportsListView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor,
                charset='utf8mb4', use_unicode=True
            )
            cursor = conn.cursor()
            
            query = """
                SELECT r.report_id, r.report_category, r.report_text, r.status, r.report_time,
                       r.report_response, u.email as user_email
                FROM Report r
                JOIN User u ON r.user_id = u.user_id
                ORDER BY 
                    CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END ASC, 
                    r.report_time DESC
            """
            cursor.execute(query)
            reports = cursor.fetchall()
            
            for report in reports:
                if report.get('report_time'):
                    report['report_time'] = report['report_time'].isoformat() + "Z"
            
            return Response(reports)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()