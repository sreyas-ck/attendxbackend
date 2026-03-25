const express = require('express');
const router = express.Router();
const { 
  getStudents, 
  getStudent, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', authorize('admin', 'teacher'), createStudent);
router.put('/:id', authorize('admin', 'teacher'), updateStudent);
router.delete('/:id', authorize('admin', 'teacher'), deleteStudent);

module.exports = router;