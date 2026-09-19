# TFOS — Train Food Ordering System

TFOS lets train passengers order food from verified vendors at upcoming stations, right from their seat. It started as a purely theoretical Software Engineering capstone project (requirements, scope, and a MongoDB schema, but no working code) — this repository is the real, implemented, deployed version, rebuilt from scratch with a relational backend and a live full-stack architecture.

## Live Demo

- Frontend: `<add your deployed Vercel link here>`
- Backend API: `<add your deployed Render/Railway link here>`

## Overview

The platform connects three kinds of users:

- **Passengers** browse vendors by upcoming station, order food ahead of arrival, and track their order's status until it's delivered to their coach and seat.
- **Vendors** register, submit a profile for admin approval, then manage their menu and process incoming orders through a status pipeline (`pending → accepted → preparing → ready → delivered`).
- **Admin** verifies new vendors before they can go live, and has visibility into every order across every vendor on the platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, CSS Modules |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens), bcrypt password hashing |

## Architecture

```
React (Vite, port 5173)
       │  HTTP requests (Axios) + JWT in Authorization header
       ▼
Flask REST API (port 5000)
       │  SQLAlchemy ORM
       ▼
PostgreSQL
```

The frontend and backend are fully decoupled — they communicate only through a JSON REST API. Authentication is stateless: on login, Flask issues a signed JWT containing the user's ID and role; the frontend stores it and attaches it to every subsequent request that requires authorization.

## Features

### Passenger
- Register and log in
- Browse verified vendors, filterable by station
- View a vendor's menu
- Add items to a cart and place an order (selecting train, coach, and seat)
- View order history with a live status tracker

### Vendor
- Register and submit a vendor profile (station name)
- Profile stays in a **pending** state until approved by an admin — no menu or order actions are possible until then
- Once approved: add, view, and remove menu items
- View incoming orders and update their status through the fulfillment pipeline

### Admin
- One seeded account (not self-registrable, for security)
- View all vendors (verified and pending) and approve them
- View all orders across every vendor, grouped by vendor

## Database Schema

- **Users** — id, name, email, password hash, role (`passenger` / `vendor` / `admin`)
- **Vendors** — linked to a User, station name, verified flag
- **MenuItems** — linked to a Vendor, name, price
- **Trains** — seeded reference data (train number + route)
- **Orders** — linked to Passenger, Vendor, and Train; coach, seat, status, total price
- **OrderItems** — line items linking an Order to MenuItems with quantity and price

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/tfos_db
JWT_SECRET_KEY=<a long random string>
```

Create the database and tables:
```bash
python app.py   # creates tables on first run via db.create_all()
```

Seed reference data:
```bash
python seed.py        # seeds sample trains
python seed_admin.py  # creates the one admin account
```

Run the server:
```bash
python app.py
```
API runs at `http://localhost:5000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret key used to sign and verify JWTs — keep private, never commit |

## API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Register as passenger or vendor | — |
| POST | `/api/login` | Log in, returns JWT | — |
| GET | `/api/me` | Get current user info | Required |
| GET | `/api/vendorsList` | List verified vendors | — |
| GET | `/api/trains` | List seeded trains | — |
| POST | `/api/vendors` | Create a vendor profile | Vendor |
| GET | `/api/vendors/me` | Get own vendor profile | Vendor |
| GET | `/api/vendors/<id>/menu` | Get a vendor's menu | — |
| POST | `/api/vendors/<id>/menu` | Add a menu item | Vendor (approved) |
| DELETE | `/api/menu/<id>` | Remove a menu item | Vendor |
| POST | `/api/orders` | Place an order | Passenger |
| GET | `/api/orders/me` | Passenger's order history | Passenger |
| GET | `/api/orders/<id>` | Order detail with items | Passenger |
| GET | `/api/vendor/orders` | Vendor's incoming orders | Vendor (approved) |
| PATCH | `/api/orders/<id>/status` | Update order status | Vendor |
| GET | `/api/admin/vendors` | List all vendors | Admin |
| PATCH | `/api/admin/vendors/<id>/verify` | Approve a vendor | Admin |
| GET | `/api/admin/orders` | All orders, grouped by vendor | Admin |

## Future Improvements

These were deliberately scoped out of the MVP to keep it achievable and are natural next steps:

- **Real payment gateway** — currently orders are recorded without payment processing
- **Real PNR / live train data** — train and route data is currently seeded/mocked rather than pulled from an official railway API
- **Live order tracking / push notifications** — status updates currently require the passenger to refresh; a WebSocket-based live update system would remove that
- **Dedicated rider/delivery role** — vendors currently mark their own orders as delivered; a separate delivery role with its own dashboard would complete the fulfillment chain
- **Email verification** — registration currently accepts any correctly formatted email without confirming ownership
- **Vendor menu images** — vendors currently rely on automatic keyword-matched stock photos rather than uploading their own

## Project Background

This project began as a theoretical Software Engineering capstone (`Online Train Food Ordering System`) with a full requirements specification and a MongoDB schema, but was never implemented or deployed. This repository is that project rebuilt as a working, deployed, full-stack application — scoped to a focused MVP and built with a relational (PostgreSQL) backend instead of the original NoSQL design.