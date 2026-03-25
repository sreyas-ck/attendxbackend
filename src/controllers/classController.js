const Class = require('../models/Class');

const getClasses = async (req, res, next) => {
  try {
    let filter = { isActive: true };
    if (req.user.role === 'teacher')
      filter._id = { $in: req.user.assignedClasses };

    const classes = await Class.find(filter)
      .populate('teacher', 'name email')
      .populate('subjects', 'name code');
    res.json(classes);
  } catch (err) { next(err); }
};

const createClass = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    await cls.populate([
      { path: 'teacher', select: 'name email' },
      { path: 'subjects', select: 'name code' }
    ]);
    res.status(201).json(cls);
  } catch (err) { next(err); }
};

const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate('teacher', 'name email')
      .populate('subjects', 'name code');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) { next(err); }
};

const deleteClass = async (req, res, next) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Class deleted' });
  } catch (err) { next(err); }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };