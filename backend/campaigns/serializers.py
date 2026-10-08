from rest_framework import serializers
from .models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "description",
            "target_amount",
            "creator",
            "created_at",
        ]
        read_only_fields = ["id", "creator", "created_at"]