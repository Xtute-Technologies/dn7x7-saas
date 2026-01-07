from django.conf import settings
from django.utils import timezone
import uuid
from django.db import models, transaction


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
    Daily credits reset once per calendar day.
    """
    DAILY_FREE_LIMIT = 20

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credit'
    )

    purchased_credits = models.PositiveIntegerField(default=0)
    daily_free_credits = models.PositiveIntegerField(default=DAILY_FREE_LIMIT)
    last_daily_reset = models.DateField(default=timezone.now)

    def check_and_reset_daily_credits(self):
        today = timezone.now().date()

        if self.last_daily_reset < today:
            self.daily_free_credits = self.DAILY_FREE_LIMIT
            self.last_daily_reset = today
            self.save(update_fields=['daily_free_credits', 'last_daily_reset'])

    def has_sufficient_credits(self, cost=1):
        self.check_and_reset_daily_credits()
        return (self.daily_free_credits + self.purchased_credits) >= cost

    def deduct_credits(self, cost=1):
        """
        Atomically deduct credits.
        Returns True if successful, False otherwise.
        """
        with transaction.atomic():
            credit = (
                UserCredit.objects
                .select_for_update()
                .get(pk=self.pk)
            )

            credit.check_and_reset_daily_credits()

            if credit.daily_free_credits + credit.purchased_credits < cost:
                return False

            if credit.daily_free_credits >= cost:
                credit.daily_free_credits -= cost
            else:
                remaining = cost - credit.daily_free_credits
                credit.daily_free_credits = 0
                credit.purchased_credits -= remaining

            credit.save(update_fields=['daily_free_credits', 'purchased_credits'])
            return True

    def total_available(self):
        self.check_and_reset_daily_credits()
        return self.daily_free_credits + self.purchased_credits

    def __str__(self):
        return (
            f"{self.user.email} | "
            f"Total: {self.total_available()} "
            f"(Daily: {self.daily_free_credits}, Paid: {self.purchased_credits})"
        )

  