# LxRose

Domain-aware React frontend plus a shared Firebase Functions backend for LxRose.

## Live Sites

- Public website: https://lxroseinc.com
- Admin dashboard: https://lxrose.org
- Firebase public hosting: https://lxroseinc.web.app
- Firebase admin hosting: https://lxrose-admin.web.app

## Architecture

```text
LxRose/
  backend/        Express API, Firebase Admin SDK, Firebase Functions entrypoint
  lxroseinc/      Vite React app for both public and admin domains
  firebase.json   Root Firebase deploy config for Functions, Hosting, and rules
  .firebaserc     Firebase project and hosting target mapping
```

The React app chooses the experience by hostname:

- `lxroseinc.com` and `www.lxroseinc.com` render the public website.
- `lxrose.org` and `www.lxrose.org` render the admin dashboard.
- Local admin mode can be forced with `VITE_SITE_MODE=admin`.

The backend is deployed as a Firebase Gen 2 HTTPS Function named `api`. Firebase Hosting rewrites `/api/**`, `/login`, `/register`, `/verifyToken`, `/getUser/**`, and `/sendMessage` to that function.

## Requirements

- Node.js 22 for Firebase Functions compatibility
- npm
- Firebase CLI access to the `lxroseinc` Firebase project

## Install

```bash
cd backend
npm install

cd ../lxroseinc
npm install
```

## Local Environment

### Backend

Create a local-only backend env file:

```bash
cd backend
cp .env.example .env.local
```

Fill in:

```env
LXROSE_ADMIN_SDK_PATH=./your-firebase-adminsdk.json
JWT_SECRET=replace_with_local_jwt_secret
LXROSE_PORT=5001
LXROSE_DATABASE_URL=https://lxroseinc-default-rtdb.firebaseio.com
ADMIN_API_KEY=replace_with_local_admin_api_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174,https://lxroseinc.com,https://www.lxroseinc.com,https://lxrose.org,https://www.lxrose.org
```

Do not create `backend/.env` for this project. Firebase Functions reads `backend/.env` during deploy as production environment variables, which can conflict with Secret Manager secrets.

Local Functions emulator secrets can live in:

```text
backend/.secret.local
```

That file should contain only:

```env
JWT_SECRET=...
ADMIN_API_KEY=...
```

### Frontend

`lxroseinc/.env` is optional for local development:

```env
VITE_API_BASE_URL=http://localhost:5001
# VITE_SITE_MODE=admin
```

Production uses same-origin Firebase Hosting rewrites, so `lxroseinc/.env.production` keeps `VITE_API_BASE_URL` empty.

## Secrets

Never commit:

- `backend/.env.local`
- `backend/.secret.local`
- `lxroseinc/.env`
- Firebase Admin SDK JSON files
- private keys, passwords, or Firebase service account credentials

Production backend secrets are stored in Firebase Secret Manager:

```bash
npx firebase functions:secrets:set JWT_SECRET --project lxroseinc
npx firebase functions:secrets:set ADMIN_API_KEY --project lxroseinc
```

The public Firebase web API key in `lxroseinc/src/firebase.js` is client-side Firebase configuration. It is expected to be public and is protected by Firebase Security Rules.

## Development

Run the backend:

```bash
cd backend
npm run dev
```

Run the public frontend:

```bash
cd lxroseinc
npm run dev
```

Run the admin frontend locally:

```bash
cd lxroseinc
VITE_SITE_MODE=admin npm run dev
```

## Build

```bash
cd lxroseinc
npm run build
```

The production build is written to `lxroseinc/dist/`.

## Deploy

Deploy from the repository root, not from `lxroseinc/`:

```bash
npx firebase deploy --only functions,hosting:lxroseinc,hosting:lxroseorg,firestore:rules --project lxroseinc
```

Optional full rules deploy:

```bash
npx firebase deploy --only functions,hosting:lxroseinc,hosting:lxroseorg,firestore:rules,storage --project lxroseinc
```

## Admin Features

- Backend-backed login with bcrypt password storage
- User creation, password change, and password reset
- Unified submissions inbox across contact, booking, join, and nurse registration forms
- Status management: New, Reviewed, Contacted, Scheduled, Closed
- Assignment and internal notes
- Messages tab for legacy mailbox messages and new message collection entries
- Stats tab for contacts, signups, messages, submission type, and submission status
- Reply helper that opens a prefilled email draft from the admin's email client

## GitHub Readiness Checklist

Before pushing:

```bash
git status --short
git diff --check
git ls-files | rg '(^|/)(\\.env|.*adminsdk.*\\.json|.*serviceAccount.*\\.json)$'
```

Expected: no secret env files or Firebase Admin SDK JSON files should be tracked.

Verification commands:

```bash
cd backend
node -c server.js
node -c index.js

cd ../lxroseinc
npm run build
VITE_SITE_MODE=admin npm run build
```
