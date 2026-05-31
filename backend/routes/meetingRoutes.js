const express = require('express');
const { createMeeting, getWorkspaceMeetings } = require('../controllers/meetingController');
const { protect } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

router.route('/')
  .post(protect, checkRole(['Owner', 'Admin', 'Manager', 'Member']), createMeeting)
  .get(protect, checkRole(), getWorkspaceMeetings);

module.exports = router;
