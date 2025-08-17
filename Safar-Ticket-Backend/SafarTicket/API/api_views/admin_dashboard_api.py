import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date, timedelta
import os

class AdminDashboardStatsAPIView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)
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
            cursor.execute("SELECT COUNT(*) as total_users FROM User WHERE user_type = 'CUSTOMER'")
            total_users = cursor.fetchone()['total_users']
            today_str = date.today().strftime('%Y-%m-%d')
            cursor.execute("SELECT COUNT(*) as bookings_today FROM Reservation WHERE DATE(reservation_time) = %s", (today_str,))
            bookings_today = cursor.fetchone()['bookings_today']
            cursor.execute("SELECT COUNT(*) as pending_cancellations FROM Reservation WHERE status = 'cancellation_pending'")
            pending_cancellations = cursor.fetchone()['pending_cancellations']
            cursor.execute("SELECT COUNT(*) as open_reports FROM Report WHERE status = 'pending'")
            open_reports = cursor.fetchone()['open_reports']
            stats = {
                "total_users": total_users,
                "bookings_today": bookings_today,
                "pending_cancellations": pending_cancellations,
                "open_reports": open_reports
            }
            return Response(stats)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()

class AdminSalesChartAPIView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)
        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor()
            chart_data = {'labels': [], 'data': []}
            for i in range(29, -1, -1): # Changed to 30 days
                day = date.today() - timedelta(days=i)
                day_str = day.strftime('%Y-%m-%d')
                chart_data['labels'].append(day.strftime('%m-%d')) # Format as Month-Day
                
                cursor.execute("""
                    SELECT SUM(amount) as daily_total 
                    FROM Payment 
                    WHERE DATE(payment_date) = %s AND payment_status = 'completed'
                """, (day_str,))
                result = cursor.fetchone()
                chart_data['data'].append(float(result['daily_total']) if result['daily_total'] else 0)
            
            return Response(chart_data)
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()