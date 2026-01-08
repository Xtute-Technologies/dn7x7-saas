from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from .models import APIKey, APICallLog

class APIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        api_key_header = request.headers.get('X-API-KEY')
        if not api_key_header:
            return None 

        try:
            # Fetch key and related user
            api_key = APIKey.objects.select_related('user__credit').get(key=api_key_header, is_active=True)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid or inactive API Key.')

        user = api_key.user
        if not user or not user.is_active:
            raise AuthenticationFailed('User account is inactive.')

        # ---------------------------------------------------------
        # 1. ENFORCE API KEY DAILY LIMIT
        # ---------------------------------------------------------
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Count logs for THIS key created since midnight
        usage_today = APICallLog.objects.filter(
            api_key=api_key, 
            timestamp__gte=today_start
        ).count()

        if usage_today >= api_key.daily_limit:
            raise AuthenticationFailed(f'Daily limit of {api_key.daily_limit} requests reached for this API Key.')

        # ---------------------------------------------------------
        # 2. ENFORCE USER CREDITS (Optional but recommended)
        # ---------------------------------------------------------
        # Since you have a billing system, you should likely check if they have credits here too.
        if not user.credit.has_sufficient_credits(cost=1):
             raise AuthenticationFailed('Insufficient user credits.')

        # Attach key to request so we can log it later (e.g. in middleware or view)
        request.api_key = api_key
        
        return (user, api_key)

    def authenticate_header(self, request):
        return 'X-API-KEY'