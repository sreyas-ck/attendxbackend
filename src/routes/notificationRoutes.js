const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkAttendanceAndNotify } = require('../utils/notificationCron');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Manually trigger notifications (admin only)
// @route   POST /api/notifications/trigger
router.post('/trigger', protect, authorize('admin'), async (req, res, next) => {
  try {
    const results = await checkAttendanceAndNotify();
    res.json({
      message: 'Notifications processed!',
      sent: results.sent.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      details: results
    });
  } catch (err) { next(err); }
});

// @desc    Get at-risk students (below 75%)
// @route   GET /api/notifications/at-risk
router.get('/at-risk', protect, async (req, res, next) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('class', 'name section')
      .populate('subject', 'name');

    const atRisk = [];

    for (const student of students) {
      const attendanceRecords = await Attendance.find({ class: student.class });
      const totalDays = attendanceRecords.length;
      if (totalDays === 0) continue;

      const counts = { present: 0, late: 0 };
      attendanceRecords.forEach(att => {
        const rec = att.records.find(r =>
          r.student.toString() === student._id.toString()
        );
        if (rec) {
          if (rec.status === 'present') counts.present++;
          if (rec.status === 'late') counts.late++;
        }
      });

      const percentage = (((counts.present + counts.late) / totalDays) * 100).toFixed(1);
      if (percentage < 75) {
        atRisk.push({
          student: { _id: student._id, name: student.name, rollNumber: student.rollNumber },
          class: student.class,
          subject: student.subject,
          percentage
        });
      }
    }

    res.json(atRisk);
  } catch (err) { next(err); }
});

module.exports = router;