from rest_framework import viewsets, mixins, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import APIKey, APICallLog, UserCredit
from .serializers import APIKeySerializer, APICallLogSerializer, UserCreditSerializer

class DashboardViewSet(viewsets.GenericViewSet):
    """
    Unified viewset for User Dashboard to manage API Keys and Credits.
    """
    permission_classes = [permissions.IsAuthenticated]

    # --- CREDIT ENDPOINTS ---
    @action(detail=False, methods=['get'])
    def credits(self, request):
        """Get current user credit balance"""
        # Ensure credit object exists
        credit, _ = UserCredit.objects.get_or_create(user=request.user)
        # Trigger lazy reset if needed before showing
        credit.check_and_reset_daily_credits()
        serializer = UserCreditSerializer(credit)
        return Response(serializer.data)

    # --- API KEY ENDPOINTS ---
    @action(detail=False, methods=['get'])
    def list_keys(self, request):
        keys = APIKey.objects.filter(user=request.user)
        serializer = APIKeySerializer(keys, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_key(self, request):
        serializer = APIKeySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post']) # URL: /dashboard/{id}/revoke_key/
    def revoke_key(self, request, pk=None):
        try:
            key = APIKey.objects.get(pk=pk, user=request.user)
            key.is_active = False
            key.save()
            return Response({'status': 'Key revoked'})
        except APIKey.DoesNotExist:
            return Response({'error': 'Key not found'}, status=404)

    # --- LOGS ENDPOINT ---
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """View usage logs for all user keys"""
        logs = APICallLog.objects.filter(api_key__user=request.user).order_by('-timestamp')[:50] # Last 50 logs
        serializer = APICallLogSerializer(logs, many=True)
        return Response(serializer.data)