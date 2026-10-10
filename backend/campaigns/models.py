from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class Campaign(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()

    image = models.ImageField(
        upload_to="campaigns/",
        blank=True,
    )

    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("1.00"))],
    )

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title