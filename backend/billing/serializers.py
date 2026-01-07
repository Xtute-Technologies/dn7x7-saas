from rest_framework import serializers
from .models import APIKey, APICallLog, UserCredit

class UserCreditSerializer(serializers.ModelSerializer):
    remaining_credits = serializers.IntegerField(source='total_available', read_only=True)
    
    class Meta:
        model = UserCredit
        fields = ['daily_free_credits', 'purchased_credits', 'remaining_credits']

class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'key', 'created_at', 'is_active', 'daily_limit']
        read_only_fields = ['key', 'created_at']

class APICallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APICallLog
        fields = ['endpoint', 'method', 'status_code', 'ip_address', 'timestamp']