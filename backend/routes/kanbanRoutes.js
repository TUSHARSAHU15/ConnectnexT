const express = require('express');
const {
  createTask,
  getWorkspaceTasks,
  updateTaskStatus,
  deleteTask,
  aiGenerateTasks,
} = require('../controllers/kanbanController');
const { protect } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

router.route('/tasks')
  .post(protect, checkRole(['Owner', 'Admin', 'Manager', 'Member']), createTask)
  .get(protect, checkRole(), getWorkspaceTasks);

router.route('/tasks/:taskId')
  .put(protect, checkRole(['Owner', 'Admin', 'Manager', 'Member']), updateTaskStatus)
  .delete(protect, checkRole(['Owner', 'Admin', 'Manager']), deleteTask);

router.route('/ai-generate')
  .post(protect, checkRole(['Owner', 'Admin', 'Manager', 'Member']), aiGenerateTasks);

module.exports = router;
