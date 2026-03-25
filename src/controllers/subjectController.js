const Subject = require('../models/Subject');

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) { next(err); }
};

const createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) { next(err); }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { next(err); }
};

const deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) { next(err); }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };