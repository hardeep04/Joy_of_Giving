from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Campaign
from .serializers import CampaignSerializer

from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import permission_classes

from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
# Makes this a DRF view that accepts GET, POST requests
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def campaign_list(request):
    if request.method == "GET":
        # campaigns = Campaign.objects.all().order_by("-created_at")
        campaigns = (
            Campaign.objects
            .select_related("creator")
            .order_by("-created_at")
        )
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)

    serializer = CampaignSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(creator=request.user)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
def campaign_detail(request, pk):
    # campaign = get_object_or_404(Campaign, pk=pk)
    campaign = get_object_or_404(
        Campaign.objects.select_related("creator"),
        pk=pk,
    )
    serializer = CampaignSerializer(campaign)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_campaigns(request):
    campaigns = (
        Campaign.objects
        .filter(creator=request.user)
        .select_related("creator")
        .order_by("-created_at")
    )

    serializer = CampaignSerializer(campaigns, many=True)
    return Response(serializer.data)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def campaign_update(request, pk):
    campaign = get_object_or_404(
        Campaign.objects.select_related("creator"),
        pk=pk,
        creator=request.user,
    )
    
    if request.method == "GET":
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)
    
    serializer = CampaignSerializer(
        campaign,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def campaign_delete(request, pk):
    campaign = get_object_or_404(
        Campaign,
        pk=pk,
        creator=request.user,
    )

    campaign.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)