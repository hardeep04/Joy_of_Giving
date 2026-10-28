# Joy of Giving

A full-stack fundraising application built with React, TypeScript, and Django REST Framework. Users can browse campaigns, create accounts, and manage their own fundraisers.

**Live Demo:** [https://joyofgiving.pythonanywhere.com/](https://joyofgiving.pythonanywhere.com/)

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap
- **Backend:** Django, Django REST Framework
- **Database:** SQLite
- **Authentication:** Django sessions with CSRF protection
- **Image handling:** Django ImageField and Pillow

## Features

- User registration, login, and logout
- Browse campaigns and view individual campaign details
- Search campaigns by title or description
- Create campaigns with a fundraising target and optional image
- View your own campaigns
- Edit and delete campaigns with backend ownership checks
- Upload, replace, or remove campaign images
- Default image for campaigns without an upload
- Display creator usernames on campaign cards
- Login-required toast when logged-out users try to add a campaign
- Responsive campaign cards using Bootstrap

> Payment processing and donation tracking are not implemented yet.

## Project Structure

- `backend/config/` — Django project configuration
- `backend/campaigns/` — Campaign models, serializers, and APIs
- `backend/accounts/` — Registration and session authentication
- `frontend/src/components/` — Reusable UI components
- `frontend/src/pages/` — Application pages
- `frontend/src/types/` — Shared TypeScript types
- `frontend/public/images/` — Default campaign image

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/hardeep04/Joy_of_Giving.git
cd Joy_of_Giving
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies and apply migrations:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
```

Optionally create an administrator account:

```bash
python manage.py createsuperuser
```

Start Django:

```bash
python manage.py runserver
```

Backend: http://127.0.0.1:8000  
Admin panel: http://127.0.0.1:8000/admin/

### 3. Set up the frontend

Open a separate terminal from the repository's main folder:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually:

http://localhost:5173

Keep both the frontend and backend servers running.

Vite forwards `/api` and `/media` requests to Django during development. If Vite uses a different port, update Django's `CSRF_TRUSTED_ORIGINS` accordingly.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/campaigns/` | List all campaigns |
| POST | `/api/campaigns/` | Create a campaign |
| GET | `/api/campaigns/<id>/` | View campaign details |
| GET | `/api/campaigns/mine/` | List your campaigns |
| GET | `/api/campaigns/<id>/edit/` | Load your campaign for editing |
| PATCH | `/api/campaigns/<id>/edit/` | Update your campaign |
| DELETE | `/api/campaigns/<id>/delete/` | Delete your campaign |
| GET | `/api/auth/csrf/` | Obtain a CSRF token |
| GET | `/api/auth/me/` | Check the current session |
| POST | `/api/auth/register/` | Register an account |
| POST | `/api/auth/login/` | Log in |
| POST | `/api/auth/logout/` | Log out |

Campaign creation requires login. Editing and deletion are restricted to the campaign creator. Session-authenticated write requests require a CSRF token.

## Checks

Frontend:

```bash
npm run build
npm run lint
```

Backend:

```bash
python manage.py check
```

## Current Scope

- Targets represent fundraising goals, not collected donations.
- SQLite and local media storage are used for development.
- Uploaded files and the local database are excluded from Git.
- Removing or replacing an image does not currently clean up the old stored file.
- Production deployment and payment integration are future work.

## Author

[Hardeep Singh](https://github.com/hardeep04)
