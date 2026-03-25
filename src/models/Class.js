const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: String, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  academicYear: { type: String, default: () => new Date().getFullYear().toString() },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);