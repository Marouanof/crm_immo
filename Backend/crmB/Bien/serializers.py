from rest_framework import serializers 
from .models import Bien
from Utilisateur.models import Utilisateur

class BienSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.CharField(source='id_utilisateur.nom', read_only=True)
    responsable_prenom = serializers.CharField(source='id_utilisateur.prenom', read_only=True)

    class Meta:
        model = Bien
        fields = '__all__'
        read_only_fields = ('id_utilisateur',)