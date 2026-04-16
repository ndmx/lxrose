# LxRose Backend API

Express app deployed as Firebase Gen 2 HTTPS Function `api`.

## Base URLs

- Local standalone: `http://localhost:5001`
- Production same-origin: `https://lxrose.org` and `https://lxroseinc.com`
- Direct function URL may change; prefer Hosting rewrites.

## Authentication

Admin endpoints require one of:

```http
Authorization: Bearer <admin-jwt>
```

or, for scripts/internal checks only:

```http
X-API-Key: <ADMIN_API_KEY>
```

The browser admin dashboard uses the Bearer token returned by `/login`.

## Auth And Users

### `POST /login`

Logs in with username or email.

```json
{
  "username": "Alexander",
  "password": "..."
}
```

Returns:

```json
{
  "token": "...",
  "userId": "Alexander",
  "mustChangePassword": false
}
```

### `POST /register`

Protected. Creates an admin/staff/viewer user with a temporary password.

```json
{
  "username": "admin",
  "email": "admin@lxrose.org",
  "password": "temporary-password",
  "role": "admin"
}
```

New users are stored with bcrypt-hashed passwords and `mustChangePassword: true`.

### `GET /getUser/:userId`

Protected. Returns a safe user object without password.

### `GET /api/users/all`

Protected. Returns all safe user objects.

### `POST /api/users/me/password`

Protected. Signed-in user changes their own password.

```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

### `PATCH /api/users/:userId/password`

Protected admin action. Resets another user's password to a temporary password and sets `mustChangePassword: true`.

```json
{
  "newPassword": "temporary-password"
}
```

## Unified Operations Inbox

### `GET /api/submissions`

Protected. Returns all public submissions normalized into one shape:

- contact forms
- join forms
- mental health bookings
- nursing bookings
- nurse registrations
- nutrition bookings

Returns:

```json
{
  "submissions": [],
  "stats": {
    "total": 0,
    "newContacts": 0,
    "bookingsToday": 0,
    "openFollowUps": 0,
    "byType": {},
    "byStatus": {}
  },
  "typeOptions": [],
  "statusOptions": ["new", "reviewed", "contacted", "scheduled", "closed"]
}
```

### `PATCH /api/submissions/:type/:id`

Protected. Updates status, assignee, and internal notes.

```json
{
  "status": "contacted",
  "assignedTo": "admin@lxrose.org",
  "internalNotes": "Called and left voicemail."
}
```

Valid `type` values:

- `contact`
- `join`
- `mental`
- `nursing`
- `nurse`
- `nutrition`

## Messages

### `GET /api/messages/conversations/:userId`

Protected. Returns conversations for a user. Merges legacy `users/{id}.mailbox` messages with new `messages` collection messages.

### `GET /api/messages/conversation/:userId1/:userId2`

Protected. Returns ordered messages between two users.

### `POST /api/messages/send`

Protected. Sends a new message into the `messages` collection.

```json
{
  "fromUserId": "Alexander",
  "toUserId": "Kunmi",
  "message": "Hello"
}
```

### `PUT /api/messages/conversation/:userId1/:userId2/mark-read`

Protected. Marks unread messages from `userId2` to `userId1` as read.

## Analytics

### `GET /api/analytics/dashboard`

Protected. Returns simple admin stats for contacts and join forms.

## Legacy Form Routes

Older protected routes are still present for compatibility:

- `GET /contactForms`
- `GET /joinForms`
- `GET /api/forms/contact`
- `GET /api/forms/join`
- `GET /api/forms/mental-bookings`
- `GET /api/forms/nursing-bookings`
- `GET /api/forms/nurse-registrations`
- `GET /api/forms/nutrition-bookings`
- CSV export routes under `/api/forms/*/export`

Prefer `/api/submissions` for new admin UI work.

## Local Checks

```bash
node -c server.js
node -c index.js
npm start
```
