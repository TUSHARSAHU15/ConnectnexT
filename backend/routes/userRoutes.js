const express = require('express');
const { getUsers, updateProfile, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/profile').put(protect, updateProfile);
router.route('/:id').get(protect, getUserProfile);

module.exports = router;
