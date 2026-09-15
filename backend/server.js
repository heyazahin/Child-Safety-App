require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Test Protected Route for Admin
const authenticateToken = require('./middleware/auth');
const authorizeRole = require('./middleware/role');
app.get('/api/admin-only', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have access to this route.' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
