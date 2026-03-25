const express = require('express');
const router = express.Router();
const { getSummaryReport, getDailyStats, getClassStats } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', getSummaryReport);
router.get('/daily-stats', getDailyStats);
router.get('/class-stats', getClassStats);

module.exports = router;