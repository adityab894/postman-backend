const express = require('express');
const axios = require('axios');
const router = express.Router();

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const GROUP_ID = process.env.MAILERLITE_GROUP_ID;

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Valid email is required.' });
  }

  try {
    // Check if already subscribed
    const checkResponse = await axios.get(
      `https://api.mailerlite.com/api/v2/subscribers/${encodeURIComponent(email)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': MAILERLITE_API_KEY,
        },
      }
    );

    if (checkResponse.data && checkResponse.data.email) {
      return res.status(409).json({ message: 'This email is already subscribed.' });
    }
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      console.error('MailerLite check error:', error.response?.data || error.message);
      return res.status(500).json({ message: 'Error checking subscription.' });
    }
  }

  try {
    const response = await axios.post(
      `https://api.mailerlite.com/api/v2/groups/${GROUP_ID}/subscribers`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': MAILERLITE_API_KEY,
        },
      }
    );
    return res.status(200).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('MailerLite subscribe error:', error.response?.data || error.message);
    const msg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Subscription failed.';
    return res.status(500).json({ message: msg });
  }
});

module.exports = router;