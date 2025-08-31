from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import random


from django.utils import timezone
from datetime import timedelta

class UtilisateurManagement(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Utilisateur(AbstractBaseUser, PermissionsMixin):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.IntegerField()
    role = models.CharField(max_length=100)
    #ville = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=True)

    # Champs requis par Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UtilisateurManagement()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'telephone', 'role', 'ville']  # tout sauf email et password

    code_reset = models.CharField(max_length=6, null=True, blank=True)
    code_reset_expiration = models.DateTimeField(null=True, blank=True)

    def set_reset_code(self):
        self.code_reset = str(random.randint(100000, 999999))
        self.code_reset_expiration = timezone.now() + timedelta(minutes=10)  # expire dans 10 minutes
        self.save()

class Utilisateur_ville(models.Model):
    id_utilisateur = models.ForeignKey(Utilisateur, on_delete= models.CASCADE, related_name='utilisateur_ville')
    ville = models.CharField(max_length=100)