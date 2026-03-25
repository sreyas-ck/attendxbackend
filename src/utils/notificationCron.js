const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const { sendStudentAlert, sendTeacherReport } = require('./emailService');

const checkAttendanceAndNotify = async () => {
  console.log('🔔 Running attendance notification check...');
  const results = { sent: [], failed: [], skipped: [] };

  try {
    const classes = await Class.find({ isActive: true }).populate('teacher');

    for (const cls of classes) {
      const students = await Student.find({ class: cls._id, isActive: true })
        .populate('subject', 'name');

      const attendanceRecords = await Attendance.find({ class: cls._id });
      const totalDays = attendanceRecords.length;

      if (totalDays === 0) {
        results.skipped.push(`${cls.name} ${cls.section} — no attendance records`);
        continue;
      }

      const atRiskStudents = [];

      for (const student of students) {
        const counts = { present: 0, absent: 0, late: 0 };
        attendanceRecords.forEach(att => {
          const rec = att.records.find(r =>
            r.student.toString() === student._id.toString()
          );
          if (rec) counts[rec.status] = (counts[rec.status] || 0) + 1;
        });

        const percentage = (
          ((counts.present + counts.late) / totalDays) * 100
        ).toFixed(1);

        if (percentage < 75) {
          atRiskStudents.push({
            name: student.name,
            rollNumber: student.rollNumber,
            percentage,
            email: student.email,
            subject: student.subject?.name || 'Your Course',
            _id: student._id
          });

          // Send individual email to each student separately
          if (student.email) {
            const sent = await sendStudentAlert(
              student.email,
              student.name,
              percentage,
              student.subject?.name || 'Your Course'
            );
            if (sent) {
              results.sent.push(`Student: ${student.name} → ${student.email}`);
            } else {
              results.failed.push(`Student: ${student.name} → ${student.email}`);
            }
          } else {
            results.skipped.push(`Student: ${student.name} — no email`);
          }
        }
      }

      // Send individual report to teacher
      if (cls.teacher?.email && atRiskStudents.length > 0) {
        const sent = await sendTeacherReport(
          cls.teacher.email,
          cls.teacher.name,
          atRiskStudents,
          `${cls.name} ${cls.section}`
        );
        if (sent) {
          results.sent.push(`Teacher: ${cls.teacher.name} → ${cls.teacher.email}`);
        } else {
          results.failed.push(`Teacher: ${cls.teacher.name} → ${cls.teacher.email}`);
        }
      }
    }

    console.log('✅ Notification Results:');
    console.log(`   Sent: ${results.sent.length}`);
    results.sent.forEach(s => console.log(`   ✅ ${s}`));
    console.log(`   Failed: ${results.failed.length}`);
    results.failed.forEach(s => console.log(`   ❌ ${s}`));
    console.log(`   Skipped: ${results.skipped.length}`);
    results.skipped.forEach(s => console.log(`   ⏭️  ${s}`));

    return results;
  } catch (err) {
    console.error('❌ Notification error:', err);
    return results;
  }
};

const startNotificationCron = () => {
  // Runs at 9:00 AM on last day of every month
  cron.schedule('0 9 28-31 * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      await checkAttendanceAndNotify();
    }
  });
  console.log('🔔 Notification cron job started!');
};

module.exports = { startNotificationCron, checkAttendanceAndNotify };