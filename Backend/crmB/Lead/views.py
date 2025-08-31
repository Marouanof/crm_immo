from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Lead, Quartier, Lead_bien, Rappels, RDV, Commentaire
from Utilisateur.models import Utilisateur, Utilisateur_ville
from Bien.models import Bien
from django.db.models import Count,Q
from django.utils import timezone
from datetime import timedelta, datetime, date

from django.utils.timezone import now

from .serializers import LeadSerializer,RappelSerializer,LeadBienSerializer,RDVSerializer,CommentaireSerializer

@csrf_exempt
def ajouter_nouveau_lead(request):
    if request.method == "POST":
        data = json.loads(request.body)
        #utilisateur = Utilisateur.objects.first()

        try:
            # Filtrer les commerciaux dans la même ville
            commerciaux = Utilisateur.objects.filter(role="commercial", ville=data['ville'])



            commercial = None

            if commerciaux.exists():
                # Trouver le commercial avec le moins de leads
                commercial = commerciaux.annotate(nb_leads=Count('lead')).order_by('nb_leads').first()

            lead_ancient = Lead.objects.filter(telephone=data['telephone'])
            if lead_ancient.exists():
                return JsonResponse({'error': 'Ce lead est deja dans la base de donnees'}, status=400)

            lead = Lead.objects.create(
                id_utilisateur=commercial,
                nom=data['nom'],
                prenom = "",
                email = data['email'],
                telephone = data['telephone'],
                type_bien = data['type_bien'],
                type_transaction=data['transaction'],
                budget=data['budget'],
                surface=data['surface'],
                urgence='Normal',
                source='Web',
                degre_interet='Moyen',
                statut='Nouveau',
                ascenseur=data['ascenseur'],
                jardin=data['jardin'],
                terrasse=data['terrasse'],
                garage=data['garage']
            )
            Quartier.objects.create(id_lead=lead, ville=data['ville'], quartier=data['quartier'],nbr_chambre=data['nbr_chambre'])
            Quartier.objects.create(id_lead=lead, ville=data['ville'], quartier=data['quartier2'],nbr_chambre=data['nbr_chambre'])
            Quartier.objects.create(id_lead=lead, ville=data['ville'], quartier=data['quartier3'],nbr_chambre=data['nbr_chambre'])
            return JsonResponse({'message': 'Lead ajouté avec succès'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)





class AjouterLeadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        try:

            ville_choisie = data['quartiers'][0].get('ville')

            utilisateur_ville = Utilisateur_ville.objects.filter(ville = ville_choisie, id_utilisateur__role='commercial')
            commerciaux_ids = utilisateur_ville.values_list('id_utilisateur', flat=True)
            commerciaux = Utilisateur.objects.filter(id__in=commerciaux_ids)
            

            commercial = None
            statut_lead = 'Nouveau'
            utilisateur_connecte = request.user  # L'utilisateur connecté

            # Si l'utilisateur est commercial → affecter à lui-même
            if utilisateur_connecte.role == "commercial":
                commercial = utilisateur_connecte
                statut_lead = "Affecté"
            elif commerciaux.exists():
                # Trouver le commercial avec le moins de leads
                commercial = commerciaux.annotate(nb_leads=Count('lead')).order_by('nb_leads').first()
                statut_lead = 'Affecté'


            lead_ancient = Lead.objects.filter(telephone=data['telephone'])
            if lead_ancient.exists():
                return JsonResponse({'error': 'Ce lead est deja dans la base de donnees'}, status=400)

            lead = Lead.objects.create(
                id_utilisateur=commercial,
                nom=data.get('nom'),
                prenom=data.get('prenom'),
                telephone=data.get('telephone'),
                email=data.get('email'),
                type_bien=data.get('type_bien'),
                type_transaction=data.get('type_transaction'),
                budget=data.get('budget'),
                surface=data.get('surface'),
                urgence='Normal',
                source=data.get('source'),
                degre_interet=data.get('degre_interet'),
                etat_bien=data.get('etat_bien'),
                statut=statut_lead
            )

            # Quartiers multiples

            if data.get('quartiers'):
                elem = data.get('quartiers')
                for choix_quartier in elem:
                    Quartier.objects.create(
                        id_lead=lead,
                        ville=choix_quartier['ville'],
                        quartier=choix_quartier['quartier'],
                        nbr_chambre=choix_quartier['nbr_chambre'],
                    )

            msg = "Lead ajouté avec succès"


            return Response({"message": msg}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class LeadListAPIView(APIView):
    #permission_classes = [IsAuthenticated]
    def get(self, request):
        leads = Lead.objects.all().order_by('-date_creation')
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)

class LeadDetailAPIView(APIView):
    def get(self, request, id):
        try:
            lead = Lead.objects.get(id=id)
            serializer = LeadSerializer(lead)
            return Response(serializer.data)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)


class LeadCommercialAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request, id):
        try:
            lead_commercial = Lead.objects.filter(id_utilisateur=id)
            serializer = LeadSerializer(lead_commercial, many=True)
            return Response(serializer.data)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)


class ModifierLeadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, id):
        try:
            lead = Lead.objects.get(id=id)
            serializer = LeadSerializer(lead, data=request.data, partial=True)  # partial=True = champs optionnels
            if serializer.is_valid():
                serializer.save()

                quartiers_data = request.data.get('quartiers', [])

                if quartiers_data :
                    Quartier.objects.filter(id_lead = lead).delete()
                    for elem in quartiers_data:
                        Quartier.objects.create(
                            id_lead = lead,
                            ville = elem.get('ville'),
                            quartier = elem.get('quartier'),
                            nbr_chambre = elem.get('nbr_chambre'),
                        )

                    

                # for q_data in quartiers_data:
                #     quartier_id = q_data.get("id")
                #     if quartier_id != 0:
                #         # Mettre à jour l'existant
                #         Quartier.objects.filter(id=quartier_id, id_lead=lead).update(
                #             ville=q_data["ville"],
                #             quartier=q_data["quartier"],
                #             nbr_chambre=q_data["nbr_chambre"]
                #         )
                #     if quartier_id == 0 and ( q_data.get("quartier") != '' or q_data.get("nbr_chambre") != ''):
                #         # Nouveau quartier
                #         Quartier.objects.create(id_lead=lead, **q_data)
                return Response({'message': 'Lead modifié avec succès'})
            return Response(serializer.errors, status=400)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)


class SupprimerLeadAPIView(APIView):
    def delete(self, request, id):
        try:
            lead = Lead.objects.get(id=id)
            lead.delete()
            return Response({'message': 'Lead supprimé avec succès'})
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)

class AffecterCommercialAPIView(APIView):
    def post(self, request, lead_id):
        id_utilisateur = request.data.get('id_utilisateur')
        try:
            lead = Lead.objects.get(id=lead_id)
            lead.id_utilisateur_id = id_utilisateur
            lead.statut = "Affecté"  # facultatif
            lead.save()
            return Response({'message': 'Commercial affecté avec succès'})
        except Lead.DoesNotExist:
            return Response({'error': 'Lead introuvable'}, status=404)
        
class LeadStatusUpdateView(APIView):
    def patch(self, request, pk):
        lead = Lead.objects.get(pk=pk)
        nouveau_statut = request.data.get('statut')
        
        # Si on passe à "A rappeler", vérifier qu'un rappel existe
        if nouveau_statut == 'A rappeler':
            if not lead.rappels_set.exists():
                return Response(
                    {'error': 'Vous devez d\'abord créer un rappel'},
                    status=400
                )
        
        lead.statut = nouveau_statut
        lead.save()
        return Response({"status": "updated"})
    
class CreerRappelAPIView(APIView):
    def post(self, request):
        lead_id = request.data.get('id_lead')
        Rappels.objects.filter(id_lead=lead_id).delete()
        serializer = RappelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class CreerRDVAPIView(APIView):
    def post(self, request):
        lead_id = request.data.get('id_lead')
        RDV.objects.filter(id_lead=lead_id).delete()
        serializer = RDVSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class LeadsARappelerAPIView(APIView):
    def get(self, request):
        now = timezone.now()
        leads = Lead.objects.filter(statut__in=["A rappeler", "Non relancé"]).prefetch_related('quartiers', 'rappels_set')
        
        for lead in leads:
            dernier_rappel = lead.rappels_set.order_by('-date_rappel').first()
            if dernier_rappel:
                # Vérifier si la date de rappel est dépassée de plus de 15 minutes
                if lead.statut == "A rappeler" and now > dernier_rappel.date_rappel + timedelta(minutes=15):
                    lead.statut = "Non relancé"
                    lead.save()
                # Optionnel: Rebasculer en "A rappeler" si la date est modifiée
                elif lead.statut == "Non relancé" and now <= dernier_rappel.date_rappel + timedelta(minutes=15):
                    lead.statut = "A rappeler"
                    lead.save()

        # Ne pas refiltrer ici - on veut retourner tous les leads traités
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)
    
class LeadsRDVAPIView(APIView):
    def get(self, request):
        leads = Lead.objects.filter(statut='RDV planifié')
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)
    
class AssocierBienALeadAPIView(APIView):
    def post(self, request, lead_id):
        try:
            lead = Lead.objects.get(id=lead_id)
            biens_ids = request.data.get('biens_ids', [])  # Liste des IDs des biens à associer
            
            for bien_id in biens_ids:
                bien = Bien.objects.get(id=bien_id)
                Lead_bien.objects.create(id_lead=lead, id_bien=bien)
            
            return Response({'message': 'Biens associés avec succès'}, status=201)
        
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)
        except Bien.DoesNotExist:
            return Response({'error': 'Un ou plusieurs biens non trouvés'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
class GetAssociatedBiensAPIView(APIView):
    def get(self, request, lead_id):
        # Solution 1: Renvoyer directement les biens avec leur référence
        associated_biens = Bien.objects.filter(
            lead_bien__id_lead=lead_id
        ).values('id', 'reference', 'statut_commercial','type_bien','superficie','nbr_chambre','type_transaction','etat_bien','adresse', 'quartier','prix', 'ville','ascenseur','jardin','terrasse','garage')
        
        return Response(associated_biens)
    
class SupprimerAssociationBienAPIView(APIView):
    def post(self, request, lead_id):
        try:
            lead = Lead.objects.get(id=lead_id)
            biens_ids = request.data.get('biens_ids', [])
            
            # Supprimer les associations
            Lead_bien.objects.filter(id_lead=lead, id_bien__in=biens_ids).delete()
            
            return Response({'message': 'Associations supprimées avec succès'}, status=200)
        
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
class LeadStatusUpdateWithCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk)
            nouveau_statut = request.data.get('statut')
            commentaire = request.data.get('commentaire')
            motif_perte = request.data.get('motif_perte')
            
            if not nouveau_statut:
                return Response({'error': 'Le nouveau statut est requis'}, status=400)
                
            if not commentaire:
                return Response({'error': 'Un commentaire est obligatoire pour changer le statut'}, status=400)
            
            if nouveau_statut == 'Perdu' and not motif_perte:
                return Response({'error': 'Un motif de perte est obligatoire'}, status=400)
            
            # Créer le commentaire avant de changer le statut
            Commentaire.objects.create(
                id_lead=lead,
                id_utilisateur=request.user,
                contenue=commentaire,
                ancien_statut=lead.statut,
                nouveau_statut=nouveau_statut,
                motif_perte=motif_perte
            )
            
            # Mettre à jour le statut
            lead.statut = nouveau_statut
            lead.save()
            
            return Response({"status": "updated", "message": "Statut mis à jour avec commentaire"})
            
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)

class LeadStatsAPIView(APIView):
    def get(self, request):
        # Récupère les counts groupés par statut en une seule requête SQL
        stats = Lead.objects.values('statut').annotate(count=Count('id'))
        
        # Transforme en format { "Nouveau": X, "Affecté": Y, ... }
        formatted_stats = {item['statut']: item['count'] for item in stats}
        
        # Ajoute les statuts manquants avec 0
        default_stats = {
            "Nouveau": 0,
            "Affecté": 0,
            "RDV planifié": 0,
            "A rappeler": 0,
            "Non relancé": 0,
            "Opportunité": 0,
            "Perdu": 0,
            "Gagné": 0
        }
        default_stats.update(formatted_stats)
        
        return Response(default_stats)
    
class TachesDuJourView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):


        date_str = request.GET.get('date')
        if date_str:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            selected_date = now().date()

        # Mettre à jour les leads dont le rappel est dépassé
        rappels_expired = Rappels.objects.filter(
            date_rappel__lt=now(),
            id_lead__statut="À rappeler"
        )
        for rappel in rappels_expired:
            rappel.id_lead.statut = "Non relancer"
            rappel.id_lead.save()

        # Récupérer rappels et RDV
        rappels_du_jour = Rappels.objects.filter(date_rappel__date=selected_date)
        rdvs_du_jour = RDV.objects.filter(date_rdv__date=selected_date)

        # Construire la réponse enrichie
        rappels_data = []
        for r in rappels_du_jour:
            rappels_data.append({
                "id": r.id,
                "date_rappel": r.date_rappel,
                "motif": r.motif,
                "lead_nom": r.id_lead.nom,
                "lead_prenom": r.id_lead.prenom,
            })

        rdvs_data = []
        for rdv in rdvs_du_jour:
            rdvs_data.append({
                "id": rdv.id,
                "date_rdv": rdv.date_rdv,
                "lieu": rdv.lieu,
                "lead_nom": rdv.id_lead.nom,
                "lead_prenom": rdv.id_lead.prenom,
            })

        return Response({
            "rappels": rappels_data,
            "rdvs": rdvs_data,
        })

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        user = request.user
        # Récupération des paramètres de filtre
        date_debut = request.GET.get('date_debut')
        date_fin = request.GET.get('date_fin')
        mois = request.GET.get('mois')
        
        # Construction des filtres de date
        date_filters = Q()
        if date_debut and date_fin:
            try:
                # Validation des dates
                date_debut_obj = datetime.strptime(date_debut, '%Y-%m-%d').date()
                date_fin_obj = datetime.strptime(date_fin, '%Y-%m-%d').date()
                
                # Vérification que la période ne dépasse pas 1 an (sécurité)
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
                # Validation du format mois (YYYY-MM)
                mois_obj = datetime.strptime(mois, '%Y-%m').date()
                date_debut_mois = mois_obj.replace(day=1)
                
                # Calcul de la fin du mois
                if mois_obj.month == 12:
                    date_fin_mois = mois_obj.replace(year=mois_obj.year+1, month=1, day=1)
                else:
                    date_fin_mois = mois_obj.replace(month=mois_obj.month+1, day=1)
                
                date_fin_mois = date_fin_mois - timedelta(days=1)
                
                date_filters &= Q(date_creation__date__gte=date_debut_mois) & Q(date_creation__date__lte=date_fin_mois)
            except ValueError:
                return Response({"error": "Format de mois invalide (YYYY-MM requis)"}, status=400)
        
        # Filtre de base pour les leads selon le rôle avec les filtres de date
        if user.role == 'admin':
            leads_query = Lead.objects.filter(date_filters) if date_filters else Lead.objects.all()
        else:
            leads_query = Lead.objects.filter(id_utilisateur=user)
            if date_filters:
                leads_query = leads_query.filter(date_filters)

        total_leads = leads_query.count()
        leads_by_statut = list(leads_query.values('statut').annotate(count=Count('id')))
        statut_order = ['Nouveau', 'Affecté', 'Non relancé','RDV planifié', 'A rappeler','Opportunité','Perdu', 'Gagné']
        leads_by_statut.sort(key=lambda x: statut_order.index(x['statut']) if x['statut'] in statut_order else 999)
        
        # Calculer les leads gagnés pour le taux de conversion
        total_gagnes = leads_query.filter(statut='Gagné').count()
        taux_conversion_total = (total_gagnes / total_leads * 100) if total_leads > 0 else 0
        
        today = date.today()
        start_current_month = today.replace(day=1)

        gagnés_perdus_current_month = leads_query.filter(
            statut__in=['Gagné', 'Perdu'],
            date_creation__gte=start_current_month
        ).values('statut').annotate(count=Count('id'))

        first_day_current_month = today.replace(day=1)
        last_day_previous_month = first_day_current_month - timedelta(days=1)
        start_previous_month = last_day_previous_month.replace(day=1)

        gagnés_perdus_previous_month = leads_query.filter(
            statut__in=['Gagné', 'Perdu'],
            date_creation__gte=start_previous_month,
            date_creation__lte=last_day_previous_month
        ).values('statut').annotate(count=Count('id'))

        # Sources des leads (filtrées selon le rôle)
        leads_par_source = leads_query.values('source').annotate(
            count=Count('id')
        ).order_by('-count')

        # Pour les quartiers, on filtre aussi selon l'utilisateur
        if user.role == 'admin':
            top_quartiers = Quartier.objects.values('quartier')\
                                            .annotate(count=Count('id'))\
                                            .order_by('-count')[:5]
        else:
            top_quartiers = Quartier.objects.filter(id_lead__id_utilisateur=user)\
                                           .values('quartier')\
                                           .annotate(count=Count('id'))\
                                           .order_by('-count')[:5]

        # Stats par commercial (seulement pour l'admin) - AVEC FILTRES (MODIFICATIONS ICI)
        if user.role == 'admin':
            # Leads par commercial avec filtres
            leads_par_commercial_query = Lead.objects.filter(
                id_utilisateur__isnull=False
            )
            if date_filters:
                leads_par_commercial_query = leads_par_commercial_query.filter(date_filters)
                
            leads_par_commercial = leads_par_commercial_query.values(
                'id_utilisateur__id',
                'id_utilisateur__nom',
                'id_utilisateur__prenom'
            ).annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Leads GAGNÉS par commercial avec filtres (pour calculer le taux de conversion)
            leads_gagnes_par_commercial_query = Lead.objects.filter(
                id_utilisateur__isnull=False,
                statut='Gagné'
            )
            if date_filters:
                leads_gagnes_par_commercial_query = leads_gagnes_par_commercial_query.filter(date_filters)
                
            leads_gagnes_par_commercial = leads_gagnes_par_commercial_query.values(
                'id_utilisateur__id',
                'id_utilisateur__nom',
                'id_utilisateur__prenom'
            ).annotate(
                leads_gagnes=Count('id')
            )
            
            # Créer un dictionnaire pour les leads gagnés pour faciliter l'accès
            gagnes_dict = {item['id_utilisateur__id']: item for item in leads_gagnes_par_commercial}
            
            # Calculer le taux de conversion pour chaque commercial
            conversion_par_commercial = []
            for commercial in leads_par_commercial:
                commercial_id = commercial['id_utilisateur__id']
                total = commercial['count']
                gagnes_data = gagnes_dict.get(commercial_id, {'leads_gagnes': 0})
                gagnes = gagnes_data['leads_gagnes']
                
                # Calculer le taux de conversion (pourcentage)
                taux_conversion = (gagnes / total * 100) if total > 0 else 0
                
                conversion_par_commercial.append({
                    'commercial_id': commercial_id,
                    'commercial_nom': commercial['id_utilisateur__nom'],
                    'commercial_prenom': commercial['id_utilisateur__prenom'],
                    'total_leads': total,
                    'leads_gagnes': gagnes,
                    'taux_conversion': round(taux_conversion, 2)
                })
            
            # Trier par taux de conversion (du plus haut au plus bas)
            conversion_par_commercial.sort(key=lambda x: x['taux_conversion'], reverse=True)
        else:
            leads_par_commercial = []
            conversion_par_commercial = []

        data = {
            'total_leads': total_leads,
            'total_gagnes': total_gagnes,
            'taux_conversion_total': round(taux_conversion_total, 2),
            'leads_by_statut': list(leads_by_statut),
            'leads_par_source': list(leads_par_source),
            'gagnes_perdus_current_month': list(gagnés_perdus_current_month),
            'gagnes_perdus_previous_month': list(gagnés_perdus_previous_month),
            'top_quartiers': list(top_quartiers),
            'leads_par_commercial': list(leads_par_commercial),
            'conversion_par_commercial': conversion_par_commercial,
            'user_role': user.role,
            'filters_applied': {
                'date_debut': date_debut,
                'date_fin': date_fin,
                'mois': mois
            }
        }

        return Response(data)

class LeadCommercialStatutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            lead_commercial = Lead.objects.filter(id_utilisateur=id)
            # Récupère les counts groupés par statut en une seule requête SQL
            stats = lead_commercial.values('statut').annotate(count=Count('id'))
            # Transforme en format { "Nouveau": X, "Affecté": Y, ... }
            formatted_stats_commercial = {item['statut']: item['count'] for item in stats}
            # Ajoute les statuts manquants avec 0
            default_stats = {
                "Nouveau": 0,
                "Affecté": 0,
                "RDV planifié": 0,
                "A rappeler": 0,
                "Non relancé": 0,
                "Opportunité": 0,
                "Perdu": 0,
                "Gagné": 0
            }
            default_stats.update(formatted_stats_commercial)

            return Response(default_stats)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)

class TachesDuJourView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, date, *args, **kwargs):
        try:
            selected_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Format de date invalide. Utilisez YYYY-MM-DD"}, status=400)

        user_connected = request.user

        # Récupérer tous les rappels et RDV pour la date sélectionnée
        rappels_du_jour = Rappels.objects.filter(date_rappel__date=selected_date)
        rdvs_du_jour = RDV.objects.filter(date_rdv__date=selected_date)

        # Si l'utilisateur est un commercial, filtrer seulement ses rappels et RDV
        if user_connected.role == "commercial":
            rappels_du_jour = rappels_du_jour.filter(id_lead__id_utilisateur=user_connected)
            rdvs_du_jour = rdvs_du_jour.filter(id_lead__id_utilisateur=user_connected)

        # Construire la réponse
        rappels_data = []
        for r in rappels_du_jour:
            rappels_data.append({
                "id": r.id,
                "date_rappel": r.date_rappel,
                "motif": r.motif,
                "id_lead": r.id_lead.id,
                "id_commercial": r.id_lead.id_utilisateur.id if r.id_lead.id_utilisateur else None,
                "lead_nom": r.id_lead.nom,
                "lead_prenom": r.id_lead.prenom,
            })

        rdvs_data = []
        for rdv in rdvs_du_jour:
            rdvs_data.append({
                "id": rdv.id,
                "date_rdv": rdv.date_rdv,
                "lieu": rdv.lieu,
                "id_lead": rdv.id_lead.id,
                "id_commercial": rdv.id_lead.id_utilisateur.id if rdv.id_lead.id_utilisateur else None,
                "lead_nom": rdv.id_lead.nom,
                "lead_prenom": rdv.id_lead.prenom,
            })

        return Response({
            "rappels": rappels_data,
            "rdvs": rdvs_data,
        })

class LeadCommercialStatutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            lead_commercial = Lead.objects.filter(id_utilisateur=id)
            # Récupère les counts groupés par statut en une seule requête SQL
            stats = lead_commercial.values('statut').annotate(count=Count('id'))
            # Transforme en format { "Nouveau": X, "Affecté": Y, ... }
            formatted_stats_commercial = {item['statut']: item['count'] for item in stats}
            # Ajoute les statuts manquants avec 0
            default_stats = {
                "Nouveau": 0,
                "Affecté": 0,
                "RDV planifié": 0,
                "A rappeler": 0,
                "Non relancé": 0,
                "Opportunité": 0,
                "Perdu": 0,
                "Gagné": 0
            }
            default_stats.update(formatted_stats_commercial)

            return Response(default_stats)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead non trouvé'}, status=404)