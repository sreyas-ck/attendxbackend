const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const markAttendance = async (req, res, next) => {
  try {
    const { classId, subjectId, date, records } = req.body;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      class: classId, subject: subjectId,
      date: { $gte: attendanceDate, $lt: new Date(attendanceDate.getTime() + 86400000) }
    });

    if (attendance) {
      attendance.records = records;
      attendance.markedBy = req.user._id;
      attendance.updatedAt = new Date();
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        class: classId, subject: subjectId,
        date: attendanceDate, records, markedBy: req.user._id
      });
    }

    await attendance.populate([
      { path: 'class', select: 'name section' },
      { path: 'subject', select: 'name code' },
      { path: 'records.student', select: 'name rollNumber' },
      { path: 'markedBy', select: 'name' }
    ]);

    res.status(201).json(attendance);
  } catch (err) { next(err); }
};

const getAttendance = async (req, res, next) => {
  try {
    const { classId, subjectId, date, startDate, endDate } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(filter)
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .populate('records.student', 'name rollNumber')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) { next(err); }
};

const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const allAttendance = await Attendance.find(filter)
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .sort({ date: -1 });

    const studentRecords = allAttendance
      .map(att => {
        const record = att.records.find(r => r.student.toString() === studentId);
        if (!record) return null;
        return {
          _id: att._id, date: att.date,
          class: att.class, subject: att.subject,
          status: record.status, remarks: record.remarks
        };
      })
      .filter(Boolean);

    res.json(studentRecords);
  } catch (err) { next(err); }
};

module.exports = { markAttendance, getAttendance, getStudentAttendance };