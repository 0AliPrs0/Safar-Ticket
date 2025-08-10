from elasticsearch import Elasticsearch
import os

es_host = os.environ.get("ES_HOST", "localhost")
es_client = Elasticsearch(f"http://{es_host}:9200")
INDEX_NAME = 'travels'

def setup_index():
    if not es_client.indices.exists(index=INDEX_NAME):
        mappings = {
            "properties": {
                "travel_id": {"type": "integer"},
                "transport_type": {"type": "keyword"},
                "departure_city_name": {"type": "keyword"},
                "destination_city_name": {"type": "keyword"},
                "departure_time": {"type": "date"},
                "arrival_time": {"type": "date"},
                "return_time": {"type": "date"},
                "is_round_trip": {"type": "boolean"},
                "price": {"type": "float"},
                "travel_class": {"type": "keyword"},
                "remaining_capacity": {"type": "integer"},
                "transport_company_name": {"type": "keyword"}
            }
        }
        es_client.indices.create(index=INDEX_NAME, mappings=mappings)

def index_travel(travel_instance):
    setup_index()
    body = {
        "travel_id": travel_instance.travel_id,
        "transport_type": travel_instance.transport_type,
        "departure_city_name": travel_instance.departure_terminal.city.city_name,
        "destination_city_name": travel_instance.destination_terminal.city.city_name,
        "departure_time": travel_instance.departure_time,
        "arrival_time": travel_instance.arrival_time,
        "return_time": travel_instance.return_time,
        "is_round_trip": travel_instance.is_round_trip,
        "price": float(travel_instance.price),
        "travel_class": travel_instance.travel_class,
        "remaining_capacity": travel_instance.remaining_capacity,
        "transport_company_name": travel_instance.transport_company.company_name if travel_instance.transport_company else None
    }
    es_client.index(index=INDEX_NAME, id=travel_instance.travel_id, document=body)

def delete_travel_from_index(travel_instance):
    try:
        es_client.delete(index=INDEX_NAME, id=travel_instance.travel_id)
    except Exception:
        pass
