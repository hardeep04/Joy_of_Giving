from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


import json

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST

from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.forms import UserCreationForm


import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token

from .models import GoogleAccount



@api_view(["GET"])
@permission_classes([AllowAny])
def current_user(request):
    if request.user.is_authenticated:
        return Response({
            "is_authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
            },
        })

    return Response({
        "is_authenticated": False,
        "user": None,
    })


@require_GET
def csrf_token(request):
    return JsonResponse({
        "csrfToken": get_token(request),
    })


@require_POST
@csrf_protect
def login_user(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"detail": "Expected a JSON object."},
            status=400,
        )

    username = data.get("username")
    password = data.get("password")

    if (
        not isinstance(username, str)
        or not isinstance(password, str)
        or not username.strip()
        or not password
    ):
        return JsonResponse(
            {"detail": "Username and password are required."},
            status=400,
        )

    user = authenticate(
        request,
        username=username.strip(),
        password=password,
    )

    if user is None:
        return JsonResponse(
            {"detail": "Invalid username or password."},
            status=401,
        )

    login(request, user)

    return JsonResponse({
        "detail": "Logged in successfully.",
        "user": {
            "id": user.id,
            "username": user.username,
        },
    })


@require_POST
@csrf_protect
def logout_user(request):
    logout(request)

    return JsonResponse({
        "detail": "Logged out successfully.",
    })



@require_POST
@csrf_protect
def register_user(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"detail": "Expected a JSON object."},
            status=400,
        )

    fields = ["username", "password1", "password2"]

    if any(not isinstance(data.get(field), str) for field in fields):
        return JsonResponse(
            {"detail": "Username and both passwords are required."},
            status=400,
        )

    form = UserCreationForm({
        "username": data["username"].strip(),
        "password1": data["password1"],
        "password2": data["password2"],
    })

    if not form.is_valid():
        errors = {
            field: [error["message"] for error in field_errors]
            for field, field_errors in form.errors.get_json_data().items()
        }

        return JsonResponse(errors, status=400)

    user = form.save()

    return JsonResponse(
        {
            "detail": "Account created successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
            },
        },
        status=201,
    )


@require_POST
@csrf_protect
def google_login(request):
    if not settings.GOOGLE_CLIENT_ID:
        return JsonResponse(
            {"detail": "Google sign-in is not configured."},
            status=503,
        )

    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"detail": "Expected a JSON object."},
            status=400,
        )

    credential = data.get("credential")

    if not isinstance(credential, str) or not credential:
        return JsonResponse(
            {"detail": "Google credential is required."},
            status=400,
        )

    try:
        claims = id_token.verify_oauth2_token(
            credential,
            GoogleRequest(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return JsonResponse(
            {"detail": "Invalid or expired Google credential."},
            status=401,
        )
    except GoogleAuthError:
        return JsonResponse(
            {"detail": "Could not verify Google sign-in. Try again."},
            status=503,
        )

    google_sub = claims.get("sub")
    email = claims.get("email")

    if (
        not isinstance(google_sub, str)
        or not google_sub
        or not isinstance(email, str)
        or not email
        or claims.get("email_verified") is not True
    ):
        return JsonResponse(
            {"detail": "A verified Google account is required."},
            status=401,
        )

    account = (
        GoogleAccount.objects
        .select_related("user")
        .filter(google_sub=google_sub)
        .first()
    )

    if account:
        user = account.user
    else:
        User = get_user_model()

        # Matching email alone does not link an existing account.
        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse(
                {
                    "detail": (
                        "An account with this email already exists. "
                        "Use its existing login method. "
                        "Google account linking is not available yet."
                    )
                },
                status=409,
            )

        try:
            with transaction.atomic():
                user = User(
                    username=f"google_{uuid.uuid4().hex}",
                    email=email,
                    first_name=str(claims.get("given_name") or "")[:150],
                    last_name=str(claims.get("family_name") or "")[:150],
                )

                user.set_unusable_password()
                user.save()

                GoogleAccount.objects.create(
                    user=user,
                    google_sub=google_sub,
                )
        except IntegrityError:
            # Handle simultaneous first-time sign-in requests.
            account = (
                GoogleAccount.objects
                .select_related("user")
                .filter(google_sub=google_sub)
                .first()
            )

            if account is None:
                return JsonResponse(
                    {"detail": "Could not create your account. Try again."},
                    status=409,
                )

            user = account.user

    if not user.is_active:
        return JsonResponse(
            {"detail": "This account is disabled."},
            status=403,
        )

    login(
        request,
        user,
        backend="django.contrib.auth.backends.ModelBackend",
    )

    return JsonResponse({
        "detail": "Logged in successfully.",
        "user": {
            "id": user.id,
            "username": user.username,
        },
    })