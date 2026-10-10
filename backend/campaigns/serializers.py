from rest_framework import serializers
from .models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(
        source="creator.username",
        read_only=True,
    )

    remove_image = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "description",
            "image",
            "target_amount",
            "creator",
            "creator_username",
            "created_at",
            "remove_image",
        ]
        read_only_fields = ["id", "creator", "created_at"]


    
    def create(self, validated_data):
        validated_data.pop("remove_image", None)
        return super().create(validated_data)

    
    def update(self, instance, validated_data):
        remove_image = validated_data.pop("remove_image", False)

        if remove_image:
            validated_data["image"] = None

        return super().update(instance, validated_data)