from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class APIKey(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=50, default="My API Key")  # Friendly name for the key
    key = models.CharField(max_length=50, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Limits for this specific key (optional)
    daily_limit = models.PositiveIntegerField(default=1000, help_text="Max calls allowed per day for this specific key")
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = f"dn7x7_{uuid.uuid4().hex[:32]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.key[:10]}...)"

class APICallLog(models.Model):
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE, related_name='call_logs')
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)  # GET, POST, etc.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status_code = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.api_key.name} - {self.endpoint} - {self.status_code}"

class UserCredit(models.Model):
    """
    Manages user credits with a daily free tier.
    Prioritizes using 'daily_free_credits' before touching 'purchased_credits'.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='credit')
    
    # The credits user bought/earned (Permanent)
    purchased_credits = models.PositiveIntegerField(default=0)
    
    # The daily free credits (Reset daily)
    daily_free_credits = models.PositiveIntegerField(default=20)
    
    # Tracks when the daily credits were last reset
    last_daily_reset = models.DateField(default=timezone.now)

    def check_and_reset_daily_credits(self):
        """
        Checks if the last reset was yesterday (or earlier).
        If so, resets the daily_free_credits to 20.
        """
        today = timezone.now().date()
        if self.last_daily_reset < today:
            self.daily_free_credits = 20
            self.last_daily_reset = today
            self.save(update_fields=['daily_free_credits', 'last_daily_reset'])

    def has_sufficient_credits(self, cost=1):
        """Check if user has enough credits (Daily + Purchased)"""
        self.check_and_reset_daily_credits()
        return (self.daily_free_credits + self.purchased_credits) >= cost

    def deduct_credits(self, cost=1):
        """
        Deducts credits, prioritizing the daily free bucket first.
        Returns True if successful, False if insufficient funds.
        """
        if not self.has_sufficient_credits(cost):
            return False

        # 1. Try to take from daily free credits
        if self.daily_free_credits >= cost:
            self.daily_free_credits -= cost
        else:
            # 2. If daily isn't enough, take what's left of daily, then take rest from purchased
            remaining_cost = cost - self.daily_free_credits
            self.daily_free_credits = 0
            self.purchased_credits -= remaining_cost
        
        self.save()
        return True

    def total_available(self):
        self.check_and_reset_daily_credits()
        return self.daily_free_credits + self.purchased_credits

    def __str__(self):
        return f"{self.user.email} - Total: {self.total_available()} (Daily: {self.daily_free_credits}, Paid: {self.purchased_credits})"