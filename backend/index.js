const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const app = require('./server');

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10
});

exports.api = onRequest(
  {
    cors: false,
    memory: '512MiB',
    secrets: ['JWT_SECRET', 'ADMIN_API_KEY'],
    timeoutSeconds: 60
  },
  app
);
