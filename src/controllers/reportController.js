const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const getSummaryReport = async (req, res, next) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const attendanceRecords = await Attendance.find(filter)
      .populate('records.student', 'name rollNumber')
      .populate('subject', 'name code');

    const students = await Student.find({ class: classId, isActive: true });
    const totalDays = attendanceRecords.length;

    const summary = students.map(student => {
      const counts = { present: 0, absent: 0, late: 0, excused: 0 };
      attendanceRecords.forEach(att => {
        const rec = att.records.find(r => r.student._id.toString() === student._id.toString());
        if (rec) counts[rec.status]++;
      });
      const percentage = totalDays > 0
        ? ((counts.present + counts.late) / totalDays * 100).toFixed(1) : 0;
      return {
        student: { _id: student._id, name: student.name, rollNumber: student.rollNumber },
        ...counts, totalDays, percentage
      };
    });

    res.json({ totalDays, summary });
  } catch (err) { next(err); }
};

const getDailyStats = async (req, res, next) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const records = await Attendance.find(filter).sort({ date: 1 });

    const dailyStats = records.map(att => {
      const counts = { present: 0, absent: 0, late: 0, excused: 0 };
      att.records.forEach(r => counts[r.status]++);
      return { date: att.date, ...counts, total: att.records.length };
    });

    res.json(dailyStats);
  } catch (err) { next(err); }
};

const getClassStats = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { class: classId } : {};

    const stats = await Attendance.aggregate([
      { $match: filter },
      { $unwind: '$records' },
      { $group: { _id: '$records.status', count: { $sum: 1 } } }
    ]);

    const result = { present: 0, absent: 0, late: 0, excused: 0 };
    stats.forEach(s => { result[s._id] = s.count; });
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getSummaryReport, getDailyStats, getClassStats };