from django.db import models

# Create your models here.
from django.conf import settings

class GoogleAccount(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="google_account",
    )

    google_sub = models.CharField(
        max_length=255,
        unique=True,
    )

    def __str__(self):
        return self.user.username