const express = require("express");
const router = express.Router();

router.get("/message", (req, res) => {
  res.json({ message: "Hello from Express route!" });
});

router.post("/send", (req, res) => {
  const { name, email, message } = req.body;

  res.status(200).json({
    success: true,
    msg: "Data received successfully",
    data: { name, email, message },
  });
});

module.exports = router;
