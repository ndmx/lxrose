# LxRose Frontend

Vite React app for both LxRose domains.

## Domains

- `lxroseinc.com`: public website
- `lxrose.org`: admin dashboard

The app detects the hostname in `src/App.jsx`. Use `VITE_SITE_MODE=admin` to force admin mode locally.

## Local Development

```bash
npm install
npm run dev
```

Force admin mode:

```bash
VITE_SITE_MODE=admin npm run dev
```

Optional local `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
# VITE_SITE_MODE=admin
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

Deploy from the repository root, not from this folder:

```bash
cd ..
npx firebase deploy --only functions,hosting:lxroseinc,hosting:lxroseorg,firestore:rules --project lxroseinc
```

See the root `README.md` for full setup, secrets, and deploy guidance.
