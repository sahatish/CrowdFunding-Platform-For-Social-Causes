const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set static folder for media uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running smoothly' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
