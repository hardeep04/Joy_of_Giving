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