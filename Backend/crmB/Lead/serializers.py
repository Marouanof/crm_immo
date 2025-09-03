from rest_framework import serializers
from .models import Lead, Quartier, Rappels, Lead_bien, RDV, Commentaire  # adapte selon tes modèles

from Utilisateur.models import Utilisateur
from Utilisateur.serializers import UtilisateurSerializer
from Bien.models import Bien
from Bien.serializers import BienSerializer

class QuartierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quartier
        fields = '__all__'

class RappelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rappels
        fields = '__all__'
        extra_kwargs = {
            'id_lead': {'write_only': True}  # Empêche l'affichage dans l'API
        }

class RDVSerializer(serializers.ModelSerializer):
    class Meta:
        model = RDV
        fields = '__all__'

class LeadBienSerializer(serializers.ModelSerializer):
    bien = BienSerializer(source='id_bien', read_only=True) 
    class Meta:
        model = Lead_bien
        fields = '__all__'

class CommentaireSerializer(serializers.ModelSerializer):
    utilisateur = serializers.CharField(source='id_utilisateur.nom', read_only=True)
    
    class Meta:
        model = Commentaire
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    #quartiers = serializers.SerializerMethodField()
    quartiers = QuartierSerializer(many=True)
    rappels_set = RappelSerializer(many=True, read_only=True)
    dernier_rappel = serializers.SerializerMethodField()
    rdv_set = RDVSerializer(many=True,read_only=True)
    dernier_rdv = serializers.SerializerMethodField()
    commercial = UtilisateurSerializer(source='id_utilisateur', read_only=True)
    biens_associes = LeadBienSerializer(source='lead_bien_set', many=True, read_only=True)
    commentaires = CommentaireSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id',
            'id_utilisateur',
            'commercial',
            'nom',
            'prenom',
            'telephone',
            'email',
            'type_bien',
            'type_transaction',
            'budget',
            'surface',
            'urgence',
            'source',
            'degre_interet',
            'statut',
            'quartiers',
            'rappels_set',
            'dernier_rappel',
            'rdv_set',
            'dernier_rdv',
            'biens_associes',
            'commentaires',
            'etat_bien',
            'ascenseur',
            'jardin',
            'terrasse',
            'garage',
            'balcon',
            'parking',
            'piscine',
            'meuble',
            'date_creation'    
        ]

    def update(self, instance, validated_data):
        quartiers_data = validated_data.pop('quartiers', [])

        # Mettre à jour les champs simples du lead
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    #def get_quartiers(self, obj):
    #    quartiers = Quartier.objects.filter(id_lead=obj)
    #    return QuartierSerializer(quartiers, many=True).data
    def get_dernier_rappel(self, obj):
        dernier = obj.rappels_set.order_by('-id').first()
        return RappelSerializer(dernier).data if dernier else None
    def get_dernier_rdv(self, obj):
        dernier = obj.rdv_set.order_by('-id').first()
        return RDVSerializer(dernier).data if dernier else None
