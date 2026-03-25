const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email }).populate('assignedClasses', 'name section');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(401).json({ message: 'Account is deactivated' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses,
        studentProfile: user.studentProfile,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) { next(err); }
};

// const studentLogin = async (req, res, next) => {
//   try {
//     const { rollNumber, password } = req.body;
//     if (!rollNumber || !password)
//       return res.status(400).json({ message: 'Please provide roll number and password' });

//     const student = await Student.findOne({ rollNumber }).populate('class', 'name section');
//     if (!student)
//       return res.status(401).json({ message: 'Invalid roll number' });

//     const studentUser = await User.findOne({ studentProfile: student._id });
//     if (!studentUser || !(await studentUser.matchPassword(password)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     if (!studentUser.isActive)
//       return res.status(401).json({ message: 'Account is deactivated' });

//     // Update last login
//     studentUser.lastLogin = new Date();
//     await studentUser.save();

//     res.json({
//       token: generateToken(studentUser._id),
//       user: {
//         _id: studentUser._id,
//         name: student.name,
//         email: studentUser.email,
//         role: 'student',
//         studentProfile: student._id,
//         rollNumber: student.rollNumber,
//         class: student.class,
//         lastLogin: studentUser.lastLogin
//       }
//     });
//   } catch (err) { next(err); }
// };
const studentLogin = async (req, res, next) => {
  try {
    const { rollNumber, password } = req.body;
    if (!rollNumber || !password)
      return res.status(400).json({ message: 'Please provide roll number and password' });

    // Find student by roll number (case insensitive)
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
    }).populate('class', 'name section');

    if (!student)
      return res.status(401).json({ message: 'Invalid roll number' });

    // Find linked user account
    const studentUser = await User.findOne({
      studentProfile: student._id,
      role: 'student'
    });

    if (!studentUser)
      return res.status(401).json({ message: 'No account found for this roll number' });

    if (!studentUser.isActive)
      return res.status(401).json({ message: 'Account is deactivated' });

    const isMatch = await studentUser.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    // Update last login
    studentUser.lastLogin = new Date();
    await studentUser.save();

    res.json({
      token: generateToken(studentUser._id),
      user: {
        _id: studentUser._id,
        name: student.name,
        email: studentUser.email,
        role: 'student',
        studentProfile: student._id,
        rollNumber: student.rollNumber,
        class: student.class,
        lastLogin: studentUser.lastLogin
      }
    });
  } catch (err) { next(err); }
};
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedClasses', 'name section');
    res.json(user);
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

module.exports = { login, studentLogin, getMe, resetPassword };