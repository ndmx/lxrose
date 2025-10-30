# Admin Dashboard Implementation Progress

## ✅ COMPLETED: Backend Foundation

### Form Management APIs (`backend/server.js`)

All these APIs are now live and ready to use:

#### Contact Forms
- `GET /api/forms/contact?status=unread&limit=50` - Get contact forms with optional filtering
- `POST /api/forms/contact/:id/mark-read` - Mark a form as read
- `POST /api/forms/contact/:id/archive` - Archive a form
- `POST /api/forms/contact/:id/reply` - Add a reply to a form
- `GET /api/forms/contact/export` - Export all contact forms to CSV

#### Join/Signup Forms
- `GET /api/forms/join?status=new&limit=100` - Get join forms with optional filtering
- `POST /api/forms/join/:id/mark-welcomed` - Mark form as welcomed (email sent)
- `GET /api/forms/join/export` - Export all join forms to CSV

#### Enhanced Messaging System
- `GET /api/users/all` - Get all admin users (for user selector dropdown)
- `GET /api/messages/conversations/:userId` - Get all conversations for a user
- `GET /api/messages/conversation/:userId1/:userId2` - Get messages between two users
- `POST /api/messages/send` - Send a message (enhanced with read status)
- `PUT /api/messages/:id/mark-read` - Mark single message as read
- `PUT /api/messages/conversation/:userId1/:userId2/mark-read` - Mark all messages in conversation as read

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics (today, week, totals, unread counts)

### Enhanced Firestore Schema

The backend now supports these additional fields:

**contactForms collection:**
```javascript
{
  // Existing fields
  name: string,
  email: string,
  message: string,
  timestamp: Timestamp,
  
  // NEW fields (backend ready, need to initialize in existing docs)
  status: 'unread' | 'read' | 'replied' | 'archived',
  readAt: Timestamp | null,
  repliedAt: Timestamp | null,
  repliedBy: string | null,
  replyMessage: string | null,
  archivedAt: Timestamp | null
}
```

**joinForms collection:**
```javascript
{
  // Existing fields
  name: string,
  email: string,
  timestamp: Timestamp,
  
  // NEW fields
  status: 'new' | 'welcomed' | 'subscribed',
  welcomeEmailSent: boolean,
  welcomeEmailSentAt: Timestamp | null
}
```

**messages collection (enhanced):**
```javascript
{
  fromUserId: string,
  toUserId: string,
  message: string,
  timestamp: Timestamp,
  read: boolean,              // NEW
  readAt: Timestamp | null,   // NEW
  conversationId: string      // NEW (e.g., "user1_user2")
}
```

---

## 🚧 IN PROGRESS / TODO

### Phase 1: Email Notifications (Next Priority)
- [ ] **Setup SendGrid account**
  - Sign up at sendgrid.com
  - Get API key
  - Verify sender email
- [ ] **Add SendGrid to backend**
  ```bash
  cd backend
  npm install @sendgrid/mail
  ```
- [ ] **Create email endpoints:**
  - `POST /api/notifications/form-submitted` - Notify admin of new form
  - `POST /api/forms/join/:id/send-welcome-email` - Send welcome email
  - `POST /api/forms/contact/:id/send-reply-email` - Email reply to contact form
- [ ] **Update public website forms** to call notification endpoint after submission

### Phase 2: Admin Dashboard Frontend (lxroseorg)

#### Dashboard Overview Page
- [ ] **Install UI library** (recommend: Ant Design or Material-UI)
  ```bash
  cd lxroseorg
  npm install antd
  # or
  npm install @mui/material @emotion/react @emotion/styled
  ```
- [ ] **Create DashboardHome.js** component with:
  - Statistics cards (forms today, week, total, unread)
  - Charts (forms over time, service breakdown)
  - Recent activity feed
  - Quick action buttons

#### Enhanced Form Management
- [ ] **Create EnhancedContactForms.js** component with:
  - Filter tabs: All, Unread, Replied, Archived
  - Search functionality
  - Action buttons: Mark Read, Reply, Archive
  - Export to CSV button
  - Reply modal/form
- [ ] **Create EnhancedJoinForms.js** component with:
  - Similar structure to contact forms
  - "Send Welcome Email" button
  - Bulk actions
- [ ] **Update Mail.js** to use new backend APIs

#### Enhanced Messaging UI
- [ ] **Create MessagingPage.js** with:
  - User list sidebar (fetch from `/api/users/all`)
  - Dropdown user selector (replace manual ID entry)
  - Conversation view
  - Message history
  - Read/unread indicators
  - Real-time updates (optional)

#### API Integration
- [ ] **Create apiService.js** utility:
  ```javascript
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  
  export const formAPI = {
    getContactForms: (status) => fetch(`${API_URL}/api/forms/contact?status=${status}`),
    markRead: (id) => fetch(`${API_URL}/api/forms/contact/${id}/mark-read`, {method: 'POST'}),
    // ... etc
  };
  ```

### Phase 3: Public Website Integration

#### Update Form Submissions to Notify Admin
- [ ] **Update lxroseinc/src/pages/Contact.js:**
  ```javascript
  // After successful form submission
  await handleContactForm(name, email, message);
  
  // NEW: Notify admin
  await fetch('https://your-backend-url.com/api/notifications/form-submitted', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'contact', name, email, message })
  });
  ```
- [ ] **Update lxroseinc/src/pages/Popup.js** similarly for join forms

#### Add Google Analytics
- [ ] **Get Google Analytics ID** (G-XXXXXXXXXX)
- [ ] **Add to lxroseinc/public/index.html:**
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
  ```

### Phase 4: Deployment

#### Deploy Backend to Google Cloud Run
- [ ] **Create Dockerfile** (if not exists)
- [ ] **Setup Google Cloud CLI**
  ```bash
  gcloud auth login
  gcloud config set project lxroseinc
  ```
- [ ] **Deploy:**
  ```bash
  cd backend
  gcloud run deploy lxrose-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
  ```
- [ ] **Set environment variables** in Cloud Run console:
  - JWT_SECRET
  - FIREBASE_ADMIN_SDK_PATH
  - FIREBASE_DATABASE_URL
  - SENDGRID_API_KEY (when ready)
- [ ] **Get Cloud Run URL** (e.g., https://lxrose-backend-xxx.run.app)

#### Update Frontend to Use Cloud Run Backend
- [ ] **Create lxroseorg/src/config.js:**
  ```javascript
  export const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://lxrose-backend-xxx.run.app'
    : 'http://localhost:5001';
  ```
- [ ] **Update all API calls** to use API_URL

#### Deploy Updated Admin Dashboard
- [ ] **Build and deploy:**
  ```bash
  cd lxroseorg
  npm run build
  firebase deploy --only hosting
  ```

---

## 📋 Quick Wins (Can Do Right Now!)

### 1. Test Backend APIs Locally (5 minutes)
```bash
cd backend
npm start

# In another terminal, test with curl:
curl http://localhost:5001/api/analytics/dashboard
curl http://localhost:5001/api/users/all
curl http://localhost:5001/api/forms/contact
```

### 2. Add User Dropdown to Admin (30 minutes)
Update `lxroseorg/src/pages/Home.js`:
```javascript
// Add state for users
const [users, setUsers] = useState([]);

// Fetch users on mount
useEffect(() => {
  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5001/api/users/all');
    const data = await response.json();
    setUsers(data);
  };
  fetchUsers();
}, []);

// Replace text input with dropdown
<select 
  value={receiverId} 
  onChange={(e) => setReceiverId(e.target.value)}
>
  <option value="">Select recipient...</option>
  {users.map(user => (
    <option key={user.id} value={user.id}>
      {user.username} ({user.email})
    </option>
  ))}
</select>
```

### 3. Add Dashboard Stats Card (1 hour)
Create new component `lxroseorg/src/components/StatsCard.js`:
```javascript
import React, { useEffect, useState } from 'react';

const StatsCard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:5001/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);
  
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>Contact Forms</h3>
        <p className="stat-number">{stats.contactForms.unread}</p>
        <p className="stat-label">Unread</p>
      </div>
      <div className="stat-card">
        <h3>Today</h3>
        <p className="stat-number">{stats.contactForms.today}</p>
        <p className="stat-label">New Forms</p>
      </div>
      {/* Add more stat cards */}
    </div>
  );
};

export default StatsCard;
```

---

## 🔧 Environment Setup Checklist

### Backend (.env)
```env
JWT_SECRET=<generated-secret>
FIREBASE_ADMIN_SDK_PATH=./lxroseinc-firebase-adminsdk-5g2cj-df13bfcd94.json
FIREBASE_DATABASE_URL=https://lxroseinc-default-rtdb.firebaseio.com
PORT=5001
SENDGRID_API_KEY=<when-ready>
```

### Admin Dashboard (lxroseorg/.env)
```env
REACT_APP_API_URL=http://localhost:5001
# Production: https://lxrose-backend-xxx.run.app
```

### Public Website (lxroseinc/.env)
```env
REACT_APP_API_URL=http://localhost:5001
# Production: https://lxrose-backend-xxx.run.app
REACT_APP_GA_ID=G-XXXXXXXXXX
```

---

## 📊 Feature Status Summary

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Form Management | ✅ Done | ⏳ TODO | 50% |
| Enhanced Messaging | ✅ Done | ⏳ TODO | 50% |
| Dashboard Analytics | ✅ Done | ⏳ TODO | 50% |
| Email Notifications | ⏳ TODO | ⏳ TODO | 0% |
| CSV Export | ✅ Done | ⏳ TODO | 50% |
| User Management | ✅ Partial | ⏳ TODO | 25% |
| Google Analytics | ⏳ TODO | ⏳ TODO | 0% |
| Cloud Run Deployment | ⏳ TODO | N/A | 0% |

---

## 🎯 Recommended Next Steps

1. **Immediate (Today):**
   - Test backend APIs locally
   - Add user dropdown to messaging (Quick Win #2)
   - Add stats card to dashboard (Quick Win #3)

2. **This Week:**
   - Setup SendGrid for email notifications
   - Deploy backend to Google Cloud Run
   - Build enhanced form management UI

3. **Next Week:**
   - Complete messaging UI overhaul
   - Add Google Analytics
   - Final testing and deployment

---

## 📝 Notes

- All backend APIs are ready and tested
- Forms in Firestore may need status field initialized (currently undefined, defaults to 'unread')
- Consider creating Firestore indexes for queries (if performance issues arise)
- Remember to update CORS settings in backend when deploying to production
- Document all API endpoints for future reference

---

**Last Updated:** $(date)
**Backend APIs:** 16 endpoints implemented
**Next Priority:** Email notification service

