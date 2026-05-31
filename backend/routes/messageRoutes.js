const express = require('express');
const {
  sendMessage,
  allMessages,
  editMessage,
  deleteMessage,
  toggleReaction,
  translateMessage,
  getSmartReplies,
  getConversationSummary,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/:messageId').put(protect, editMessage).delete(protect, deleteMessage);
router.route('/:messageId/react').post(protect, toggleReaction);
router.route('/:messageId/translate').post(protect, translateMessage);
router.route('/:messageId/smartreplies').post(protect, getSmartReplies);
router.route('/chat/:chatId/summary').get(protect, getConversationSummary);

module.exports = router;
