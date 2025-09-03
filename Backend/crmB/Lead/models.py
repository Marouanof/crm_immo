from django.db import models

from Bien.models import Bien
from Utilisateur.models import Utilisateur


class Lead(models.Model):
     id_utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.CASCADE)
     nom = models.CharField(max_length=100)
     prenom = models.CharField(max_length=100)
     telephone = models.CharField(max_length=20)
     email = models.EmailField()
     type_bien = models.CharField(max_length=100)
     type_transaction = models.CharField(max_length=100)
     etat_bien = models.CharField(max_length=100, default='Neuf')
     budget = models.DecimalField(max_digits=10, decimal_places=2)
     surface = models.IntegerField()
     urgence = models.CharField(max_length=100)
     source = models.CharField(max_length=100)
     degre_interet = models.CharField(max_length=100)
     statut = models.CharField(max_length=100, default="Nouveau")
     ascenseur = models.BooleanField(default=False)
     jardin = models.BooleanField(default=False)
     terrasse = models.BooleanField(default=False)
     garage = models.BooleanField(default=False)
     balcon = models.BooleanField(default=False)
     parking = models.BooleanField(default=False)
     piscine = models.BooleanField(default=False)
     meuble = models.BooleanField(default=False)
     date_creation = models.DateTimeField(auto_now_add=True)


class Rappels(models.Model):
    id_lead = models.ForeignKey(Lead, on_delete=models.CASCADE)
    date_rappel = models.DateTimeField()
    motif = models.CharField(max_length=100)

class Quartier(models.Model):
    id_lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="quartiers")
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100)
    nbr_chambre = models.IntegerField()

class RDV(models.Model):
    id_lead = models.ForeignKey(Lead, on_delete=models.CASCADE)
    date_rdv = models.DateTimeField()
    lieu = models.CharField(max_length=100)


class Commentaire(models.Model):
    id_lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='commentaires')
    id_utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    contenue = models.TextField()
    ancien_statut = models.CharField(max_length=100)
    nouveau_statut = models.CharField(max_length=100)
    motif_perte = models.CharField(max_length=100, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

class Lead_bien(models.Model):
    id_bien = models.ForeignKey(Bien, on_delete=models.CASCADE)
    id_lead = models.ForeignKey(Lead, on_delete=models.CASCADE)