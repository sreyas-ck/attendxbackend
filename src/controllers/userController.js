const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password')
      .populate('assignedClasses', 'name section');
    res.json(users);
  } catch (err) { next(err); }
};

// @desc    Create user
// @route   POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, assignedClasses } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role, assignedClasses });
    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (err) { next(err); }
};

// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// @desc    Delete (deactivate) user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };