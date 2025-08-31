from django.urls import path
from .views import ajouter_nouveau_lead, AjouterLeadAPIView, LeadListAPIView, LeadDetailAPIView, ModifierLeadAPIView, \
    SupprimerLeadAPIView, AffecterCommercialAPIView, LeadStatusUpdateView, CreerRappelAPIView, LeadsARappelerAPIView, \
    AssocierBienALeadAPIView, GetAssociatedBiensAPIView, SupprimerAssociationBienAPIView, CreerRDVAPIView,LeadsRDVAPIView, LeadCommercialAPIView, \
    LeadStatusUpdateWithCommentView, LeadStatsAPIView, TachesDuJourView, DashboardStatsView, LeadCommercialStatutAPIView

urlpatterns = [
    path('lead_web/', ajouter_nouveau_lead, name='ajouter_nv_lead'),
    path('add_lead/', AjouterLeadAPIView.as_view(), name='add_lead'),
    path('leads/', LeadListAPIView.as_view(), name='lead_list'),
    path('lead/<int:id>/', LeadDetailAPIView.as_view(), name='lead_detail'),
    path('leadCommercial/<int:id>/', LeadCommercialAPIView.as_view(), name='lead_commercial'),
    path('update_lead/<int:id>/', ModifierLeadAPIView.as_view(), name='update_lead'),
    path('delete_lead/<int:id>/', SupprimerLeadAPIView.as_view(), name='delete_lead'),
    path('affecter_commercial/<int:lead_id>/', AffecterCommercialAPIView.as_view(), name='affecter_commercial'),
    path('update_lead_statut/<int:pk>/', LeadStatusUpdateView.as_view(), name='update_lead_status'),
    path('rappels/', CreerRappelAPIView.as_view(), name='creer_rappel'),
    path('rdvs/', CreerRDVAPIView.as_view(), name='creer_rdv'),
    path('leads_a_rappeler/', LeadsARappelerAPIView.as_view(), name='leads_a_rappeler'),
    path('leads_rdv/', LeadsRDVAPIView.as_view(), name='leads_rdv'),
    path('associer-bien/<int:lead_id>/', AssocierBienALeadAPIView.as_view(), name='associer-bien'),
    path('associated-biens/<int:lead_id>/', GetAssociatedBiensAPIView.as_view(), name='get-associated-biens'),
    path('supprimer-association-bien/<int:lead_id>/', SupprimerAssociationBienAPIView.as_view(), name='supprimer-association-bien'),
    path('update_lead_status_with_comment/<int:pk>/', LeadStatusUpdateWithCommentView.as_view(), name='update_lead_status_with_comment'),
    path('stats/', LeadStatsAPIView.as_view(), name='lead_stats'),
    path("taches/", TachesDuJourView.as_view(), name="taches_du_jour"),
    path('dashboard_stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path("taches/<str:date>/", TachesDuJourView.as_view(), name="taches_du_jour"),
    path('dashboard_stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('statsCommercial/<int:id>/', LeadCommercialStatutAPIView.as_view(), name='statsCommercial'),
]