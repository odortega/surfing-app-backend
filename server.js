const express = require('express');
const bodyParser = require('body-parser');

const app = express();

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

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
