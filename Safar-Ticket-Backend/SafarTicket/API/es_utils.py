from elasticsearch import Elasticsearch
import os
import MySQLdb

es_host = os.environ.get("ES_HOST", "localhost")
es_client = Elasticsearch(f"http://{es_host}:9200", request_timeout=30)
INDEX_NAME = 'travels'

def get_db_connection():
    return MySQLdb.connect(
        host="db", 
        user="root", 
        password="Aliprs2005",
        database="safarticket", 
        port=3306,
        cursorclass=MySQLdb.cursors.DictCursor
    )

def setup_index():
    if not es_client.indices.exists(index=INDEX_NAME):
        mappings = {
            "properties": {
                "travel_id": {"type": "integer"},
                "transport_type": {"type": "keyword"},
                "departure_city_name": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}
                },
                "destination_city_name": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}
                },
                "departure_time": {"type": "date"},
                "arrival_time": {"type": "date"},
                "return_time": {"type": "date"},
                "is_round_trip": {"type": "boolean"},
                "price": {"type": "float"},
                "travel_class": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}
                },
                "remaining_capacity": {"type": "integer"},
                "transport_company_name": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}
                }
            }
        }
        es_client.indices.create(index=INDEX_NAME, mappings=mappings)

def index_travel_by_id(travel_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT
                tr.travel_id, tr.transport_type,
                dep_city.city_name AS departure_city_name,
                dest_city.city_name AS destination_city_name,
                tr.departure_time, tr.arrival_time, tr.return_time, tr.is_round_trip,
                tr.price, tr.travel_class, tr.remaining_capacity,
                tc.company_name AS transport_company_name
            FROM Travel tr
            JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
            JOIN City dep_city ON dep_term.city_id = dep_city.city_id
            JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
            JOIN City dest_city ON dest_term.city_id = dest_city.city_id
            LEFT JOIN TransportCompany tc ON tr.transport_company_id = tc.transport_company_id
            WHERE tr.travel_id = %s
        """
        cursor.execute(query, (travel_id,))
        travel_data = cursor.fetchone()

        if travel_data:
            for key in ['departure_time', 'arrival_time', 'return_time']:
                if travel_data.get(key):
                    travel_data[key] = travel_data[key].isoformat()
            
            if 'price' in travel_data and travel_data['price'] is not None:
                travel_data['price'] = float(travel_data['price'])
            
            if 'is_round_trip' in travel_data and travel_data['is_round_trip'] is not None:
                travel_data['is_round_trip'] = bool(travel_data['is_round_trip'])

            es_client.index(index=INDEX_NAME, id=travel_id, document=travel_data)

    except Exception as e:
        print(f"Error indexing travel ID {travel_id}: {e}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def delete_travel_from_index(travel_id):
    try:
        es_client.delete(index=INDEX_NAME, id=travel_id)
    except Exception as e:
        print(f"Error deleting travel ID {travel_id} from index: {e}")
