from django.urls import path
from .views import campaign_list


urlpatterns = [
    path("", campaign_list, name="campaign-list"),
]