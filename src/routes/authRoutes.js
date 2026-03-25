const express = require('express');
const router = express.Router();
const { login, getMe, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/reset-password/:id', protect, authorize('admin'), resetPassword);

module.exports = router;