const path = require('path');
// Load shared local env. Standalone local runs also load .env.local and .secret.local.
require('dotenv').config();
if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.local'), override: true });
  require('dotenv').config({ path: path.resolve(__dirname, '.secret.local'), override: true });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const admin = require("firebase-admin");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { ipKeyGenerator } = rateLimit;

// Configuration from environment variables
const port = process.env.LXROSE_PORT || process.env.PORT || 5001;
const firebaseAdminSDKPath = process.env.LXROSE_ADMIN_SDK_PATH || process.env.FIREBASE_ADMIN_SDK_PATH;
const databaseURL = process.env.LXROSE_DATABASE_URL
  || process.env.FIREBASE_DATABASE_URL
  || 'https://lxroseinc-default-rtdb.firebaseio.com';
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://lxroseinc.com',
  'https://www.lxroseinc.com',
  'https://lxrose.org',
  'https://www.lxrose.org'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const getJwtSecret = () => process.env.JWT_SECRET;
const getAdminApiKey = () => process.env.ADMIN_API_KEY;

if ((!getAdminApiKey() || !getJwtSecret()) && require.main === module) {
  console.error('ADMIN_API_KEY and JWT_SECRET are required. Set them in the environment to start the server securely.');
  process.exit(1);
}

// Firebase Admin Initialization
if (!admin.apps.length) {
  if (firebaseAdminSDKPath) {
    const resolvedServiceAccountPath = path.isAbsolute(firebaseAdminSDKPath)
      ? firebaseAdminSDKPath
      : path.resolve(__dirname, firebaseAdminSDKPath);
    const serviceAccount = require(resolvedServiceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });
  } else {
    admin.initializeApp({ databaseURL });
  }
}

const db = admin.firestore();

const app = express();
app.disable('x-powered-by');

const base64UrlEncode = (value) => Buffer
  .from(JSON.stringify(value))
  .toString('base64url');

const signAdminToken = (payload) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60)
  };
  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(unsignedToken)
    .digest('base64url');

  return `${unsignedToken}.${signature}`;
};

const verifyAdminToken = (token) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Malformed token');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', jwtSecret)
    .update(unsignedToken)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Expired token');
  }

  return payload;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!allowedOrigins.length) {
      return callback(null, true);
    }
    // Allow non-browser clients or same-origin requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }
    return allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

const rateLimitKeyGenerator = (req) => {
  if (req.ip) {
    return ipKeyGenerator(req.ip);
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return ipKeyGenerator(String(forwardedFor).split(',')[0].trim());
  }

  return req.headers['x-appengine-user-ip']
    || req.headers['fastly-client-ip']
    || req.socket?.remoteAddress
    || 'unknown-client';
};

app.use(cors(corsOptions)); // Restrictive when ALLOWED_ORIGINS is set
app.options('*', cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);
app.use('/login', authLimiter);

app.use(express.json({ limit: '1mb' })); // Middleware to parse JSON bodies

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const decoded = verifyAdminToken(token);
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
  }

  const adminApiKey = getAdminApiKey();
  if (!adminApiKey) {
    return res.status(500).json({ error: 'Server configuration error: missing admin API key' });
  }

  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  if (providedKey && providedKey === adminApiKey) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: invalid API key' });
};

const escapeCsvValue = (value = '') => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  const safeValue = /^[\s]*[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
  return `"${safeValue.replace(/"/g, '""')}"`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const isBcryptHash = (password) => /^\$2[aby]\$\d{2}\$/.test(password || '');

const isPasswordValid = async (plainPassword, storedPassword) => {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
};

const assertAdminCanManageUsers = async (req, res) => {
  if (!req.userId) {
    return true;
  }

  const adminDoc = await db.collection('users').doc(req.userId).get();
  const role = adminDoc.data()?.role;

  // Existing users were created before roles existed, so missing role keeps admin access.
  if (!role || role === 'admin') {
    return true;
  }

  res.status(403).send({ message: 'Only admin users can manage user access' });
  return false;
};

const getSafeUser = (doc) => {
  const { password, ...safeUser } = doc.data();
  return {
    id: doc.id,
    role: safeUser.role || 'admin',
    mustChangePassword: Boolean(safeUser.mustChangePassword),
    ...safeUser
  };
};

const submissionTypes = {
  contact: {
    collection: 'contactForms',
    label: 'Contact',
    category: 'Message'
  },
  join: {
    collection: 'joinForms',
    label: 'Join',
    category: 'Community'
  },
  mental: {
    collection: 'mentalServicesBookings',
    label: 'Mental Health',
    category: 'Booking'
  },
  nursing: {
    collection: 'nursingServiceBookings',
    label: 'Nursing',
    category: 'Booking'
  },
  nurse: {
    collection: 'nurseRegistrations',
    label: 'Nurse Registration',
    category: 'Registration'
  },
  nutrition: {
    collection: 'nutritionServiceBookings',
    label: 'Nutrition',
    category: 'Booking'
  }
};

const submissionStatuses = ['new', 'reviewed', 'contacted', 'scheduled', 'closed'];

const normalizeSubmissionStatus = (status) => {
  const value = (status || 'new').toString().toLowerCase();
  const legacyStatusMap = {
    unread: 'new',
    read: 'reviewed',
    replied: 'contacted',
    contacted: 'contacted',
    welcomed: 'contacted',
    archived: 'closed'
  };

  return submissionStatuses.includes(value) ? value : (legacyStatusMap[value] || 'new');
};

const parseTimestamp = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  if (typeof timestamp._seconds === 'number') {
    return new Date(timestamp._seconds * 1000);
  }

  if (typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getSubmissionFields = (type, data) => {
  const service = data.service || data.selectedService || data.serviceType || data.serviceTitle || '';

  switch (type) {
    case 'join':
      return {
        title: data.name || data.email || 'Community signup',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service: 'Community updates',
        subject: 'Join request',
        message: data.message || ''
      };
    case 'mental':
      return {
        title: data.name || service || 'Mental health booking',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service,
        subject: data.serviceCategory || 'Mental health booking',
        message: data.additionalInfo || data.notes || data.info || ''
      };
    case 'nursing':
      return {
        title: data.name || data.serviceType || 'Nursing booking',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service: data.serviceType || service,
        subject: data.serviceCategory || 'Nursing booking',
        message: data.additionalNotes || data.notes || data.info || data.contactInfo || ''
      };
    case 'nurse':
      return {
        title: data.name || 'Nurse registration',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service: data.qualifications || 'Nurse registration',
        subject: `${data.yearsOfExperience || '0'} years experience`,
        message: data.availability || ''
      };
    case 'nutrition':
      return {
        title: data.name || service || 'Nutrition booking',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service,
        subject: data.serviceCategory || 'Nutrition booking',
        message: data.info || data.notes || data.additionalInfo || ''
      };
    case 'contact':
    default:
      return {
        title: data.name || data.subject || 'Contact message',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        service: '',
        subject: data.subject || 'General inquiry',
        message: data.message || ''
      };
  }
};

const normalizeSubmission = (type, doc) => {
  const config = submissionTypes[type];
  const data = doc.data();
  const timestamp = parseTimestamp(data.timestamp);
  const fields = getSubmissionFields(type, data);

  return {
    id: doc.id,
    type,
    typeLabel: config.label,
    category: config.category,
    ...fields,
    timestamp: timestamp ? timestamp.toISOString() : null,
    status: normalizeSubmissionStatus(data.status),
    assignedTo: data.assignedTo || '',
    internalNotes: data.internalNotes || '',
    updatedAt: formatTimestamp(data.updatedAt),
    raw: data
  };
};

const normalizeMessage = (doc) => {
  const data = doc.data();
  const timestamp = parseTimestamp(data.timestamp);

  return {
    id: doc.id,
    ...data,
    timestamp: timestamp ? timestamp.toISOString() : null
  };
};

const addUserIdentity = (identityMap, value, userId) => {
  if (value) {
    identityMap.set(String(value).toLowerCase(), userId);
  }
};

const getLegacyMailboxMessages = async () => {
  const usersSnapshot = await db.collection('users').get();
  const userDocs = usersSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
  const userIdentityMap = new Map();

  userDocs.forEach(({ id, data }) => {
    addUserIdentity(userIdentityMap, id, id);
    addUserIdentity(userIdentityMap, data.username, id);
    addUserIdentity(userIdentityMap, data.email, id);
  });

  return userDocs.flatMap(({ id: recipientId, data }) => {
    const mailbox = Array.isArray(data.mailbox) ? data.mailbox : [];

    return mailbox.map((message, index) => {
      const timestamp = parseTimestamp(message.timestamp);
      const senderId = userIdentityMap.get(String(message.fromEmail || '').toLowerCase())
        || userIdentityMap.get(String(message.fromName || '').toLowerCase())
        || message.fromName
        || message.fromEmail
        || 'Unknown sender';

      return {
        id: `legacy-${recipientId}-${index}-${timestamp ? timestamp.getTime() : 'unknown'}`,
        fromUserId: senderId,
        toUserId: recipientId,
        fromName: message.fromName || '',
        fromEmail: message.fromEmail || '',
        message: message.message || '',
        timestamp: timestamp ? timestamp.toISOString() : null,
        read: message.read !== false,
        legacy: true
      };
    });
  });
};

const getStoredMessagesForUser = async (userId) => {
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    db.collection('messages').where('fromUserId', '==', userId).get(),
    db.collection('messages').where('toUserId', '==', userId).get()
  ]);

  const storedMessages = [...sentSnapshot.docs, ...receivedSnapshot.docs].map((doc) => normalizeMessage(doc));
  const legacyMessages = await getLegacyMailboxMessages();

  return [
    ...storedMessages,
    ...legacyMessages.filter((message) => message.fromUserId === userId || message.toUserId === userId)
  ];
};

// POST /register
app.post('/register', requireAdminAuth, async (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || 'admin').trim() || 'admin';

  if (!username || !email || !password) {
    return res.status(400).send({ message: 'Username, email, and password are required' });
  }

  try {
    const canManageUsers = await assertAdminCanManageUsers(req, res);
    if (!canManageUsers) {
      return;
    }

    const usersRef = admin.firestore().collection('users');
    const [usernameSnapshot, emailSnapshot] = await Promise.all([
      usersRef.where('username', '==', username).get(),
      usersRef.where('email', '==', email).get()
    ]);

    if (!usernameSnapshot.empty || !emailSnapshot.empty) {
      return res.status(409).send({ message: 'A user with that username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const documentId = username.replace(/\//g, '-');
    const newUserRef = usersRef.doc(documentId);
    const existingDoc = await newUserRef.get();

    if (existingDoc.exists) {
      return res.status(409).send({ message: 'A user with that username already exists' });
    }

    await newUserRef.set({
      username,
      email,
      password: hashedPassword,
      role,
      mustChangePassword: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.userId || 'api-key'
    });

    res.status(201).send({
      message: 'User registered successfully',
      user: {
        id: newUserRef.id,
        username,
        email,
        role,
        mustChangePassword: true
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ message: 'Error registering user' });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Search for the user by username first, then email for admin identities like admin@lxrose.org.
    const usersRef = admin.firestore().collection('users');
    let querySnapshot = await usersRef.where('username', '==', username).get();

    if (querySnapshot.empty) {
      querySnapshot = await usersRef.where('email', '==', username).get();
    }

    if (querySnapshot.empty) {
      return res.status(401).send('Invalid username or password');
    }

    // Assuming there is only one user with this username
    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    const passwordIsValid = await isPasswordValid(password, user.password);

    if (!isBcryptHash(user.password) && passwordIsValid) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userDoc.ref.update({ password: hashedPassword });
    }

    if (!passwordIsValid) {
      return res.status(401).send('Invalid username or password');
    }

    // Generate a JWT token
    const token = signAdminToken({ userId: userDoc.id });
    res.json({ token, userId: userDoc.id, mustChangePassword: Boolean(user.mustChangePassword) });
  } catch (error) {
    res.status(500).send({ message: 'Login error' });
  }
});


// POST /verifyToken
app.post('/verifyToken', async (req, res) => {
  const idToken = req.body.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    res.send({ status: 'success', uid });
  } catch (error) {
    res.status(401).send({ status: 'error', message: 'Invalid token' });
  }
});

// GET /getUser/:userId
app.get('/getUser/:userId', requireAdminAuth, async (req, res) => {
  const userId = req.params.userId;
  try {
    const userRef = admin.firestore().doc(`users/${userId}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      res.status(404).send('User not found');
    } else {
      res.json(getSafeUser(userSnap));
    }
  } catch (error) {
    res.status(500).send('Error fetching user');
  }
});

app.post('/api/users/me/password', requireAdminAuth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).send({ message: 'Password changes require a signed-in user session' });
  }

  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');

  if (!currentPassword || !newPassword) {
    return res.status(400).send({ message: 'Current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).send({ message: 'New password must be at least 8 characters' });
  }

  try {
    const userRef = db.collection('users').doc(req.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }

    const user = userDoc.data();
    const passwordIsValid = await isPasswordValid(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({
      password: hashedPassword,
      mustChangePassword: false,
      passwordUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordUpdatedBy: req.userId
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send({ message: 'Error changing password' });
  }
});

app.patch('/api/users/:userId/password', requireAdminAuth, async (req, res) => {
  const targetUserId = req.params.userId;
  const newPassword = String(req.body.newPassword || '');

  if (!newPassword) {
    return res.status(400).send({ message: 'New password is required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).send({ message: 'New password must be at least 8 characters' });
  }

  try {
    const canManageUsers = await assertAdminCanManageUsers(req, res);
    if (!canManageUsers) {
      return;
    }

    const userRef = db.collection('users').doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({
      password: hashedPassword,
      mustChangePassword: true,
      passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordResetBy: req.userId || 'api-key'
    });

    const updatedDoc = await userRef.get();
    res.json({
      success: true,
      message: 'Password reset successfully',
      user: getSafeUser(updatedDoc)
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send({ message: 'Error resetting password' });
  }
});

// POST /sendMessage
app.post('/sendMessage', requireAdminAuth, async (req, res) => {
  const { fromId, toId, messageObj } = req.body;
  try {
    const fromUserRef = admin.firestore().doc(`users/${fromId}`);
    const toUserRef = admin.firestore().doc(`users/${toId}`);
    await fromUserRef.update({ sentMessages: admin.firestore.FieldValue.arrayUnion(messageObj) });
    await toUserRef.update({ mailbox: admin.firestore.FieldValue.arrayUnion(messageObj) });
    res.send({ status: 'success' });
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});

// GET /contactForms
app.get('/contactForms', requireAdminAuth, async (req, res) => {
  try {
    const contactFormsRef = admin.firestore().collection('contactForms');
    const snapshot = await contactFormsRef.get();
    const contactForms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(contactForms);
  } catch (error) {
    res.status(500).send('Error fetching contact forms');
  }
});

// GET /joinForms
app.get('/joinForms', requireAdminAuth, async (req, res) => {
  try {
    const joinFormsRef = admin.firestore().collection('joinForms');
    const snapshot = await joinFormsRef.get();
    const joinForms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(joinForms);
  } catch (error) {
    res.status(500).send('Error fetching join forms');
  }
});

// POST /uploadImage
app.post('/uploadImage', upload.single('image'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;
  // Image upload logic goes here
});

// Test Firebase Connection
app.get('/testFirebase', async (req, res) => {
  try {
    const docRef = db.collection('someCollection').doc('someDocId');
    const doc = await docRef.get();
    if (!doc.exists) {
      res.send('No such document!');
    } else {
      res.send(doc.data());
    }
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    res.status(500).send('Error connecting to Firestore');
  }
});

// ============== FORM MANAGEMENT APIs ==============

// GET Contact Forms with filtering
app.get('/api/forms/contact', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    let query = db.collection('contactForms');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('timestamp', 'desc').limit(parseInt(limit)).get();
    const forms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(forms);
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    res.status(500).json({ error: 'Error fetching forms' });
  }
});

// Mark Contact Form as Read
app.post('/api/forms/contact/:id/mark-read', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('contactForms').doc(id).update({
      status: 'read',
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Form marked as read' });
  } catch (error) {
    console.error('Error marking form as read:', error);
    res.status(500).json({ error: 'Error updating form' });
  }
});

// Archive Contact Form
app.post('/api/forms/contact/:id/archive', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('contactForms').doc(id).update({
      status: 'archived',
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Form archived' });
  } catch (error) {
    console.error('Error archiving form:', error);
    res.status(500).json({ error: 'Error archiving form' });
  }
});

// Reply to Contact Form
app.post('/api/forms/contact/:id/reply', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, repliedBy } = req.body;
    
    await db.collection('contactForms').doc(id).update({
      status: 'replied',
      replyMessage,
      repliedBy,
      repliedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Reply saved' });
  } catch (error) {
    console.error('Error replying to form:', error);
    res.status(500).json({ error: 'Error saving reply' });
  }
});

// Export Contact Forms to CSV
app.get('/api/forms/contact/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('contactForms').orderBy('timestamp', 'desc').get();
    const forms = snapshot.docs.map(doc => doc.data());
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Message', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    forms.forEach(form => {
      const row = [
        escapeCsvValue(form.name),
        escapeCsvValue(form.email),
        escapeCsvValue(form.message),
        escapeCsvValue(formatTimestamp(form.timestamp)),
        escapeCsvValue(form.status || 'unread')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contact-forms.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting forms:', error);
    res.status(500).json({ error: 'Error exporting forms' });
  }
});

// GET Join Forms with filtering
app.get('/api/forms/join', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    let query = db.collection('joinForms');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('timestamp', 'desc').limit(parseInt(limit)).get();
    const forms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(forms);
  } catch (error) {
    console.error('Error fetching join forms:', error);
    res.status(500).json({ error: 'Error fetching forms' });
  }
});

// Mark Join Form as Welcomed
app.post('/api/forms/join/:id/mark-welcomed', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('joinForms').doc(id).update({
      status: 'welcomed',
      welcomeEmailSent: true,
      welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Form marked as welcomed' });
  } catch (error) {
    console.error('Error marking form:', error);
    res.status(500).json({ error: 'Error updating form' });
  }
});

// Export Join Forms to CSV
app.get('/api/forms/join/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('joinForms').orderBy('timestamp', 'desc').get();
    const forms = snapshot.docs.map(doc => doc.data());
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Timestamp', 'Status', 'Welcome Email Sent'];
    const csvRows = [headers.join(',')];
    
    forms.forEach(form => {
      const row = [
        escapeCsvValue(form.name),
        escapeCsvValue(form.email),
        escapeCsvValue(formatTimestamp(form.timestamp)),
        escapeCsvValue(form.status || 'new'),
        escapeCsvValue(form.welcomeEmailSent ? 'Yes' : 'No')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="join-forms.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting forms:', error);
    res.status(500).json({ error: 'Error exporting forms' });
  }
});

// GET unified operations inbox across all public submissions.
app.get('/api/submissions', requireAdminAuth, async (req, res) => {
  try {
    const { limit = 250 } = req.query;
    const perCollectionLimit = Math.max(1, parseInt(limit, 10) || 250);
    const snapshots = await Promise.all(
      Object.entries(submissionTypes).map(async ([type, config]) => {
        const snapshot = await db
          .collection(config.collection)
          .orderBy('timestamp', 'desc')
          .limit(perCollectionLimit)
          .get();

        return snapshot.docs.map((doc) => normalizeSubmission(type, doc));
      })
    );

    const submissions = snapshots
      .flat()
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, perCollectionLimit);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = submissions.reduce((acc, submission) => {
      const submittedAt = submission.timestamp ? new Date(submission.timestamp) : null;

      acc.total += 1;
      if (submission.type === 'contact' && submission.status === 'new') {
        acc.newContacts += 1;
      }
      if (submission.category === 'Booking' && submittedAt && submittedAt >= today) {
        acc.bookingsToday += 1;
      }
      if (['new', 'reviewed'].includes(submission.status)) {
        acc.openFollowUps += 1;
      }
      acc.byType[submission.type] = (acc.byType[submission.type] || 0) + 1;
      acc.byStatus[submission.status] = (acc.byStatus[submission.status] || 0) + 1;

      return acc;
    }, {
      total: 0,
      newContacts: 0,
      bookingsToday: 0,
      openFollowUps: 0,
      byType: {},
      byStatus: {}
    });

    res.json({
      submissions,
      stats,
      typeOptions: Object.entries(submissionTypes).map(([value, config]) => ({
        value,
        label: config.label
      })),
      statusOptions: submissionStatuses
    });
  } catch (error) {
    console.error('Error fetching unified submissions:', error);
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// PATCH unified operations inbox submission metadata.
app.patch('/api/submissions/:type/:id', requireAdminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const config = submissionTypes[type];

    if (!config) {
      return res.status(400).json({ error: 'Unknown submission type' });
    }

    const updates = {};
    const { status, assignedTo, internalNotes } = req.body;

    if (status !== undefined) {
      const normalizedStatus = normalizeSubmissionStatus(status);
      if (!submissionStatuses.includes(normalizedStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = normalizedStatus;
    }

    if (assignedTo !== undefined) {
      updates.assignedTo = String(assignedTo).trim();
    }

    if (internalNotes !== undefined) {
      updates.internalNotes = String(internalNotes);
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.updatedBy = req.userId || 'api-key';

    const docRef = db.collection(config.collection).doc(id);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();

    res.json(normalizeSubmission(type, updatedDoc));
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Error updating submission' });
  }
});

// ============== SERVICE BOOKING APIs ==============

// GET Mental Health Bookings
app.get('/api/forms/mental-bookings', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = db.collection('mentalServicesBookings').orderBy('timestamp', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching mental health bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Mark Mental Health Booking as Contacted
app.post('/api/forms/mental-bookings/:id/mark-contacted', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('mentalServicesBookings').doc(id).update({
      status: 'contacted',
      contactedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Booking marked as contacted' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Error updating booking' });
  }
});

// Export Mental Health Bookings to CSV
app.get('/api/forms/mental-bookings/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('mentalServicesBookings').orderBy('timestamp', 'desc').get();
    const bookings = snapshot.docs.map(doc => doc.data());
    
    const headers = ['Name', 'Email', 'Service', 'Additional Info', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    bookings.forEach(booking => {
      const row = [
        escapeCsvValue(booking.name),
        escapeCsvValue(booking.email),
        escapeCsvValue(booking.selectedService || booking.service),
        escapeCsvValue(booking.additionalInfo),
        escapeCsvValue(formatTimestamp(booking.timestamp)),
        escapeCsvValue(booking.status || 'new')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mental-health-bookings.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ error: 'Error exporting bookings' });
  }
});

// GET Nursing Service Bookings
app.get('/api/forms/nursing-bookings', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = db.collection('nursingServiceBookings').orderBy('timestamp', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching nursing bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Mark Nursing Booking as Contacted
app.post('/api/forms/nursing-bookings/:id/mark-contacted', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('nursingServiceBookings').doc(id).update({
      status: 'contacted',
      contactedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Booking marked as contacted' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Error updating booking' });
  }
});

// Export Nursing Bookings to CSV
app.get('/api/forms/nursing-bookings/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('nursingServiceBookings').orderBy('timestamp', 'desc').get();
    const bookings = snapshot.docs.map(doc => doc.data());
    
    const headers = ['Service Type', 'Patient Age', 'Care Duration', 'Start Date', 'Contact Info', 'Additional Notes', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    bookings.forEach(booking => {
      const row = [
        escapeCsvValue(booking.serviceType),
        escapeCsvValue(booking.patientAge),
        escapeCsvValue(booking.careDuration),
        escapeCsvValue(booking.startDate),
        escapeCsvValue(booking.contactInfo),
        escapeCsvValue(booking.additionalNotes),
        escapeCsvValue(formatTimestamp(booking.timestamp)),
        escapeCsvValue(booking.status || 'new')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nursing-bookings.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ error: 'Error exporting bookings' });
  }
});

// GET Nurse Registrations
app.get('/api/forms/nurse-registrations', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = db.collection('nurseRegistrations').orderBy('timestamp', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching nurse registrations:', error);
    res.status(500).json({ error: 'Error fetching registrations' });
  }
});

// Mark Nurse Registration as Reviewed
app.post('/api/forms/nurse-registrations/:id/mark-reviewed', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('nurseRegistrations').doc(id).update({
      status: 'reviewed',
      reviewedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Registration marked as reviewed' });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Error updating registration' });
  }
});

// Export Nurse Registrations to CSV
app.get('/api/forms/nurse-registrations/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('nurseRegistrations').orderBy('timestamp', 'desc').get();
    const registrations = snapshot.docs.map(doc => doc.data());
    
    const headers = ['Name', 'Qualifications', 'Years of Experience', 'Availability', 'Email', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    registrations.forEach(reg => {
      const row = [
        escapeCsvValue(reg.name),
        escapeCsvValue(reg.qualifications),
        escapeCsvValue(reg.yearsOfExperience),
        escapeCsvValue(reg.availability),
        escapeCsvValue(reg.email),
        escapeCsvValue(formatTimestamp(reg.timestamp)),
        escapeCsvValue(reg.status || 'new')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nurse-registrations.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ error: 'Error exporting registrations' });
  }
});

// GET Nutrition Bookings
app.get('/api/forms/nutrition-bookings', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = db.collection('nutritionServiceBookings').orderBy('timestamp', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching nutrition bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Mark Nutrition Booking as Contacted
app.post('/api/forms/nutrition-bookings/:id/mark-contacted', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('nutritionServiceBookings').doc(id).update({
      status: 'contacted',
      contactedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Booking marked as contacted' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Error updating booking' });
  }
});

// Export Nutrition Bookings to CSV
app.get('/api/forms/nutrition-bookings/export', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('nutritionServiceBookings').orderBy('timestamp', 'desc').get();
    const bookings = snapshot.docs.map(doc => doc.data());
    
    const headers = ['Service ID', 'Service Title', 'Name', 'Email', 'Info', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    bookings.forEach(booking => {
      const row = [
        escapeCsvValue(booking.serviceId),
        escapeCsvValue(booking.serviceTitle),
        escapeCsvValue(booking.name),
        escapeCsvValue(booking.email),
        escapeCsvValue(booking.info),
        escapeCsvValue(formatTimestamp(booking.timestamp)),
        escapeCsvValue(booking.status || 'new')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nutrition-bookings.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ error: 'Error exporting bookings' });
  }
});

// ============== MESSAGING APIs ==============

// Get All Admin Users (for user selector)
app.get('/api/users/all', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => getSafeUser(doc));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get All Conversations for a User
app.get('/api/messages/conversations/:userId', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const userMessages = await getStoredMessagesForUser(userId);
    
    // Combine and get unique conversation partners
    const conversations = new Map();
    
    userMessages.forEach(data => {
      const partnerId = data.fromUserId === userId ? data.toUserId : data.fromUserId;
      const messageTime = parseTimestamp(data.timestamp)?.getTime() || 0;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          userId: partnerId,
          lastMessage: data.message,
          lastTimestamp: data.timestamp,
          lastTimestampMs: messageTime,
          unread: data.toUserId === userId && !data.read
        });
      } else {
        // Update if this message is more recent
        const existing = conversations.get(partnerId);
        if (messageTime > existing.lastTimestampMs) {
          existing.lastMessage = data.message;
          existing.lastTimestamp = data.timestamp;
          existing.lastTimestampMs = messageTime;
        }
        if (data.toUserId === userId && !data.read) {
          existing.unread = true;
        }
      }
    });

    res.json(Array.from(conversations.values())
      .sort((a, b) => b.lastTimestampMs - a.lastTimestampMs)
      .map(({ lastTimestampMs, ...conversation }) => conversation));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// Get Messages Between Two Users
app.get('/api/messages/conversation/:userId1/:userId2', requireAdminAuth, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const userMessages = await getStoredMessagesForUser(userId1);
    const messages = userMessages
      .filter(msg => 
        (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
        (msg.fromUserId === userId2 && msg.toUserId === userId1)
      )
      .sort((a, b) => (parseTimestamp(a.timestamp)?.getTime() || 0) - (parseTimestamp(b.timestamp)?.getTime() || 0));
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Send Message (Enhanced)
app.post('/api/messages/send', requireAdminAuth, async (req, res) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    
    const messageObj = {
      fromUserId,
      toUserId,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      conversationId: [fromUserId, toUserId].sort().join('_')
    };
    
    const docRef = await db.collection('messages').add(messageObj);
    
    res.json({ success: true, messageId: docRef.id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Mark Message as Read
app.put('/api/messages/:id/mark-read', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('messages').doc(id).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Error updating message' });
  }
});

// Mark All Messages in Conversation as Read
app.put('/api/messages/conversation/:userId1/:userId2/mark-read', requireAdminAuth, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Get unread messages from userId2 to userId1
    const snapshot = await db.collection('messages')
      .where('fromUserId', '==', userId2)
      .where('toUserId', '==', userId1)
      .where('read', '==', false)
      .get();
    
    // Update all in batch
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    res.json({ success: true, updated: snapshot.size });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Error updating messages' });
  }
});

// ============== ANALYTICS APIs ==============

// Get Dashboard Statistics
app.get('/api/analytics/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get all forms
    const contactSnapshot = await db.collection('contactForms').get();
    const joinSnapshot = await db.collection('joinForms').get();
    
    // Filter by date
    const contactToday = contactSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp >= today;
    }).length;
    
    const contactWeek = contactSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp >= weekAgo;
    }).length;
    
    const joinToday = joinSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp >= today;
    }).length;
    
    const joinWeek = joinSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp >= weekAgo;
    }).length;
    
    // Count by status
    const unreadContact = contactSnapshot.docs.filter(doc => 
      !doc.data().status || doc.data().status === 'unread'
    ).length;
    
    const stats = {
      contactForms: {
        total: contactSnapshot.size,
        today: contactToday,
        thisWeek: contactWeek,
        unread: unreadContact
      },
      joinForms: {
        total: joinSnapshot.size,
        today: joinToday,
        thisWeek: joinWeek
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
