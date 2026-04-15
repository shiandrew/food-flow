# FoodFlow

FoodFlow is an online ordering application organized as a single repository with separate frontend and backend projects.

## Repository Structure

```text
FoodFlow/
├─ frontend/    # React web client
└─ backend/     # Spring Boot API
```

## Tech Stack

- Frontend: React, Ant Design
- Backend: Spring Boot, Spring Security, Spring JDBC, PostgreSQL

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:8080`.

### Backend

```bash
cd backend
./gradlew bootRun
```

The backend runs on `http://localhost:8080`.

## Features

- User signup and login
- Restaurant and menu browsing
- Shopping cart management
- Checkout flow

## Notes

- `frontend/` contains the React client previously named `doordash-app`
- `backend/` contains the Spring Boot service previously named `OnlineOrder`
- The frontend expects the backend API to be available locally on port `8080`
