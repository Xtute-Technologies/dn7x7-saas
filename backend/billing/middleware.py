from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .models import APIKey, APICallLog

class APICreditMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # 1. FILTER: Only run strict credit checks on news routes
        # Adjust the prefix if your URL structure is different (e.g., /api/v1/news/)
        if not request.path.startswith('/api/news/'):
            return None

        # 2. VALIDATION: Check for API Key Header
        key_value = request.headers.get('X-API-KEY')
        if not key_value:
            return JsonResponse({'error': 'Missing X-API-KEY header'}, status=401)

        # 3. AUTH: Verify Key Exists and is Active
        try:
            # Select related credit to avoid extra DB hits later
            api_key = APIKey.objects.select_related('user__credit').get(key=key_value, is_active=True)
        except APIKey.DoesNotExist:
            return JsonResponse({'error': 'Invalid or inactive API Key'}, status=403)

        # 4. LIMITS: Check Key specific daily limit (Optional, based on your APIKey model)
        # You would need to count logs for today if you want to enforce api_key.daily_limit here.
        
        # 5. CREDIT CHECK & DEDUCTION
        # We access the UserCredit model via the user related to the API Key
        try:
            credit_system = api_key.user.credit
        except:
             return JsonResponse({'error': 'User has no credit account configured.'}, status=500)

        # strict=True means we deduct immediately before processing
        success = credit_system.deduct_credits(cost=1)
        
        if not success:
            return JsonResponse({
                'error': 'Insufficient credits. Daily limit reached or balance empty.'
            }, status=402) # 402 Payment Required

        # 6. ATTACH: Attach key to request so View/Logging can use it
        request.api_key_instance = api_key
        return None

    def process_response(self, request, response):
        # 1. LOGGING: Only log if we identified an API Key in process_view
        if hasattr(request, 'api_key_instance'):
            # Get IP Address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            # Create Log Entry
            try:
                APICallLog.objects.create(
                    api_key=request.api_key_instance,
                    endpoint=request.path,
                    method=request.method,
                    ip_address=ip,
                    status_code=response.status_code
                )
            except Exception as e:
                # Prevent logging errors from crashing the actual response
                print(f"Logging failed: {e}")

        return response