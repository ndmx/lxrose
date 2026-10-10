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

`lxroseinc/.env.local` is optional for local development. Use the `VITE_FIREBASE_*` public web settings in `.env.example` to submit forms locally. On Firebase Hosting the application loads the project web configuration from `/__/firebase/init.json` when a form is submitted:

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
npx firebase deploy --only functions,hosting:lxroseinc,hosting:lxroseorg,firestore:rules,database --project lxroseinc
```

Optional full rules deploy:

```bash
npx firebase deploy --only functions,hosting:lxroseinc,hosting:lxroseorg,firestore:rules,database,storage --project lxroseinc
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

## Security behavior and regression checks

Administrators manage user access. Staff and administrators can update care-request workflow fields through current and legacy routes. Viewers can read operational records but cannot update them. Personal messages remain private to their participants, including for administrators. The service API key is accepted only in `X-API-Key`; it cannot impersonate a message participant. Account directories expose only basic identity and role fields.

Accounts without a recognized role receive viewer access. A project owner must explicitly assign an existing legacy account its intended `admin`, `staff`, or `viewer` role in Firestore after reviewing that account. No account is automatically promoted. Setting `disabled: true` or `active: false` blocks future API requests and logins. Password changes and resets increment `tokenVersion`; existing bearer sessions are revoked. Users sign in again after changing their own password.

Anonymous Firestore writes accept only typed, bounded collection schemas and a server timestamp. The public booking payload is `name`, `email`, `phone`, `serviceType`, `serviceCategory`, `notes`, and `timestamp`. Public callers cannot set workflow status, assignment, or internal notes. Rules do not prevent all anonymous spam: App Check or a server intake service with durable abuse controls remains future work. Realtime Database is unused and denied at the root; do not enable it for this application.

The inbox has bounded cursor pagination and flags malformed legacy fields. Its summary counts describe the current page; older requests remain available through **Load older requests**. Existing future-dated records are excluded rather than silently promoted ahead of real requests. Investigate such records separately without deleting legitimate data.

Run security tests only against the isolated demo project (requires Node 22 and Java):

```bash
./lxroseinc/node_modules/.bin/firebase emulators:exec --project demo-lxrose --config firebase.test.json --only firestore,database "npm --prefix backend test"
npm --prefix lxroseinc test
npm --prefix lxroseinc run build
git diff --check
```

Deploy the frontend and API, then the stricter rules from the same pushed commit. Old cached public forms using client timestamps will be rejected by the new rules; reload the page to use the updated form. No production account, password, or submission is modified by the deployment itself.

The public homepage uses `@xlumina/system` 1.1.0, Variation 05, with locally hosted Manrope and Cormorant Garamond fonts. Font licenses are in `lxroseinc/public/fonts/`. The navigation is operable by keyboard; Escape closes the mobile menu and restores focus. Form inputs are preserved on save failure, and success is shown only after Firestore confirms persistence.
