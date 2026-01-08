from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from .models import APIKey, APICallLog

class APICreditMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # 1. FILTER: Only run checks on news API routes
        # Adjust this path if your API url is different (e.g. '/api/v1/news/')
        if not request.path.startswith('/api/news/'):
            return None

        # 2. VALIDATION: Check for API Key Header
        key_value = request.headers.get('X-API-KEY')
        if not key_value:
            return JsonResponse({'error': 'Missing X-API-KEY header'}, status=401)

        # 3. AUTH: Verify Key Exists and is Active
        try:
            # select_related optimizes the DB query since we need the user and their credit next
            api_key = APIKey.objects.select_related('user__credit').get(key=key_value, is_active=True)
        except APIKey.DoesNotExist:
            return JsonResponse({'error': 'Invalid or inactive API Key'}, status=403)

        # ------------------------------------------------------------------
        # 4. ENFORCE DAILY LIMIT (The "Speed Limit")
        # ------------------------------------------------------------------
        # Get the start of the current day (Midnight today)
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # Count how many logs exist for THIS key since midnight
        daily_usage_count = APICallLog.objects.filter(
            api_key=api_key,
            timestamp__gte=today_start
        ).count()

        # Check if usage exceeds the key's specific daily_limit
        if daily_usage_count >= api_key.daily_limit:
            return JsonResponse({
                'error': f'Daily limit of {api_key.daily_limit} requests reached for this API Key.'
            }, status=429)  # 429 Too Many Requests

        # ------------------------------------------------------------------
        # 5. DEDUCT CREDIT (The "Payment")
        # ------------------------------------------------------------------
        try:
            credit_system = api_key.user.credit
        except AttributeError:
             return JsonResponse({'error': 'User has no credit account configured.'}, status=500)

        # Attempt to deduct 1 credit
        success = credit_system.deduct_credits(cost=1)
        
        if not success:
            return JsonResponse({
                'error': 'Insufficient credits. Daily free limit used and no purchased credits remaining.'
            }, status=402) # 402 Payment Required

        # 6. ATTACH: Attach key/user to request for the View and Logging
        request.api_key_instance = api_key
        request.user = api_key.user  # This ensures request.user is available in your Views
        
        return None

    def process_response(self, request, response):
        # 7. LOGGING (The "Receipt")
        # We only log if the request had a valid API key attached in process_view
        if hasattr(request, 'api_key_instance'):
            
            # Get IP Address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            try:
                # Create the log entry (This increases the count for tomorrow's check)
                APICallLog.objects.create(
                    api_key=request.api_key_instance,
                    endpoint=request.path,
                    method=request.method,
                    ip_address=ip,
                    status_code=response.status_code
                )
            except Exception as e:
                # Log error silently to console so we don't crash the user's response
                print(f"Middleware Logging Failed: {e}")

        return response