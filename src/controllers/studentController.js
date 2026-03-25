const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');

const getStudents = async (req, res, next) => {
  try {
    let filter = { isActive: true };
    const { classId } = req.query;

    if (req.user.role === 'teacher') {
      const classIds = req.user.assignedClasses.map(c => c._id || c);
      if (classIds.length === 0) return res.json([]);
      filter.class = { $in: classIds };
    }
    if (classId) filter.class = classId;

    const students = await Student.find(filter)
      .populate('class', 'name section')
      .populate('subject', 'name code');
    res.json(students);
  } catch (err) { next(err); }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section')
      .populate('subject', 'name code');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { next(err); }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    await Class.findByIdAndUpdate(student.class, { $push: { students: student._id } });

    const existingUser = await User.findOne({ studentProfile: student._id });
    if (!existingUser) {
      const user = await User.create({
        name: student.name,
        email: student.email || `${student.rollNumber.toLowerCase()}@cybersquare.com`,
        password: student.rollNumber,
        role: 'student',
        studentProfile: student._id
      });
      student.userAccount = user._id;
      await student.save();
    }

    await student.populate([
      { path: 'class', select: 'name section' },
      { path: 'subject', select: 'name code' }
    ]);

    res.status(201).json(student);
  } catch (err) { next(err); }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate('class', 'name section')
      .populate('subject', 'name code');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { next(err); }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await Class.findByIdAndUpdate(student.class, { $pull: { students: student._id } });

    if (student.userAccount) {
      await User.findByIdAndUpdate(student.userAccount, { isActive: false });
    }

    res.json({ message: 'Student removed' });
  } catch (err) { next(err); }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };