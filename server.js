const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

/* =======================
   CORS CONFIG
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://attendxcybersquare.vercel.app",
  "https://attendxfrontend.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.options('/{*path}', cors());

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());

/* =======================
  

/* =======================
   ROUTES
======================= */
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/classes', require('./src/routes/classRoutes'));
app.use('/api/subjects', require('./src/routes/subjectRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

/* =======================
   ERROR HANDLER
======================= */
app.use(require('./src/middleware/errorHandler'));

/* =======================
   DB + SERVER START
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    const { startNotificationCron } = require('./src/utils/notificationCron');
    startNotificationCron();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });