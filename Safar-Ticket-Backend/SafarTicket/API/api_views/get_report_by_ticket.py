import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
import os


class GetReportByTicketAPIView(APIView):
    def get(self, request, ticket_id):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        conn = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()

            query = """
                SELECT 
                    r.report_id, r.report_category, r.report_text, r.status, r.report_time, r.report_response,
                    u.first_name, u.last_name, u.profile_image_url
                FROM Report r
                JOIN User u ON r.user_id = u.user_id
                WHERE r.ticket_id = %s AND r.user_id = %s
            """
            
            cursor.execute(query, (ticket_id, user_id))
            report = cursor.fetchone()

            if not report:
                return Response({"error": "Report not found for this ticket."}, status=404)
            
            # Fix encoding for text fields
            report['first_name'] = report.get('first_name')
            report['last_name'] = report.get('last_name')
            report['report_text'] = report.get('report_text')
            report['report_response'] = report.get('report_response')

            if isinstance(report.get('report_time'), datetime):
                report['report_time'] = report['report_time'].isoformat() + "Z"

            return Response(report)
        except MySQLdb.Error as e:
            return Response({"error": f"Database query error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()