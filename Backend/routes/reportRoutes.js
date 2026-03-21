const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { exportTasksReport, exportUsersReport } = require('../controllers/reportController');

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport);// Export all tasks as Excel/PDF
router.get("/export/users", protect, adminOnly, exportUsersReport);// Export user task reports

module.exports = router;