from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Travel
from .es_utils import index_travel, delete_travel_from_index

@receiver(post_save, sender=Travel)
def update_travel_in_es(sender, instance, **kwargs):
    index_travel(instance)

@receiver(post_delete, sender=Travel)
def delete_travel_in_es(sender, instance, **kwargs):
    delete_travel_from_index(instance)
