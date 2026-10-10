from django.urls import path
from .views import campaign_delete, campaign_list, campaign_detail, my_campaigns, campaign_update

urlpatterns = [
    path("", campaign_list, name="campaign-list"),
    path("mine/", my_campaigns, name="my-campaigns"),
    path("<int:pk>/", campaign_detail, name="campaign-detail"),
    path("<int:pk>/edit/", campaign_update, name="campaign-update"),
    path("<int:pk>/delete/", campaign_delete, name="campaign-delete"),
]