from django.core.management.base import BaseCommand
from API.es_utils import setup_index, get_db_connection, index_travel_by_id
from elasticsearch import Elasticsearch
import os
import time

class Command(BaseCommand):
    help = 'Deletes and re-indexes all existing Travel data into Elasticsearch'

    def handle(self, *args, **options):
        es_host = os.environ.get("ES_HOST", "localhost")
        es_client = None
        
        self.stdout.write('Waiting for Elasticsearch connection...')
        retries = 10
        while retries > 0:
            try:
                es_client = Elasticsearch(f"http://{es_host}:9200", request_timeout=30)
                if es_client.ping():
                    self.stdout.write(self.style.SUCCESS('Elasticsearch connection successful.'))
                    break
            except Exception:
                self.stdout.write(f'Connection failed, retrying in 5 seconds... ({retries-1} retries left)')
                retries -= 1
                time.sleep(5)
        
        if not es_client or not es_client.ping():
            self.stderr.write('Could not connect to Elasticsearch after several retries. Aborting.')
            return

        self.stdout.write('Deleting old index if it exists...')
        es_client.indices.delete(index='travels', ignore=[400, 404])

        setup_index()
        self.stdout.write('Starting to index all Travel objects from database...')
        
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT travel_id FROM Travel")
            all_travel_ids = [row['travel_id'] for row in cursor.fetchall()]
            
            count = 0
            total = len(all_travel_ids)
            self.stdout.write(f'Found {total} travels to index.')
            
            for travel_id in all_travel_ids:
                try:
                    index_travel_by_id(travel_id)
                    count += 1
                except Exception as e:
                    self.stderr.write(f'Could not index travel {travel_id}: {e}')
            
            self.stdout.write(self.style.SUCCESS(f'Successfully indexed {count} out of {total} travel objects.'))

        except Exception as e:
            self.stderr.write(f'A database error occurred: {e}')
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
