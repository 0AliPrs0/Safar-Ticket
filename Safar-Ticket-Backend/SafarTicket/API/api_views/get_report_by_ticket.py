import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class GetReportByTicketAPIView(APIView):
    def get(self, request, ticket_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            query = """
                SELECT report_id, report_category, report_text, status, report_time, report_response
                FROM Report
                WHERE ticket_id = %s AND user_id = %s
            """
            
            cursor.execute(query, (ticket_id, user_id))
            report = cursor.fetchone()

            if not report:
                return Response({"error": "Report not found for this ticket."}, status=404)
            
            if isinstance(report.get('report_time'), datetime):
                report['report_time'] = report['report_time'].isoformat() + "Z"

            return Response(report)

        except MySQLdb.Error as e:
            return Response({"error": f"Database query error: {str(e)}"}, status=500)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
