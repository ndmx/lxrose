# LxRose Project

This repository contains the codebase for two websites and their shared backend:

## Features

### Public Website (lxroseinc.com)
- Modern responsive design with FAQ, enhanced footer, and contact forms
- Service booking system for Mental Health, Nursing, and Nutrition services
- Professional nurse registration portal
- Newsletter signup and welcome banner
- Cookie consent management
- Service-specific landing pages with detailed information

### Admin Dashboard (lxrose.org)
- Secure authentication and user management
- Form submission management (contact forms, join forms, service bookings)
- Internal messaging system between admin users
- Service booking tracking (Mental Health, Nursing, Nutrition)
- Nurse registration review system
- Real-time data updates from Firestore

### Backend API
- RESTful API with Express.js
- Secure authentication with JWT tokens
- Form data management and retrieval
- Message handling between users
- File upload support
- Firebase Admin SDK integration

## Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router** v6 - Client-side routing
- **Firebase Client SDK** 10.4.0 - Authentication, Firestore, Storage
- **Swiper** 11.1.15 - Carousels and sliders
- **date-fns** 4.1.0 - Date formatting (admin dashboard)

### Backend
- **Node.js** with **Express** 4.18.2 - Server framework
- **Firebase Admin SDK** 12.0.0 - Server-side Firebase operations
- **bcrypt** 5.1.1 - Password hashing
- **jsonwebtoken** 9.0.2 - JWT authentication
- **multer** 1.4.5 - File upload handling
- **dotenv** 16.0.3 - Environment variable management

### Services & Infrastructure
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User authentication
- **Firebase Storage** - File storage
- **Firebase Hosting** - Website hosting

## Project Structure

### 1. lxroseinc/
**Website:** [lxroseinc.com](https://lxroseinc.com)  
**Description:** Main public-facing website providing nursing, mental health, and nutrition services.

**Technology Stack:**
- React 18.2.0
- React Router v6
- Firebase 10.4.0 (Firestore, Hosting)
- Swiper 11.0.7 (carousel/slider)

**Features:**
- Service pages (Nursing, Mental Health, Nutrition)
- About and Contact pages
- Service booking forms
- Professional registration forms
- Cookie consent management
- Promotional popups

**Setup:**
```bash
cd lxroseinc
npm install
npm start          # Development server on http://localhost:3000
npm run build      # Production build
```

**Firebase Deployment:**
```bash
firebase deploy --only hosting
```

---

### 2. lxroseorg/
**Website:** [lxrose.org](https://lxrose.org)  
**Description:** Administrative dashboard for managing users, forms, and content.

**Technology Stack:**
- React 18.2.0
- React Router v6
- Firebase 10.4.0 (Firestore, Authentication, Storage)
- date-fns 4.1.0

**Features:**
- User authentication and management
- Create and manage admin users
- View contact form submissions
- View join/registration form submissions
- Messaging system

**Setup:**
```bash
cd lxroseorg
npm install
npm start          # Development server on http://localhost:3000
npm run build      # Production build
```

**Firebase Deployment:**
```bash
firebase deploy --only hosting
```

---

### 3. backend/
**Description:** Express.js backend server providing API endpoints for both websites.

**Technology Stack:**
- Node.js with Express 4.18.2
- Firebase Admin SDK 12.0.0
- bcrypt 5.1.1 (password hashing)
- jsonwebtoken 9.0.2 (JWT authentication)
- multer 1.4.5 (file uploads)

**API Endpoints:**
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /verifyToken` - Token verification
- `GET /getUser/:userId` - Fetch user data
- `POST /sendMessage` - Send messages between users
- `GET /contactForms` - Retrieve contact form submissions
- `GET /joinForms` - Retrieve join form submissions
- `POST /uploadImage` - Image upload handling
- `GET /testFirebase` - Test Firebase connection

**Setup:**
```bash
cd backend
npm install
# IMPORTANT: Configure environment variables first (see Environment Setup section)
cp .env.example .env
# Edit .env with your credentials before running
npm start          # Start server on http://localhost:5001
npm run dev        # Development mode with nodemon
```

**Configuration:**
- Requires environment variables (see Environment Setup & Security section)
- Firebase Admin SDK credentials file (never commit this!)
- Default port: 5001 (configurable via .env)
- CORS enabled for cross-origin requests

---

## Firebase Configuration

Both websites use the same Firebase project: **lxroseinc**

**Firebase Services Used:**
- Firestore (Database)
- Authentication
- Storage
- Hosting (dual-target: lxroseinc and lxroseorg)

**Firebase Files:**
- `firebase.json` - Hosting and service configuration
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Storage security rules

---

## Environment Setup & Security

### Backend Environment Variables

The backend uses environment variables to protect sensitive credentials. **These must be configured before running the backend server.**

#### Step 1: Create Environment File

```bash
cd backend
cp .env.example .env
```

#### Step 2: Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (lxroseinc)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `lxroseinc-firebase-adminsdk-5g2cj-df13bfcd94.json` in the `backend/` folder

**⚠️ CRITICAL:** This file contains private keys with full admin access. **NEVER commit it to Git!**

#### Step 3: Generate JWT Secret

Generate a secure random string for JWT token signing:

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Step 4: Update .env File

Edit `backend/.env` and add your values:

```env
FIREBASE_ADMIN_SDK_PATH=./lxroseinc-firebase-adminsdk-5g2cj-df13bfcd94.json
JWT_SECRET=your_generated_secret_from_step_3
PORT=5001
FIREBASE_DATABASE_URL=https://lxroseinc-default-rtdb.firebaseio.com
```

### Frontend Configuration

The frontend Firebase configurations (lxroseinc and lxroseorg) are already set up and can be used as-is. These client-side API keys are safe to be public and are protected by Firebase Security Rules.

### Security Notes

**What's Protected:**
- ✅ Firebase Admin SDK private keys (backend only)
- ✅ JWT secret for token signing
- ✅ All `node_modules/` directories (heavy, auto-generated)
- ✅ Build output directories
- ✅ Environment variable files (`.env`)

**What's Safe to Commit:**
- ✅ Client-side Firebase config (already in code)
- ✅ Firebase Security Rules
- ✅ Source code
- ✅ Package configuration files

---

## Development Workflow

1. **Install dependencies** in each folder:
   ```bash
   cd lxroseinc && npm install
   cd ../lxroseorg && npm install
   cd ../backend && npm install
   ```

2. **Start development servers:**
   ```bash
   # Terminal 1 - Frontend (lxroseinc)
   cd lxroseinc && npm start

   # Terminal 2 - Admin (lxroseorg)
   cd lxroseorg && npm start

   # Terminal 3 - Backend
   cd backend && npm run dev
   ```

3. **Build for production:**
   ```bash
   cd lxroseinc && npm run build
   cd ../lxroseorg && npm run build
   ```

4. **Deploy to Firebase:**
   ```bash
   # Deploy main website
   cd lxroseinc && firebase deploy --only hosting

   # Deploy admin dashboard
   cd lxroseorg && firebase deploy --only hosting
   ```

---

## Important Notes

- The backend server requires the Firebase Admin SDK credentials file to be present in the `backend/` folder
- Both frontends connect to the same Firebase project
- The admin dashboard requires authentication before accessing features
- All forms submit data to Firebase Firestore
- The main website uses hash routing (`HashRouter`) for client-side routing

---

## GitHub Repositories

- **Main Website (lxroseinc.com):** [https://github.com/ndmx/lxroseapp.git](https://github.com/ndmx/lxroseapp.git)
- **Admin Dashboard (lxrose.org):** [https://github.com/ndmx/admin.git](https://github.com/ndmx/admin.git)

---

## License

This project is proprietary and confidential.

