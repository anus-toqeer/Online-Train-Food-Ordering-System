# TFOS — Train Food Ordering System

TFOS is a learning-focused full-stack application that lets train passengers order food from verified vendors at upcoming stations and provide their coach and seat details for delivery.

The idea began as a theoretical Software Engineering capstone, documented in a PDF with requirements, scope, and a MongoDB schema. While learning React, I decided to bring it to life using a Flask API and PostgreSQL, learning the backend and deployment concepts along the way.

## Demo and Deployment

| Component | Hosting | URL |
|---|---|---|
| Frontend | Vercel | [Open TFOS](https://online-train-food-ordering-system.vercel.app/) |
| Backend API | Railway | [API base URL](https://online-train-food-ordering-system-production.up.railway.app) |
| PostgreSQL database | Neon | Private connection used by the backend |


## Overview

The platform connects three roles:

- **Passengers:** browse vendors by station, view menus, place orders with train, coach, and seat details, and check order status.
- **Vendors:** submit a profile for admin approval, manage their menu after approval, and process incoming orders.
- **Admins:** review and approve vendors and view orders across the platform.

The order workflow is: `pending → accepted → preparing → ready → delivered`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios, CSS Modules |
| Backend | Python, Flask, Gunicorn |
| Database access | Flask-SQLAlchemy, PostgreSQL driver (`psycopg2-binary`) |
| Database hosting | Neon PostgreSQL |
| Authentication | Flask-JWT-Extended, Flask-Bcrypt |
| Cross-origin requests | Flask-CORS |
| Deployment | Vercel for frontend, Railway for backend |

## How It Works

1. Vercel delivers the React application to the user's browser.
2. React sends HTTPS requests to the Flask API on Railway using Axios.
3. Flask validates requests, checks authentication and permissions, and reads or writes data in Neon through SQLAlchemy.
4. Flask returns JSON responses, and React updates the interface.

During registration, the backend stores the account with a hashed password. During login, it checks the credentials and issues a signed JWT. The frontend includes the token in the `Authorization: Bearer <token>` header when accessing protected endpoints.

Database credentials and the JWT signing secret belong only in the backend environment. The browser communicates with Flask, never directly with Neon. Backend permission checks must enforce each user's allowed actions.

The deployed application runs independently of the developer's laptop as long as its hosted services are available.

## Features

### Passenger

- Register and log in.
- Browse verified vendors and filter by station.
- View menus and add items to a cart.
- Place orders with train, coach, and seat details.
- View order history and status; refresh to retrieve updates.

### Vendor

- Register and submit a vendor profile with a station name.
- Wait for admin approval before accessing menu and order management.
- Add, view, and remove menu items after approval.
- View incoming orders and update their fulfillment status.

### Admin

- Use an account provisioned by the project owner; admin access is not a public registration option.
- View pending and approved vendors and passengers.
- Approve vendor profiles.
- View orders across vendors, grouped by vendor also by Passengers.

## Data Model

The application models the following entities. These are conceptual names; refer to the SQLAlchemy models for exact table names, columns, and constraints.

| Entity | Purpose |
|---|---|
| Users | Account ID, name, email, password hash, and role |
| Vendors | Vendor user, station, and approval status |
| Menu items | Vendor menu entries and prices |
| Trains | Reference train numbers and routes |
| Orders | Passenger, vendor, train, coach, seat, status, and total |
| Order items | Ordered menu items, quantities, and prices |

The confirmed `users` table contains `id`, `name`, `email`, `password_hash`, and `role`, all stored as character-varying columns.

## Local Setup

### Prerequisites

- Python compatible with `backend/requirements.txt`.
- Node.js and npm compatible with the project's Vite version.
- A PostgreSQL database, either local or hosted on Neon.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/anus-toqeer/Online-Train-Food-Ordering-System.git
cd Online-Train-Food-Ordering-System
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the environment in Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Or on macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```dotenv
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/tfos_db
JWT_SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

For Neon, use the connection string provided by your Neon project, including its SSL parameters. Never commit an actual connection string.

Generate a JWT secret locally:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Ensure the application loads local environment variables before reading them, configures `SQLALCHEMY_DATABASE_URI` from `DATABASE_URL` before `db.init_app(app)`, and sets `JWT_SECRET_KEY` before initializing JWT support.

Create the PostgreSQL database first when using a local server. Start the app:

```bash
python app.py
```

The documented local startup uses `db.create_all()` to create missing tables. This creates tables in an existing database; it does not create the PostgreSQL database itself or migrate existing tables.

With tables initialized, run reference-data scripts from a second terminal with the same environment activated:

```bash
python seed.py
```

Review seed scripts before running them against a shared database. Admin provisioning is described below.

The local API runs at `http://localhost:5000`.

### 3. Set Up the Frontend

From the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Ensure `frontend/src/api/axios.js` reads this setting instead of hardcoding a deployed host:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default api;
```

Start the frontend:

```bash
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

## Deployment Configuration

### Neon — Database

- Create or select the PostgreSQL database for TFOS.
- Copy its connection string into Railway's backend `DATABASE_URL` variable.
- Initialize tables and seed reference data against that database deliberately.
- Keep database credentials out of frontend settings and source control.

### Railway — Backend

| Setting | Value |
|---|---|
| Repository root directory | `/backend` |
| Dependency file | `requirements.txt` inside `backend/` |
| Start command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| Required variables | `DATABASE_URL`, `JWT_SECRET_KEY` |
| Public API URL | `https://online-train-food-ordering-system-production.up.railway.app` |

Use the public HTTPS domain in the frontend. A `.railway.internal` hostname is intended for private service communication and cannot serve as the browser's API URL.

Keep `gunicorn` and `psycopg2-binary` in the backend dependencies for this setup. The deployment previously encountered a missing `libpq.so.5` error with its PostgreSQL driver installation.

Gunicorn imports `app`; it does not execute code inside `if __name__ == '__main__':`. If table creation exists only in that block, it needs a separate initialization step for production.

### Vercel — Frontend

| Setting | Value |
|---|---|
| Repository root directory | `frontend` |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production `VITE_API_URL` | `https://online-train-food-ordering-system-production.up.railway.app` |

Redeploy the frontend after changing `VITE_API_URL`, because Vite includes its value at build time. Do not append `/api` to this base URL when request paths already begin with `/api`.

Configure Flask-CORS to allow the frontend origins:

```python
CORS(app, resources={r'/api/*': {'origins': [
    'http://localhost:5173',
    'https://online-train-food-ordering-system.vercel.app'
]}})
```

Match the case of folder names and imports exactly. In particular, `src/Api` and `src/api` are different directories on Linux build servers.

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | Backend only | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Backend only | Secret for signing and verifying JWTs |
| `VITE_API_URL` | Frontend | Public backend base URL |
| `PORT` | Backend hosting runtime | Port used by Gunicorn |

Frontend `VITE_` values are visible to users. Never place passwords or signing secrets in them. Keep `.env` files out of Git; commit only placeholder examples. Rotate any credentials previously exposed in commits or messages.

## Admin Setup and Database Resets

There is no guarantee that an admin account already exists in a fresh database. Clearing the `users` table removes admin accounts along with other users.

To provision an admin:

1. Register your own account through the application.
2. In the intended database, promote only that account using its registered email:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com'
RETURNING id, name, email, role;
```

3. Confirm that exactly one intended account is returned.
4. Log out and log in again to obtain a fresh session/token.

Alternatively, review and use `seed_admin.py` if it is configured for your intended database and private credentials. Do not publish reusable admin credentials in this README.

After a full data reset, restore train reference data and recreate vendor profiles, approvals, and menus before testing orders. A data reset does not remove Railway environment variables and will not fix a backend configuration error.

## API Overview

Paths below are relative to the backend base URL.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/register` | Register as passenger or vendor | Public |
| POST | `/api/login` | Log in and receive a JWT | Public |
| GET | `/api/me` | Get current user information | Authenticated |
| GET | `/api/vendorsList` | List verified vendors | Public |
| GET | `/api/trains` | List reference trains | Public |
| POST | `/api/vendors` | Create a vendor profile | Vendor |
| GET | `/api/vendors/me` | Get own vendor profile | Vendor |
| GET | `/api/vendors/<id>/menu` | View a vendor's menu | Public |
| POST | `/api/vendors/<id>/menu` | Add a menu item | Approved vendor |
| DELETE | `/api/menu/<id>` | Remove a menu item | Vendor |
| POST | `/api/orders` | Place an order | Passenger |
| GET | `/api/orders/me` | View own order history | Passenger |
| GET | `/api/orders/<id>` | View an order and its items | Passenger |
| GET | `/api/vendor/orders` | View incoming orders | Approved vendor |
| PATCH | `/api/orders/<id>/status` | Update order status | Vendor |
| GET | `/api/admin/vendors` | List all vendors | Admin |
| PATCH | `/api/admin/vendors/<id>/verify` | Approve a vendor | Admin |
| GET | `/api/admin/orders` | View orders grouped by vendor | Admin |

## Troubleshooting

| Symptom | What to check |
|---|---|
| Startup says `SQLALCHEMY_DATABASE_URI` must be set | Ensure Railway has a non-empty `DATABASE_URL` and the app reads it before initializing SQLAlchemy. |
| JWT creation fails with a missing secret | Check Railway's `JWT_SECRET_KEY` and the Flask configuration that reads it. |
| Requests still go to PythonAnywhere or localhost | Check Axios, set Vercel's production `VITE_API_URL`, and rebuild the frontend. |
| Login returns `401` | Read the response message; verify credentials and that the account exists in the target database. |
| A request returns `500` | Reproduce it, then inspect the newest Railway deployment's runtime logs for the actual exception. |
| Railway shows a crash | Check the newest deployment and its log timestamps; older failed deployments can show obsolete errors. |
| No trains or vendors appear after a reset | Restore reference data and create/approve vendors with menus. |

## Current Limitations and Future Improvements

This is a learning MVP, not a production railway or payment service.

- **Payments:** orders are recorded without a payment gateway.
- **Railway data:** trains and routes use reference/sample data rather than official live railway or PNR integration.
- **Status updates:** passengers refresh to retrieve changes; WebSocket updates or push notifications are future work.
- **Delivery:** vendors mark orders as delivered; there is no separate rider dashboard or GPS tracking.
- **Email ownership:** registration does not yet verify email ownership.
- **Menu images:** keyword-matched stock photos are used instead of vendor image uploads.
- **Database changes:** a migration workflow would improve schema updates beyond initial table creation.
- **Reliability:** deployment recovery and full passenger, vendor, and admin flow checks remain part of the ongoing work.

## Project Background

TFOS grew from a theoretical Software Engineering project into a practical way to apply React and learn how a frontend, API, authentication system, and database work together.

The original design used MongoDB on paper. This implementation uses PostgreSQL with Flask and SQLAlchemy, with the frontend and backend deployed separately. Building and troubleshooting the application has been part of the learning process, and the project will continue to improve as I learn more.
