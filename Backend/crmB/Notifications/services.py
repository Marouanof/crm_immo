from .models import Notification
from Lead.models import Lead, Quartier
from Utilisateur.models import Utilisateur

def verifier_et_notifier_leads_conformes(bien):
    """Vérifie si un bien correspond aux critères des leads actifs et crée des notifications"""
    try:
        leads_actifs = Lead.objects.exclude(statut__in=['Gagné', 'Perdu', 'gagné', 'perdu'])
        
        for lead in leads_actifs:
            if bien_correspond_au_lead(bien, lead):
                # Notifier le commercial affecté au lead
                if lead.id_utilisateur:
                    Notification.objects.create(
                        destinataire=lead.id_utilisateur,
                        titre=f"Nouveau bien conforme à votre lead {lead.nom} {lead.prenom}",
                        message=f"Un nouveau bien ({bien.reference}) correspond aux critères de votre lead {lead.nom} {lead.prenom}. "
                               f"Prix: {bien.prix} DH, Surface: {bien.superficie}m², {bien.nbr_chambre} chambres, "
                               f"Localisation: {bien.ville} - {bien.quartier}",
                        bien=bien, lead=lead
                    )
                
                # Notifier les administrateurs
                admins = Utilisateur.objects.filter(role__in=['admin', 'Admin', 'ADMIN'])
                for admin in admins:
                    if not lead.id_utilisateur or admin.id != lead.id_utilisateur.id:
                        Notification.objects.create(
                            destinataire=admin,
                            titre=f"Nouveau bien conforme au lead {lead.nom} {lead.prenom}",
                            message=f"Un nouveau bien ({bien.reference}) correspond aux critères du lead {lead.nom} {lead.prenom}. "
                                   f"Lead affecté à: {lead.id_utilisateur.nom if lead.id_utilisateur else 'Non affecté'}",
                            bien=bien, lead=lead
                        )
                # Notifier les assistants
                assistants = Utilisateur.objects.filter(role__in=['assistant', 'Assistant', 'ASSISTANT'])
                for assistant in assistants:
                    if not lead.id_utilisateur or assistant.id != lead.id_utilisateur.id:
                        Notification.objects.create(
                            destinataire=assistant,
                            titre=f"Nouveau bien conforme au lead {lead.nom} {lead.prenom}",
                            message=f"Un nouveau bien ({bien.reference}) correspond aux critères du lead {lead.nom} {lead.prenom}. "
                                   f"Lead affecté à: {lead.id_utilisateur.nom if lead.id_utilisateur else 'Non affecté'}",
                            bien=bien, lead=lead
                        )
    except Exception as e:
        print(f"Erreur lors de la création des notifications: {e}")

def bien_correspond_au_lead(bien, lead):
    """Vérifie si un bien correspond aux critères d'un lead"""
    # Type de bien
    if lead.type_bien.lower() != bien.type_bien.lower():
        return False
    
    if lead.etat_bien.lower() != bien.etat_bien.lower():
        return False

    # Type de transaction
    if lead.type_transaction.lower() == 'achat' and bien.type_transaction.lower() != 'vente':
        return False
    elif lead.type_transaction.lower() == 'location' and bien.type_transaction.lower() != 'location':
        return False
    elif lead.type_transaction.lower() == 'sarout' and bien.type_transaction.lower() != 'sarout':
        return False
    
    # Budget (±15%)
    budget_min = float(lead.budget) * 0.85
    budget_max = float(lead.budget) * 1.15
    if not (budget_min <= bien.prix <= budget_max):
        return False
    
    surface_min = float(lead.surface) * 0.85
    surface_max = float(lead.surface) * 1.15
    if not (surface_min <= bien.superficie <=surface_max):
        return False
    
    # Localisation
    quartiers_lead = Quartier.objects.filter(id_lead=lead)
    if quartiers_lead.exists():
        for quartier_lead in quartiers_lead:
            if (quartier_lead.ville.lower() == bien.ville.lower() and 
                quartier_lead.quartier.lower() == bien.quartier.lower()):
                if quartier_lead.nbr_chambre and quartier_lead.nbr_chambre != bien.nbr_chambre:
                    continue
                return True
        return False
    else:
        return True
    
def notifier_leads_si_bien_non_disponible(bien, ancien_statut):
    """
    Notifie uniquement les leads explicitement associés au bien via Lead_bien
    quand un bien devient non disponible
    """
    try:
        if ancien_statut.lower() == 'disponible' and bien.statut_commercial.lower() != 'disponible':
            # 1. Récupérer les leads explicitement associés via Lead_bien
            leads_associes = Lead.objects.filter(
                lead_bien__id_bien=bien
            ).exclude(statut__in=['Gagné', 'gagné'])
            
            # 2. Notifier leurs commerciaux
            for lead in leads_associes:
                if lead.id_utilisateur:
                    Notification.objects.create(
                        destinataire=lead.id_utilisateur,
                        titre=f"Bien associé non disponible - {bien.reference}",
                        message=f"Le bien {bien.reference} que vous aviez associé au lead {lead.nom} {lead.prenom} n'est plus disponible (Statut: {bien.statut_commercial})",
                        bien=bien,
                        lead=lead
                    )
            
            # 3. Notification groupée aux admins
            if leads_associes.exists():
                admins = Utilisateur.objects.filter(role__in=['admin', 'Admin', 'ADMIN'])
                message_admin = (
                    f"Bien {bien.reference} ({bien.type_bien}) : {bien.statut_commercial}\n"
                    f"Leads explicitement associés ({leads_associes.count()}):\n"
                    + "\n".join([
                        f"- {lead.nom} {lead.prenom} (Commercial: {lead.id_utilisateur.nom if lead.id_utilisateur else 'Non affecté'})"
                        for lead in leads_associes
                    ])
                )
                for admin in admins:
                    Notification.objects.create(
                        destinataire=admin,
                        titre=f"[ADMIN] Bien associé non disponible - {bien.reference}",
                        message=message_admin,
                        bien=bien
                    )
             # 4. Notification groupée aux assistantss
            if leads_associes.exists():
                assistants = Utilisateur.objects.filter(role__in=['assistant', 'Assistant', 'ASSISTANT'])
                message_assistant = (
                    f"Bien {bien.reference} ({bien.type_bien}) : {bien.statut_commercial}\n"
                    f"Leads explicitement associés ({leads_associes.count()}):\n"
                    + "\n".join([
                        f"- {lead.nom} {lead.prenom} (Commercial: {lead.id_utilisateur.nom if lead.id_utilisateur else 'Non affecté'})"
                        for lead in leads_associes
                    ])
                )
                for assistant in assistants:
                    Notification.objects.create(
                        destinataire=assistant,
                        titre=f"[ASSISTANT] Bien associé non disponible - {bien.reference}",
                        message=message_admin,
                        bien=bien
                    )
    except Exception as e:
        print(f"Erreur de notification : {str(e)}")