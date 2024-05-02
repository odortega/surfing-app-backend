const firebase_admin = require('firebase-admin');
const { getAppCheck } = require('firebase-admin/app-check');
const express = require('express');
const bodyParser = require('body-parser');
const stringify = require('json-stringify-safe');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: '*',
  })
);

// firebase_admin.initializeApp({
//   credential: firebase_admin.credential.cert({
//     type: process.env.FIREBASE_TYPE,
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.FIREBASE_CLIENT_ID,
//     auth_uri: process.env.FIREBASE_AUTH_URI,
//     token_uri: process.env.FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//       process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
//   }),
// });

firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

let appCheckClaims = {};

// Firebase App Check verification middleware
const appCheckVerification = async (req, res, next) => {
  console.log(`headers: ${stringify(req.headers)}`);
  console.log(`body: ${stringify(req.body)}`);
  const appCheckToken = req.header('X-Firebase-AppCheck');
  //const { appCheckToken } = req.body;

  if (!appCheckToken) {
    res.status(401);
    console.log('Error, appCheckVerification: !!appCheckToken');
    return next('Unauthorized');
  }

  try {
    appCheckClaims = await getAppCheck().verifyToken(appCheckToken);

    console.log(
      `Success, getAppCheck().verifyToken, appCheckClaims: ${JSON.stringify(
        appCheckClaims
      )}`
    );

    // If verifyToken() succeeds, continue with the next middleware
    // function in the stack.
    return next();
  } catch (err) {
    console.log(`Error, getAppCheck().verifyToken: ${err}`);
    res.status(401);
    return next('Unauthorized');
  }
};

app.use(bodyParser.json());

app.post('/signup', (req, res) => {
  console.log(`/signup`);

  const { token } = req.body;
  try {
    res.status(402).send({ message: 'Please complete the reCAPTCHA' });
  } catch (error) {
    res.status(401).send({ message: 'Invalid token' });
  }
});

app.post('/verify-captcha', (req, res) => {
  const { token, captchaResponse: validCaptcha } = req.body;
  console.log(`Captcha response: ${validCaptcha}`);
  if (!validCaptcha) {
    return res.status(400).send({ message: 'reCAPTCHA failed' });
  }

  return res.status(200).send({
    message: 'Access granted',
    options: ['Home', 'Explore', 'Sessions', 'News'],
  });
});

app.post('/backend-endpoint', [appCheckVerification], (req, res) => {
  console.log(`Success, /backend-endpoint: message: 'Hello from the backend!'`);

  return res.status(200).send({
    message: 'Hello from your backend protected by Firebase App Check!',
    data: appCheckClaims,
  });
});

app.listen(10000, () => {
  console.log('Server running on https://surfing-app-backend.onrender.com');
});
