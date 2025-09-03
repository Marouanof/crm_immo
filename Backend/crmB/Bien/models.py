from django.db import models
from Utilisateur.models import Utilisateur

class Bien(models.Model):
    id_utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE,default=1)
    reference = models.CharField(max_length=20,unique=True)
    type_bien = models.CharField(max_length=100)
    type_transaction = models.CharField(max_length=100)
    prix = models.IntegerField()
    superficie = models.IntegerField()
    nbr_chambre = models.IntegerField()
    etage = models.IntegerField()
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100)
    adresse = models.CharField(max_length=5000)
    prop_nom = models.CharField(max_length=100)
    prop_prenom = models.CharField(max_length=100)
    prop_telephone = models.CharField(max_length=20)
    statut_commercial = models.CharField(max_length=100, default='Disponible')
    degre_importance = models.CharField(max_length=100)
    etat_bien = models.CharField(max_length=100, default='Neuf')
    is_validated = models.BooleanField(default=False)
    ascenseur = models.BooleanField(default=False)
    jardin = models.BooleanField(default=False)
    terrasse = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)
    balcon = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    piscine = models.BooleanField(default=False)
    meuble = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    # def save(self, *args, **kwargs):
    #     if self.prop_telephone:
    #         digits = ''.join(filter(str.isdigit, self.prop_telephone))
            
    #         if digits.startswith('0'):
    #             digits = '+212' + digits[1:]  
    #         elif not digits.startswith('+'):
    #             digits = '+' + digits
            
    #         self.prop_telephone = digits[:15]  
    #     super().save(*args, **kwargs)







