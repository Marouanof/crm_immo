from django.urls import path, include
from Bien.views import (BienListCreateView,BienRetrieveUpdateDestroyView,valider_bien,BienStatsView)

urlpatterns = [
    path('api/biens/', BienListCreateView.as_view(), name='bien-list-create'),
    path('api/biens/<int:pk>/', BienRetrieveUpdateDestroyView.as_view(), name='bien-detail'),
    path('api/biens/<int:pk>/validate', valider_bien, name="valider_bien"),
    path('api/biens/stats/', BienStatsView.as_view(), name='bien-stats'),
]