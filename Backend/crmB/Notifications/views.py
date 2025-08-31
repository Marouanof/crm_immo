from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)

@api_view(['POST'])
def marquer_comme_lue(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, destinataire=request.user)
        notification.lu = True
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'status': 'error'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def marquer_toutes_comme_lues(request):
    Notification.objects.filter(destinataire=request.user, lu=False).update(lu=True)
    return Response({'status': 'success'})

@api_view(['DELETE'])
def supprimer_notification(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, destinataire=request.user)
        notification.delete()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'status': 'error'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def notifications_non_lues(request):
    count = Notification.objects.filter(destinataire=request.user, lu=False).count()
    return Response({'count': count})
