const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173', // Vite default
  credentials: true
}));

app.use(express.json());

const postmanRoutes = require('./routes/postmanRoutes');
app.use('/api', postmanRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
