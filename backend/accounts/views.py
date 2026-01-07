from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters  # Added filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

# Import your serializers and models
from .serializers import UserSerializer,AdminUserSerializer
from .permissions import IsAdminUser
from billing.models import UserCredit, APICallLog
from billing.serializers import APICallLogSerializer, UserCreditSerializer

User = get_user_model()

class UserAdminSerializer(AdminUserSerializer):
    """
    Extended serializer for Admin usage that includes system timestamps and Credit info.
    """
    # This nests the credit object inside the user response
    credit = UserCreditSerializer(read_only=True)

    class Meta(AdminUserSerializer.Meta):
        # Add date_joined, last_login, is_active, AND credit
        fields = AdminUserSerializer.Meta.fields + ('date_joined', 'last_login', 'is_active', 'credit')

class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminUser] 
    
    # --- ADDED SEARCH CONFIGURATION ---
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'organization'] # Fields to search against

    @action(detail=True, methods=['post'])
    def add_credits(self, request, pk=None):
        user = self.get_object()
        credits_to_add = request.data.get('credits')

        try:
            credits_to_add = int(credits_to_add)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid credit amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if credits_to_add <= 0:
            return Response({'error': 'Credit amount must be positive.'}, status=status.HTTP_400_BAD_REQUEST)

        credit, created = UserCredit.objects.get_or_create(user=user)
        credit.purchased_credits += credits_to_add # Add to purchased bucket
        credit.save()

        return Response({'status': 'credits added', 'total_credits': credit.total_available()})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'status': 'user status updated', 'is_active': user.is_active})

    # --- NEW: Admin View for User Logs ---
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """
        Fetch API logs for a specific user (Admin only).
        Supports ?time_range=1h/24h/7d/30d/all query param.
        """
        user = self.get_object()
        
        # Time Filtering Logic
        time_range = request.query_params.get('time_range', '7d')
        
        logs_query = APICallLog.objects.filter(api_key__user=user)

        if time_range != 'all':
            start_date = timezone.now()
            if time_range == '1h':
                start_date -= timedelta(hours=1)
            elif time_range == '24h':
                start_date -= timedelta(hours=24)
            elif time_range == '30d':
                start_date -= timedelta(days=30)
            else: # Default 7d
                start_date -= timedelta(days=7)
            
            logs_query = logs_query.filter(timestamp__gte=start_date)

        # Query logs for THIS user's keys
        # Limit to 100 items to avoid overloading the frontend list since we removed pagination
        logs = logs_query.order_by('-timestamp')[:100]

        # Return flat list to match frontend expectation (array vs pagination object)
        serializer = APICallLogSerializer(logs, many=True)
        return Response(serializer.data)