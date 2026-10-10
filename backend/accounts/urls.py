from django.urls import path
from .views import current_user, csrf_token, google_login, login_user, logout_user, register_user

urlpatterns = [
    path("me/", current_user, name="current-user"),
    path("csrf/", csrf_token, name="csrf-token"),
    path("login/", login_user, name="login-user"),
    path("logout/", logout_user, name="logout-user"),
    path("register/", register_user, name="register-user"),
    path("google/", google_login, name="google-login"),
]