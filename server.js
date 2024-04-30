const { initializeApp } = require('firebase-admin/app');
const { getAppCheck } = require('firebase-admin/app-check');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const firebaseApp = initializeApp();

// Firebase App Check verification middleware
const appCheckVerification = async (req, res, next) => {
  //const appCheckToken = req.header('X-Firebase-AppCheck');
  const { appCheckToken } = req.body;

  if (!appCheckToken) {
    res.status(401);
    console.log('Error, appCheckVerification: !!appCheckToken');
    return next('Unauthorized');
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);

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
    message: 'Hello from the backend!',
  });
});

app.listen(10000, () => {
  console.log('Server running on https://surfing-app-backend.onrender.com');
});
