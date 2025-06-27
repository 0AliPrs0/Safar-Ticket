from rest_framework.views import APIView
from rest_framework.response import Response

class TravelOptionsView(APIView):
    def get(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)
            
        travel_classes = ['economy', 'business', 'VIP']
        
        return Response({
            'travel_classes': travel_classes
        })
