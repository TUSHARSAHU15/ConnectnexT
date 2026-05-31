const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @desc    Send a friend request by email
// @route   POST /api/friends/request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
  }

  try {
    const recipient = await User.findOne({ email: email.toLowerCase().trim() });
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found with that email address' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself' });
    }

    // Check if they are already friends
    const isFriend = req.user.friends.includes(recipient._id);
    if (isFriend) {
      return res.status(400).json({ success: false, message: 'You are already friends with this user' });
    }

    // Check for existing pending request in either direction
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: recipient._id, status: 'pending' },
        { sender: recipient._id, recipient: req.user._id, status: 'pending' },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A friend request is already pending between you and this user',
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      recipient: recipient._id,
    });

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('sender', 'name email avatar status isOnline')
      .populate('recipient', 'name email avatar status isOnline');

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      status: 'pending',
    })
      .populate('sender', 'name email avatar status isOnline')
      .populate('recipient', 'name email avatar status isOnline');

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a friend request
// @route   PUT /api/friends/requests/:id/accept
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await FriendRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'You are not authorized to accept this friend request',
      });
    }

    // Add to mutual friends list
    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
    await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

    // Remove the request document to keep DB clean
    await FriendRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Friend request accepted',
      senderId: request.sender,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject/Decline a friend request
// @route   PUT /api/friends/requests/:id/reject
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await FriendRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    // Sender can cancel, recipient can decline
    if (
      request.recipient.toString() !== req.user._id.toString() &&
      request.sender.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: 'You are not authorized to manage this request',
      });
    }

    await FriendRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Friend request canceled or declined',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'friends',
      select: 'name email avatar status isOnline lastSeen',
    });

    res.json({ success: true, data: user.friends || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove/Unfriend a user
// @route   DELETE /api/friends/:id
// @access  Private
exports.removeFriend = async (req, res) => {
  const { id } = req.params;

  try {
    // Pull friend from both users' friends array
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: id } });
    await User.findByIdAndUpdate(id, { $pull: { friends: req.user._id } });

    res.json({
      success: true,
      message: 'User removed from friends list successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
