const express = require('express');
const {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
} = require('../controllers/friendController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Mount all friend routes with authentication middleware
router.use(protect);

router.route('/')
  .get(getFriends);

router.route('/request')
  .post(sendFriendRequest);

router.route('/requests')
  .get(getFriendRequests);

router.route('/requests/:id/accept')
  .put(acceptFriendRequest);

router.route('/requests/:id/reject')
  .put(rejectFriendRequest);

router.route('/:id')
  .delete(removeFriend);

module.exports = router;
