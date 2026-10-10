from rest_framework import serializers
from .models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(
        source="creator.username",
        read_only=True,
    )

    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "description",
            "target_amount",
            "creator",
            "creator_username",
            "created_at",
        ]
        read_only_fields = ["id", "creator", "created_at"]