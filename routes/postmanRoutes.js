const express = require('express');
const router = express.Router();

// Example GET route
router.get('/message', (req, res) => {
  res.json({ message: 'Hello from Express route!' });
});

// Example POST route
router.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  // Here you can add database logic, validations, etc.

  res.status(200).json({
    success: true,
    msg: 'Data received successfully',
    data: { name, email, message }
  });
});

module.exports = router;
