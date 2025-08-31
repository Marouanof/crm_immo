from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('non-lues/', views.notifications_non_lues, name='notifications-non-lues'),
    path('<int:pk>/marquer-lue/', views.marquer_comme_lue, name='marquer-comme-lue'),
    path('marquer-toutes-lues/', views.marquer_toutes_comme_lues, name='marquer-toutes-lues'),
    path('<int:pk>/supprimer/', views.supprimer_notification, name='supprimer-notification'),
]
