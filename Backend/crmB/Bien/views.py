from datetime import datetime, timedelta
from django.shortcuts import render
from rest_framework import generics
from .models import Bien
from .serializers import BienSerializer
from rest_framework.decorators import api_view 
from rest_framework.response import Response
from rest_framework import permissions
from django.db import models
from django.db.models import Count, Q
from rest_framework.views import APIView

class BienListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BienSerializer
    def get_queryset(self):
        queryset = Bien.objects.all()

        reference = self.request.query_params.get('reference')
        is_validated = self.request.query_params.get('is_validated')
        ville = self.request.query_params.get('ville')
        budget_lead = self.request.query_params.get('budget_lead')
        type_bien = self.request.query_params.get('type_bien')
        type_transaction = self.request.query_params.get('type_transaction')
        quartiers = self.request.query_params.getlist('quartiers')
        chambres = self.request.query_params.getlist('chambres')
        statut_commercial = self.request.query_params.get('statut_commercial')
        prix_min = self.request.query_params.get('prix_min')
        prix_max = self.request.query_params.get('prix_max')
        surface = self.request.query_params.get('surface')
        degre = self.request.query_params.get('degre_importance')
        etat_bien = self.request.query_params.get('etat_bien')
        ascenseur = self.request.query_params.get('ascenseur')
        jardin = self.request.query_params.get('jardin')
        garage = self.request.query_params.get('garage')
        terrasse = self.request.query_params.get('terrasse')
        surface_min = self.request.query_params.get('surface_min')
        surface_max = self.request.query_params.get('surface_max')

        if reference :
            queryset = queryset.filter(
                models.Q(reference__icontains=reference) |
                models.Q(ville__icontains=reference) |
                models.Q(quartier__icontains=reference) |
                models.Q(adresse__icontains=reference)
            )
        if is_validated == 'false':
            queryset = queryset.filter(is_validated=False)
        elif is_validated == 'true':
            queryset = queryset.filter(is_validated=True)
        
        if ville:
            queryset = queryset.filter(ville__icontains=ville)
            
        if type_bien:
            queryset = queryset.filter(type_bien__iexact=type_bien)
            
        if type_transaction:
            if type_transaction.lower() == 'achat':
                queryset = queryset.filter(type_transaction__iexact='Vente')
            elif type_transaction.lower() == 'sarout':
                queryset = queryset.filter(type_transaction__iexact='Sarout')
            else:
                queryset = queryset.filter(type_transaction__iexact=type_transaction)
            
        if statut_commercial:
            queryset = queryset.filter(statut_commercial__iexact=statut_commercial)

        if surface:
            try:
                surface_value = float(surface)
                if surface_value == -1:
                    # Si surface est -1 (flexible), on ne filtre pas
                    pass
                else:
                    # Appliquer la marge de 15%
                    min_s = surface_value * 0.85
                    max_s = surface_value * 1.15
                    queryset = queryset.filter(superficie__gte=min_s, superficie__lte=max_s)
            except ValueError:
                pass

        if chambres:
            queryset = queryset.filter(nbr_chambre__in=chambres)
        
        if quartiers:
            if not any(q.lower() == 'tout' for q in quartiers):
                # Si "tout" n'est pas présent, filtrer normalement par quartiers
                queryset = queryset.filter(quartier__in=quartiers)
            
        if budget_lead:
            try:
                budget_value = float(budget_lead)
                if budget_value == -1:
                    # Si budget est -1 (flexible), on ne filtre pas
                    pass
                else:
                    # Appliquer la marge de 15%
                    min_price = budget_value * 0.85
                    max_price = budget_value * 1.15
                    queryset = queryset.filter(prix__gte=min_price, prix__lte=max_price)
            except ValueError:
                pass
        
        if prix_min:
            try:
                queryset = queryset.filter(prix__gte=float(prix_min))
            except ValueError:
                pass
                
        if prix_max:
            try:
                queryset = queryset.filter(prix__lte=float(prix_max))
            except ValueError:
                pass

        if surface_min:
            try:
                queryset = queryset.filter(superficie__gte=surface_min)
            except ValueError:
                pass
                
        if surface_max:
            try:
                queryset = queryset.filter(superficie__lte=float(surface_max))
            except ValueError:
                pass
        
        if degre:
            queryset = queryset.filter(degre_importance__iexact=degre)

        if etat_bien:
            if etat_bien.lower() == 'tous':
                pass
            else:
                queryset = queryset.filter(etat_bien__iexact=etat_bien)   
        
        if ascenseur:
            if ascenseur.lower() == 'true':
                queryset = queryset.filter(ascenseur=True)
            elif ascenseur.lower() == 'false':
                queryset = queryset.filter(ascenseur=False)
        if jardin:
            if jardin.lower() == 'true':
                queryset = queryset.filter(jardin=True)
            elif jardin.lower() == 'false':
                queryset = queryset.filter(jardin=False)
        if garage:
            if garage.lower() == 'true':
                queryset = queryset.filter(garage=True)
            elif garage.lower() == 'false':
                queryset = queryset.filter(garage=False)
        if terrasse:
            if terrasse.lower() == 'true':
                queryset = queryset.filter(terrasse=True)
            elif terrasse.lower() == 'false':
                queryset = queryset.filter(terrasse=False)
                
        return queryset.order_by('-date_creation') 
    
    def perform_create(self, serializer):
        
        bien = serializer.save(id_utilisateur=self.request.user)
        # Vérifier et notifier les leads conformes
        from Notifications.services import verifier_et_notifier_leads_conformes
        verifier_et_notifier_leads_conformes(bien)

class BienRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated] 
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    def perform_update(self, serializer):
        ancien_statut = self.get_object().statut_commercial  # On capture l'ancien statut_commercial
        bien = serializer.save()
        
        # Vérifie si le statut commercial a changé
        if bien.statut_commercial != ancien_statut:
            from Notifications.services import (
                notifier_leads_si_bien_non_disponible,
                verifier_et_notifier_leads_conformes
            )
            
            # Si le bien n'est plus disponible
            if ancien_statut.lower() == 'disponible' and bien.statut_commercial.lower() != 'disponible':
                notifier_leads_si_bien_non_disponible(bien, ancien_statut)
            
            # Si le bien redevient disponible
            elif bien.statut_commercial.lower() == 'disponible':
                verifier_et_notifier_leads_conformes(bien)

@api_view(['PATCH'])
def valider_bien(request, pk):
    try:
        bien = Bien.objects.get(pk=pk)
        bien.is_validated = True
        bien.save()
        return Response({'status': 'success'})
    except Bien.DoesNotExist:
        return Response({'status': 'error'}, status=404)

class BienStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        user = request.user
        date_debut = request.GET.get('date_debut')
        date_fin = request.GET.get('date_fin')
        mois = request.GET.get('mois')
        date_filters = Q()

        if date_debut and date_fin:
            try:
                date_debut_obj = datetime.strptime(date_debut, '%Y-%m-%d').date()
                date_fin_obj = datetime.strptime(date_fin, '%Y-%m-%d').date()
                
                if (date_fin_obj - date_debut_obj).days > 365:
                    return Response(
                        {"error": "La période ne peut pas dépasser 365 jours"}, 
                        status=400
                    )
                
                date_filters &= Q(date_creation__date__gte=date_debut_obj) & Q(date_creation__date__lte=date_fin_obj)
            except ValueError:
                return Response({"error": "Format de date invalide"}, status=400)
        
        elif mois:
            try:
                mois_obj = datetime.strptime(mois, '%Y-%m').date()
                date_debut_mois = mois_obj.replace(day=1)
                
                if mois_obj.month == 12:
                    date_fin_mois = mois_obj.replace(year=mois_obj.year+1, month=1, day=1)
                else:
                    date_fin_mois = mois_obj.replace(month=mois_obj.month+1, day=1)
                
                date_fin_mois = date_fin_mois - timedelta(days=1)
                
                date_filters &= Q(date_creation__date__gte=date_debut_mois) & Q(date_creation__date__lte=date_fin_mois)
            except ValueError:
                return Response({"error": "Format de mois invalide (YYYY-MM requis)"}, status=400)
        
        # Filtre de base pour les biens selon le rôle
        if user.role == 'admin':
            biens_query = Bien.objects.filter(date_filters) if date_filters else Bien.objects.all()
        else:
            biens_query = Bien.objects.filter(id_utilisateur=user)
            if date_filters:
                biens_query = biens_query.filter(date_filters)
        
        # Biens par commercial (seulement pour l'admin)
        if user.role == 'admin':
            biens_par_commercial_query = Bien.objects.filter(
                id_utilisateur__isnull=False
            )
            if date_filters:
                biens_par_commercial_query = biens_par_commercial_query.filter(date_filters)
                
            biens_par_commercial = biens_par_commercial_query.values(
                'id_utilisateur__id',
                'id_utilisateur__nom',
                'id_utilisateur__prenom'
            ).annotate(
                total_biens=Count('id')
            ).order_by('-total_biens')
        else:
            biens_par_commercial = []
        
        # Biens par statut commercial (filtrés selon le rôle)
        biens_par_statut = biens_query.values('statut_commercial').annotate(
            count=Count('id')
        )
        
        # Biens par type (filtrés selon le rôle)
        biens_par_type = biens_query.values('type_bien').annotate(
            count=Count('id')
        )
        
        # Biens par ville (filtrés selon le rôle)
        biens_par_ville = biens_query.values('ville').annotate(
            count=Count('id')
        ).order_by('-count')[:10]  # Top 10 villes
        
        data = {
            'total_biens': biens_query.count(),
            'biens_par_commercial': list(biens_par_commercial),
            'biens_par_statut': list(biens_par_statut),
            'biens_par_type': list(biens_par_type),
            'biens_par_ville': list(biens_par_ville),
            'filters_applied': {
                'date_debut': date_debut,
                'date_fin': date_fin,
                'mois': mois
            }
        }
        
        return Response(data)