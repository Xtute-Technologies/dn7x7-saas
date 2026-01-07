from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from billing.models import APIKey, UserCredit

class APIKeyAuthentication(BaseAuthentication):
    """
    Custom authentication class for API Key based authentication.
    """
    def authenticate(self, request):
        api_key_header = request.headers.get('X-API-KEY')
        if not api_key_header:
            return None  # No API key provided, authentication will be handled by other classes or fail

        try:
            api_key = APIKey.objects.select_related('user__credit').get(key=api_key_header, is_active=True)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid or inactive API Key.')

        user = api_key.user
        if not user or not user.is_active:
            raise AuthenticationFailed('User account is inactive.')

        # Attach the api_key object to the request for logging and credit deduction
        request.api_key = api_key
        
        return (user, api_key)

    def authenticate_header(self, request):
        return 'X-API-KEY'
