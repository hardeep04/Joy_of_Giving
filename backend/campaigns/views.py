from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Campaign
from .serializers import CampaignSerializer


@api_view(["GET"]) # Makes this a DRF view that accepts GET requests
def campaign_list(request):
    campaigns = Campaign.objects.all().order_by("-created_at") # - means descending order
    serializer = CampaignSerializer(campaigns, many=True)
    return Response(serializer.data)