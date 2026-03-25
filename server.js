const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/classes', require('./src/routes/classRoutes'));
app.use('/api/subjects', require('./src/routes/subjectRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

app.use(require('./src/middleware/errorHandler'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    // Start cron job
    const { startNotificationCron } = require('./src/utils/notificationCron');
    startNotificationCron();
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });