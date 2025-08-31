from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegistrerSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur
from .models import Utilisateur_ville
from django.utils import timezone

import random
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

class RegistrerView(APIView):
    #permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = RegistrerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            for elem in request.data['villeChoisie']:
                utilisateur_ville = Utilisateur_ville.objects.create(
                    id_utilisateur = serializer.instance,
                    ville = elem
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        user = Utilisateur.objects.get(id=id)
        serializer = RegistrerSerializer(user, data = request.data)
        if serializer.is_valid():
            serializer.save()

            if 'villeChoisie' in request.data:
                # j'ai supprimer tous les anciants ville de ce utilisateur pour inserer les choix de villes après
                # pour un code simple et ne contient pas plusieurs cas pour traiter
                # pour qu'il est faible et facile au serveur
                Utilisateur_ville.objects.filter(id_utilisateur = id).delete()
                for elem in request.data.get('villeChoisie'):
                    Utilisateur_ville.objects.create(
                        id_utilisateur = serializer.instance,
                        ville = elem,
                    )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteView(APIView):
    permission_classe = [permissions.IsAuthenticated]

    def delete(self, request, id):
        Utilisateur.objects.get(id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReadView(APIView):
    permission_classe = [permissions.IsAuthenticated]
    def get(self, request, id):
        try:
            user = Utilisateur.objects.get(id=id)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegistrerSerializer(user)
        user_villes = Utilisateur_ville.objects.filter(id_utilisateur=user)

        # avant de transferet ces villes au front-end ont va d'abord de serialiser
        villes_data = [uv.ville for uv in user_villes]
        data = serializer.data
        data['villes_user'] = villes_data

        return Response(data, status=status.HTTP_200_OK)


class ReadAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        users = Utilisateur.objects.all()
        serializer = RegistrerSerializer(users, many=True)

        enriched_data = []
        # zip permet de parcourir plusieur tableau en parallèle
        for user, user_data in zip(users, serializer.data):
            villes = Utilisateur_ville.objects.filter(id_utilisateur=user)
            user_data['villes'] = [v.ville for v in villes]
            enriched_data.append(user_data)
        return Response(enriched_data, status=status.HTTP_200_OK)




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role  # ➜ important pour le frontend
        token['nom'] = user.nom
        token['utilisateur_id'] = user.id
        return token


    def validate(self, attrs):
        data = super().validate(attrs)
        data['utilisateur_id'] = self.user.id
        data['email'] = self.user.email
        data['role'] = self.user.role
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ListeCommerciauxAPIView(APIView):
    def get(self, request):
        commerciaux = Utilisateur.objects.filter(role='commercial')
        serializer = RegistrerSerializer(commerciaux, many=True)
        return Response(serializer.data)


#class OubliePassword(APIView):
    #def post(self,request):
#User = get_user_model()
class RessetPassword(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = Utilisateur.objects.get(email = email)
            user.set_reset_code()

            #code = str(random.randint(100000, 999999))
            send_mail(
                'Code de réinitialisation',
                f'Votre code de réinitialisation est : {user.code_reset}',
                'salahkhazri580@gmail.com',
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Code envoyé'}, status=200)  # À stocker côté frontend

        except Utilisateur.DoesNotExist:
            return Response({'error': 'Email non trouvé'}, status=404)


class VerifieCodeAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")

        try:
            user = Utilisateur.objects.get(email=email)

            if (
                user.code_reset == code and
                user.code_reset_expiration and
                user.code_reset_expiration > timezone.now()
            ):
                user.set_password(new_password)
                user.code_reset = None
                user.code_reset_expiration = None
                user.save()
                return Response({'message': 'Mot de passe modifié avec succès'}, status=200)
            else:
                return Response({'error': 'Code invalide ou expiré'}, status=400)

        except Utilisateur.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=404)