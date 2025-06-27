import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response

class TravelOptionsView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)
            
        transport_type = request.query_params.get('transport_type', 'plane')
        options = []
        conn = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = conn.cursor()

            if transport_type == 'plane':
                # Querying the database is more robust than hardcoding
                cursor.execute("SELECT DISTINCT travel_class FROM Travel WHERE transport_type = 'plane' AND travel_class IS NOT NULL")
                options = [row[0] for row in cursor.fetchall()]
                # Fallback in case no plane tickets exist in the DB yet
                if not options:
                    options = ['economy', 'business', 'VIP']
                option_type = 'travel_class'

            elif transport_type == 'train':
                cursor.execute("SELECT DISTINCT train_rating FROM TrainDetail ORDER BY train_rating ASC")
                options = [row[0] for row in cursor.fetchall()]
                option_type = 'train_rating'

            elif transport_type == 'bus':
                cursor.execute("SELECT DISTINCT bus_type FROM BusDetail")
                options = [row[0] for row in cursor.fetchall()]
                option_type = 'bus_type'
            else:
                return Response({'error': 'Invalid transport type'}, status=400)
            
            return Response({
                'option_type': option_type,
                'options': options
            })
        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if conn:
                conn.close()
