# FoodFlow Deployment Guide

## Goal

Deploy FoodFlow so it is reachable from a public browser with:

- a public web URL
- a production PostgreSQL database
- HTTPS
- automatic redeploys from Git

## Recommended Deployment Architecture

For this codebase, the best first production setup is:

- `Render Web Service` for the Spring Boot backend
- `Render Postgres` for the database
- the React frontend built into the backend and served from the same domain

This is the safest option because the frontend currently calls relative API paths such as `/login`, `/cart`, and `/restaurants/menu`. Serving frontend and backend from the same origin avoids CORS issues, cookie/session issues, and extra reverse-proxy work.

## Why This Setup Fits This Repo

This repository has:

- `frontend/` as a Create React App project
- `backend/` as a Spring Boot 3 app
- frontend requests written as same-origin browser requests
- Spring Security form login using server sessions

Because of that, the easiest live setup is:

1. Build the React app.
2. Copy the build output into `backend/src/main/resources/public/`.
3. Deploy only the backend as the public app.

Spring Boot will then serve both:

- the browser app
- the API

from one public hostname.

## Tools And Services To Use

## Hosting

- `Render Web Service`
- `Render Postgres`

Official docs used:

- https://render.com/docs/web-services
- https://render.com/docs/static-sites/
- https://render.com/docs/postgresql
- https://render.com/docs/configure-environment-variables
- https://render.com/docs/docker
- https://render.com/docs/native-runtimes

## Source Control

- `GitHub`

## Local Build Tools

- `Node.js 18+` or `20+`
- `npm`
- `Java 21`
- `Gradle Wrapper` via `./gradlew`

## Optional DNS / Domain

- any domain registrar you already use
- connect the domain to Render after the app is live

## Important Production Notes Before You Deploy

## 1. The database init script is destructive right now

In [backend/src/main/resources/application.yml](/Users/andrewshi/Desktop/Job/job/FoodFlow/backend/src/main/resources/application.yml:1), the backend uses:

- `spring.sql.init.mode: ${INIT_DB:always}`

And [backend/src/main/resources/database-init.sql](/Users/andrewshi/Desktop/Job/job/FoodFlow/backend/src/main/resources/database-init.sql:1) starts with `DROP TABLE IF EXISTS ...`.

That means if `INIT_DB=always`, each application start can wipe and recreate your data.

For production:

- use `INIT_DB=always` only for the very first bootstrap if you want the sample schema/data loaded
- after the first successful startup, switch to `INIT_DB=never`

Better long-term:

- move schema management to Flyway or Liquibase
- remove destructive `DROP TABLE` statements from production startup flow

## 2. The frontend should be rebuilt before each deploy

This repo already contains static files under [backend/src/main/resources/public](/Users/andrewshi/Desktop/Job/job/FoodFlow/backend/src/main/resources/public:1), but those are just a snapshot. Rebuild the frontend from `frontend/` and refresh those files before production deploys.

## 3. Do not deploy frontend and backend to different domains yet

You can do that later, but with the current code it would require:

- configurable frontend API base URLs
- backend CORS configuration
- session/cookie configuration for cross-origin auth
- likely HTTPS-only cookie adjustments

For now, one domain is the right move.

## Deployment Plan

## Step 1. Prepare the frontend production build

From the repo root:

```bash
cd frontend
npm ci
npm run build
```

This creates a production build in `frontend/build/`.

## Step 2. Copy the frontend build into the backend public folder

Replace the contents of:

- `backend/src/main/resources/public/`

with the contents of:

- `frontend/build/`

Your deployed Spring Boot app will serve those files directly.

Practical approach:

1. clear old files in `backend/src/main/resources/public/`
2. copy all files from `frontend/build/` into that folder
3. commit the updated static assets if you want Render to deploy directly from Git

## Step 3. Decide whether to seed production with sample data

You have two choices:

### Option A: start with sample restaurants and menu items

For the first deployment only:

- set `INIT_DB=always`

Then after the app starts successfully and the schema/data are loaded:

- change `INIT_DB=never`
- redeploy

### Option B: start with an empty production database

If you do not want sample data in production, update the backend first so production schema creation is handled by migrations instead of `database-init.sql`.

## Step 4. Push the repo to GitHub

Render is simplest when connected to GitHub for automatic deploys.

## Step 5. Create a PostgreSQL database on Render

In Render:

1. Create `New > PostgreSQL`.
2. Name it something like `foodflow-db`.
3. Choose a region close to your users.
4. Save the internal connection details.

You will need:

- host
- port
- database name
- username
- password

This app expects:

- database name: `onlineorder`

If Render creates a different database name by default, either:

- create/use a database named `onlineorder`, or
- update the datasource URL pattern in the app later

## Step 6. Create the Render web service for the backend

Create `New > Web Service` and connect the GitHub repo.

Recommended settings:

- Root Directory: `backend`
- Runtime / Language: `Docker`

Why Docker:

- Render's current native runtimes do not include Java
- Render recommends Docker for JVM apps such as Java
- this repo now has a Dockerfile that builds the jar during image creation

Important:

- leave Build Command blank in Render for Docker
- leave Start Command blank in Render for Docker unless you want to override the Dockerfile entrypoint
- Render will build from [backend/Dockerfile](/Users/andrewshi/Desktop/Job/job/FoodFlow/backend/Dockerfile:1)

What the Dockerfile now does:

1. uses Java 21 in a build stage
2. runs `./gradlew bootJar`
3. copies the generated jar into a smaller Java 21 runtime image
4. starts the Spring Boot app with `java -jar app.jar`

## Step 7. Configure environment variables in Render

Set these on the web service:

```text
DATABASE_URL=<render-internal-database-url>
INIT_DB=never
```

Notes:

- the app is now configured to use `server.port=${PORT:8080}` in [backend/src/main/resources/application.yml](/Users/andrewshi/Desktop/Job/job/FoodFlow/backend/src/main/resources/application.yml:1)
- Render provides the `PORT` environment variable automatically for web services
- you do not need to set `SERVER_PORT` manually for this setup
- `DATABASE_URL` should be the full internal PostgreSQL connection URL from Render
- you do not need separate host/port/database env vars on Render if `DATABASE_URL` is set
- keep `DATABASE_USERNAME` and `DATABASE_PASSWORD` unset unless you intentionally want to override credentials from the URL

For the very first deploy, if you want sample schema/data loaded:

```text
DATABASE_URL=<render-internal-database-url>
INIT_DB=always
```

Then change `INIT_DB` back to `never` immediately after bootstrap.

## Step 8. Configure health checks

Use a public GET endpoint that returns `200`.

Recommended health check path:

```text
/restaurants/menu
```

Why:

- it is publicly accessible with current security config
- it does not require login

Long-term, add Spring Boot Actuator and a dedicated `/actuator/health` endpoint.

## Step 9. Deploy and test

After deploy completes, test:

1. the Render URL loads in a browser
2. the homepage renders
3. restaurant data loads
4. signup works
5. login works
6. add-to-cart works
7. app restarts do not wipe data when `INIT_DB=never`

## Step 10. Add a custom domain

After the default `onrender.com` URL works:

1. open the Render service
2. add your custom domain
3. update your DNS records at your registrar/DNS provider
4. wait for TLS issuance and DNS propagation

Render provides HTTPS termination for web services.

## Recommended Render Configuration Summary

## Postgres

- Service type: `PostgreSQL`
- Region: same as backend
- Persistence: enabled by default on managed Postgres

## Web Service

- Service type: `Web Service`
- Root directory: `backend`
- Language: `Docker`
- Dockerfile path: `backend/Dockerfile`
- Health check path: `/restaurants/menu`
- Auto deploy: enabled

## Environment Variables

```text
DATABASE_URL=<render-internal-database-url>
INIT_DB=never
```

## Suggested Release Process

Each time you want to deploy:

1. update frontend code
2. run `npm run build` in `frontend/`
3. copy the new build into `backend/src/main/resources/public/`
4. commit and push
5. let Render auto-deploy

## Better Future Improvements

If you want production to be easier to maintain, these are the next upgrades I would make:

1. Add Flyway for non-destructive schema migrations.
2. Add a script or Gradle task that automatically copies `frontend/build/` into `backend/src/main/resources/public/`.
3. Add Spring Boot Actuator health endpoints.
4. Replace the checked-in built frontend assets with an automated build step.

## Alternative Architecture

You could also deploy:

- frontend as a Render Static Site
- backend as a separate Render Web Service
- database as Render Postgres

I do not recommend that as the first live deployment for this repo because the app currently assumes same-origin requests and session auth.

If you later want that split architecture, plan on adding:

- `REACT_APP_API_BASE_URL`
- backend CORS rules
- secure cookie/session settings
- possibly a reverse proxy

## Final Recommendation

If your goal is to get this project live quickly and reliably, use:

1. `Render Postgres`
2. `Render Web Service` for the Spring Boot app
3. the React production build copied into `backend/src/main/resources/public/`
4. `INIT_DB=never` after the first bootstrap

That gives you one public URL, one backend service, one database, and the fewest moving parts.
