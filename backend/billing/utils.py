from models import APICallLog

class PayPerUseMixin:
    """
    Mixin to deduct credits and log usage after a successful request.
    """
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        
        # Only deduct if we have a valid API Key and the request was successful
        if hasattr(request, 'api_key') and 200 <= response.status_code < 300:
            
            # 1. Deduct Credit
            success = request.user.credit.deduct_credits(cost=1)
            
            # 2. Log the Call
            APICallLog.objects.create(
                api_key=request.api_key,
                endpoint=request.path,
                method=request.method,
                ip_address=request.META.get('REMOTE_ADDR'),
                status_code=response.status_code
            )
            
            if not success:
                # Note: It's too late to stop the request here (it already ran), 
                # but we can force a 402 Payment Required for the NEXT request 
                # because `has_sufficient_credits` in Authentication will fail next time.
                pass

        return response