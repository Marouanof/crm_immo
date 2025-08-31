from django.urls import path
from .views import RegistrerView, CustomTokenObtainPairView, UpdateView, DeleteView, ReadView, ReadAllView, \
    ListeCommerciauxAPIView, RessetPassword, VerifieCodeAPIView

urlpatterns = [
    path('register/', RegistrerView.as_view(), name='register_utilisateur'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('modifier/<int:id>/', UpdateView.as_view(), name='modifier'),
    path('supprimer/<int:id>/', DeleteView.as_view(), name='supprimer'),
    path('users/', ReadAllView.as_view(), name='users'),
    path('user/<int:id>/', ReadView.as_view(), name='user'),
    path('list_commerciaux/', ListeCommerciauxAPIView.as_view(), name='list_commerciaux'),
    path('oubliePassword/', RessetPassword.as_view(), name='oubliePassword'),
    path('verifieCode/', VerifieCodeAPIView.as_view(), name='verifieCode'),
]