from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import os
import json
from elasticsearch import Elasticsearch

es_host = os.environ.get("ES_HOST", "localhost")
es_client = Elasticsearch(f"http://{es_host}:9200", request_timeout=30)
INDEX_NAME = 'travels'

class SearchTicketsAPIView(APIView):
    def post(self, request):
        data = request.data
        print(f"Incoming search data: {json.dumps(data, indent=2)}")

        origin_city_name = data.get('origin_city_name')
        destination_city_name = data.get('destination_city_name')
        travel_date_str = data.get('travel_date')

        transport_type = data.get('transport_type')
        min_price = data.get('min_price')
        max_price = data.get('max_price')
        company_name = data.get('company_name')
        travel_class = data.get('travel_class')
        is_round_trip = data.get('is_round_trip')
        if is_round_trip == False:
            is_round_trip = None


        if not all([origin_city_name, destination_city_name, travel_date_str]):
            return Response({'error': 'Origin, destination, and travel date are required.'}, status=400)

        try:
            travel_date = datetime.strptime(travel_date_str, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Invalid travel_date format. Use YYYY-MM-DD.'}, status=400)

        try:
            query_filters = []
            query_filters.append({"match": {"departure_city_name": origin_city_name}})
            query_filters.append({"match": {"destination_city_name": destination_city_name}})
            
            query_filters.append({
                "range": {
                    "departure_time": {
                        "gte": travel_date.isoformat(),
                        "lt": (travel_date + timedelta(days=1)).isoformat()
                    }
                }
            })
            
            query_filters.append({"range": {"remaining_capacity": {"gt": 0}}})

            if transport_type:
                query_filters.append({"term": {"transport_type": transport_type}})
            
            price_range = {}
            if min_price is not None and min_price != '':
                price_range["gte"] = float(min_price)
            if max_price is not None and max_price != '':
                price_range["lte"] = float(max_price)
            if price_range:
                query_filters.append({"range": {"price": price_range}})

            if company_name:
                query_filters.append({"term": {"transport_company_name.keyword": company_name}})
                
            if travel_class:
                query_filters.append({"match": {"travel_class": travel_class}})
            
            if is_round_trip is not None:
                query_filters.append({"term": {"is_round_trip": bool(is_round_trip)}})

            es_query = {
                "query": {
                    "bool": {
                        "filter": query_filters
                    }
                },
                "sort": [
                    {"departure_time": "asc"},
                    {"price": "asc"}
                ],
                "size": 100
            }
            
            print(f"Elasticsearch query: {json.dumps(es_query, indent=2)}")
            
            response = es_client.search(index=INDEX_NAME, body=es_query)
            results = [hit['_source'] for hit in response['hits']['hits']]

            return Response(results, status=200)

        except Exception as e:
            print(f"Error during search: {e}")
            return Response({"error": f"An unexpected search error occurred: {str(e)}"}, status=500)
