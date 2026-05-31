const express = require('express');
const {
  createWorkspace,
  getUserWorkspaces,
  inviteUser,
  removeUser,
  createChannel,
  getWorkspaceChannels,
  getWorkspaceMembers,
} = require('../controllers/workspaceController');
const { protect } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Base workspaces endpoints
router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getUserWorkspaces);

// Member listing in scoped workspace
router.route('/members')
  .get(protect, checkRole(), getWorkspaceMembers);

// Invite and remove members (RBAC checked)
router.route('/invite')
  .post(protect, checkRole(['Owner', 'Admin', 'Manager']), inviteUser);

router.route('/remove')
  .delete(protect, checkRole(['Owner', 'Admin']), removeUser);

// Workspace Channels (RBAC checked for creation)
router.route('/channels')
  .post(protect, checkRole(['Owner', 'Admin', 'Manager']), createChannel)
  .get(protect, checkRole(), getWorkspaceChannels);

module.exports = router;
