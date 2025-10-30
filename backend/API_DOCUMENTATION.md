# LxRose Backend API Documentation

**Base URL (Development):** `http://localhost:5001`
**Base URL (Production):** `https://lxrose-backend-xxx.run.app` (after deployment)

---

## Authentication APIs

### POST /register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

---

### POST /login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_string",
  "userId": "user_document_id"
}
```

---

## Form Management APIs

### GET /api/forms/contact
Get contact form submissions with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status ("unread", "read", "replied", "archived")
- `limit` (optional): Max number of results (default: 100)

**Example Request:**
```
GET /api/forms/contact?status=unread&limit=50
```

**Response (200):**
```json
[
  {
    "id": "form_id",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I'm interested in your services...",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "unread",
    "readAt": null,
    "repliedAt": null,
    "repliedBy": null,
    "replyMessage": null
  }
]
```

---

### POST /api/forms/contact/:id/mark-read
Mark a contact form as read.

**Parameters:**
- `id`: Form document ID

**Response (200):**
```json
{
  "success": true,
  "message": "Form marked as read"
}
```

---

### POST /api/forms/contact/:id/archive
Archive a contact form.

**Parameters:**
- `id`: Form document ID

**Response (200):**
```json
{
  "success": true,
  "message": "Form archived"
}
```

---

### POST /api/forms/contact/:id/reply
Add a reply to a contact form.

**Parameters:**
- `id`: Form document ID

**Request Body:**
```json
{
  "replyMessage": "Thank you for your interest...",
  "repliedBy": "admin_user_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reply saved"
}
```

---

### GET /api/forms/contact/export
Export all contact forms to CSV format.

**Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="contact-forms.csv"`

**CSV Format:**
```
Name,Email,Message,Timestamp,Status
"John Doe","john@example.com","Message text...","2024-01-15T10:30:00Z","unread"
```

---

### GET /api/forms/join
Get join/signup form submissions with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status ("new", "welcomed", "subscribed")
- `limit` (optional): Max number of results (default: 100)

**Example Request:**
```
GET /api/forms/join?status=new&limit=50
```

**Response (200):**
```json
[
  {
    "id": "form_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "timestamp": "2024-01-15T11:00:00Z",
    "status": "new",
    "welcomeEmailSent": false,
    "welcomeEmailSentAt": null
  }
]
```

---

### POST /api/forms/join/:id/mark-welcomed
Mark a join form as welcomed (email sent).

**Parameters:**
- `id`: Form document ID

**Response (200):**
```json
{
  "success": true,
  "message": "Form marked as welcomed"
}
```

---

### GET /api/forms/join/export
Export all join forms to CSV format.

**Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="join-forms.csv"`

---

## Messaging APIs

### GET /api/users/all
Get all admin users (for user selector dropdown).

**Response (200):**
```json
[
  {
    "id": "user_id_1",
    "username": "johndoe",
    "email": "john@lxrose.org",
    "role": "admin"
  },
  {
    "id": "user_id_2",
    "username": "janesmith",
    "email": "jane@lxrose.org",
    "role": "manager"
  }
]
```

---

### GET /api/messages/conversations/:userId
Get all conversations for a specific user.

**Parameters:**
- `userId`: User document ID

**Response (200):**
```json
[
  {
    "userId": "partner_user_id",
    "lastMessage": "Let's schedule a meeting...",
    "lastTimestamp": "2024-01-15T14:30:00Z",
    "unread": true
  }
]
```

---

### GET /api/messages/conversation/:userId1/:userId2
Get all messages between two specific users.

**Parameters:**
- `userId1`: First user's document ID
- `userId2`: Second user's document ID

**Response (200):**
```json
[
  {
    "id": "message_id",
    "fromUserId": "user_id_1",
    "toUserId": "user_id_2",
    "message": "Hello, how are you?",
    "timestamp": "2024-01-15T10:00:00Z",
    "read": true,
    "readAt": "2024-01-15T10:05:00Z",
    "conversationId": "user_id_1_user_id_2"
  }
]
```

---

### POST /api/messages/send
Send a message to another user.

**Request Body:**
```json
{
  "fromUserId": "sender_user_id",
  "toUserId": "recipient_user_id",
  "message": "Message text here"
}
```

**Response (200):**
```json
{
  "success": true,
  "messageId": "new_message_id"
}
```

---

### PUT /api/messages/:id/mark-read
Mark a single message as read.

**Parameters:**
- `id`: Message document ID

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT /api/messages/conversation/:userId1/:userId2/mark-read
Mark all unread messages in a conversation as read.

**Parameters:**
- `userId1`: Current user's ID (receiving messages)
- `userId2`: Partner user's ID (sending messages)

**Response (200):**
```json
{
  "success": true,
  "updated": 5
}
```

---

## Analytics APIs

### GET /api/analytics/dashboard
Get comprehensive dashboard statistics.

**Response (200):**
```json
{
  "contactForms": {
    "total": 245,
    "today": 8,
    "thisWeek": 42,
    "unread": 12
  },
  "joinForms": {
    "total": 189,
    "today": 15,
    "thisWeek": 67
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

---

## Legacy/Existing APIs

### GET /getUser/:userId
Get user information by ID.

**Parameters:**
- `userId`: User document ID

**Response (200):**
```json
{
  "username": "johndoe",
  "email": "john@lxrose.org",
  "mailbox": [...],
  "sentMessages": [...]
}
```

---

### POST /sendMessage
Send a message (legacy endpoint, use /api/messages/send instead).

**Request Body:**
```json
{
  "fromId": "sender_id",
  "toId": "recipient_id",
  "messageObj": {
    "fromName": "string",
    "fromEmail": "string",
    "message": "string",
    "timestamp": "Timestamp"
  }
}
```

---

### GET /contactForms
Get all contact forms (legacy, use /api/forms/contact instead).

**Response (200):**
```json
[
  {
    "id": "form_id",
    "name": "string",
    "email": "string",
    "message": "string"
  }
]
```

---

### GET /joinForms
Get all join forms (legacy, use /api/forms/join instead).

---

## Error Responses

All endpoints may return error responses in this format:

**Response (4xx/5xx):**
```json
{
  "error": "Error description message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples

### JavaScript/React Fetch Examples

```javascript
// Get dashboard statistics
const getStats = async () => {
  const response = await fetch('http://localhost:5001/api/analytics/dashboard');
  const stats = await response.json();
  console.log(stats);
};

// Mark form as read
const markFormRead = async (formId) => {
  const response = await fetch(
    `http://localhost:5001/api/forms/contact/${formId}/mark-read`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  const result = await response.json();
  console.log(result);
};

// Send a message
const sendMessage = async (fromId, toId, message) => {
  const response = await fetch('http://localhost:5001/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fromUserId: fromId,
      toUserId: toId,
      message: message
    })
  });
  const result = await response.json();
  console.log(result);
};

// Export forms to CSV
const exportForms = () => {
  window.open('http://localhost:5001/api/forms/contact/export', '_blank');
};
```

---

### Curl Examples

```bash
# Get dashboard stats
curl http://localhost:5001/api/analytics/dashboard

# Get unread contact forms
curl "http://localhost:5001/api/forms/contact?status=unread"

# Mark form as read
curl -X POST http://localhost:5001/api/forms/contact/FORM_ID/mark-read

# Get all users
curl http://localhost:5001/api/users/all

# Send a message
curl -X POST http://localhost:5001/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "USER_1",
    "toUserId": "USER_2",
    "message": "Hello!"
  }'

# Export forms
curl http://localhost:5001/api/forms/contact/export > forms.csv
```

---

## CORS Configuration

The backend currently allows all origins (`app.use(cors())`).

For production, update to:
```javascript
app.use(cors({
  origin: [
    'https://lxroseinc.com',
    'https://lxrose.org',
    'http://localhost:3000'  // for development
  ]
}));
```

---

## Authentication Notes

- Login endpoint returns JWT token
- Currently, most endpoints don't require authentication
- **TODO:** Add JWT verification middleware for protected routes
- **Recommended:** Protect admin-only endpoints (/api/forms/*, /api/messages/*, etc.)

### Example JWT Middleware (to implement):
```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use: app.get('/api/forms/contact', verifyToken, async (req, res) => {...});
```

---

## Rate Limiting

**TODO:** Implement rate limiting for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

**Last Updated:** January 2024
**API Version:** 1.0.0
**Total Endpoints:** 20+ (including legacy)

