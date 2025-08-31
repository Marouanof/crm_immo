from rest_framework import serializers
from .models import Utilisateur, Utilisateur_ville
from Lead.models import Lead

class UtilisateurVilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur_ville
        fields = '__all__'

class RegistrerSerializer(serializers.ModelSerializer):
    #password = serializers.CharField(write_only=True)
    nbr_lead = serializers.SerializerMethodField(method_name="get_nb_leads")
    villes = serializers.SerializerMethodField(method_name="get_villes")

    class Meta:
        model = Utilisateur
        fields = ['id','nom', 'prenom', 'email', 'password', 'telephone', 'role', 'nbr_lead', 'villes']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        #fields = '__all__'


    def __init__(self, *args, **kwargs):
        super(RegistrerSerializer, self).__init__(*args, **kwargs)
        # Si instance existe => c’est un update => password pas requis
        if self.instance is not None:
            self.fields['password'].required = False

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(**validated_data)
        return user

    def get_nb_leads(self, obj):
        return Lead.objects.filter(id_utilisateur=obj).count()
    def get_villes(self, obj):
        villes = Utilisateur_ville.objects.filter(id_utilisateur=obj)
        return [v.ville for v in villes]
    
    # def update(self, instance, validated_data):
    #     password = validated_data.pop('password', None)
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     if password:
    #         instance.set_password(password)
    #     instance.save()
    #     return instance

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'role']