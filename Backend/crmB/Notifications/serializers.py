from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'titre', 'message', 'bien', 'lead', 'lu', 'date_creation']
        read_only_fields = ['id', 'titre', 'message', 'bien', 'lead', 'date_creation']
