from django.core.management.base import BaseCommand
from API.models import Travel
from API.es_utils import index_travel, setup_index
from elasticsearch import Elasticsearch
import os

class Command(BaseCommand):
    help = 'Indexes all existing Travel data into Elasticsearch'

    def handle(self, *args, **options):
        self.stdout.write('Checking Elasticsearch connection and index setup...')
        es_host = os.environ.get("ES_HOST", "localhost")
        es_client = Elasticsearch(f"http://{es_host}:9200")
        
        if not es_client.ping():
            self.stderr.write('Could not connect to Elasticsearch.')
            return
            
        setup_index()
        self.stdout.write('Starting to index all Travel objects...')
        
        all_travels = Travel.objects.select_related(
            'departure_terminal__city',
            'destination_terminal__city',
            'transport_company'
        ).all()
        
        count = 0
        for travel in all_travels:
            try:
                index_travel(travel)
                count += 1
            except Exception as e:
                self.stderr.write(f'Could not index travel {travel.travel_id}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Successfully indexed {count} travel objects.'))
