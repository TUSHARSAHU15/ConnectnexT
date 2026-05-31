const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Access or create a 1-to-1 chat
// @route   POST /api/chats
// @access  Private
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId param not sent with request' });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    isChat = await User.populate(isChat, {
      path: 'lastMessage.sender',
      select: 'name avatar email status isOnline',
    });

    if (isChat.length > 0) {
      res.json({ success: true, data: isChat[0] });
    } else {
      let chatData = {
        chatName: 'sender',
        isGroupChat: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findById(createdChat._id).populate('participants', '-password');
      res.status(201).json({ success: true, data: FullChat });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch all chats for the current user
// @route   GET /api/chats
// @access  Private
exports.fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'lastMessage.sender',
      select: 'name avatar email status isOnline',
    });

    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Group Chat
// @route   POST /api/chats/group
// @access  Private
exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ success: false, message: 'Please fill all fields' });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).json({ success: false, message: 'More than 2 users are required to form a group chat' });
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users, // compatibility
      participants: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
      groupAvatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.body.name)}`,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json({ success: true, data: fullGroupChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rename a Group
// @route   PUT /api/chats/rename
// @access  Private
exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: 'Chat Not Found' });
    }

    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to a Group
// @route   PUT /api/chats/groupadd
// @access  Private
exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat Not Found' });
    }

    // Check if user already in group
    if (chat.participants.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in group' });
    }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { participants: userId } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, data: added });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from a Group
// @route   PUT /api/chats/groupremove
// @access  Private
exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat Not Found' });
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: userId } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, data: removed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pin conversation
// @route   PUT /api/chats/pin
// @access  Private
exports.togglePinChat = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat Not Found' });
    }

    const isPinned = chat.pinnedBy.includes(userId);
    const update = isPinned
      ? { $pull: { pinnedBy: userId } }
      : { $push: { pinnedBy: userId } };

    const updated = await Chat.findByIdAndUpdate(chatId, update, { new: true })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, isPinned: !isPinned, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive chat
// @route   PUT /api/chats/archive
// @access  Private
exports.toggleArchiveChat = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat Not Found' });
    }

    const isArchived = chat.archivedBy.includes(userId);
    const update = isArchived
      ? { $pull: { archivedBy: userId } }
      : { $push: { archivedBy: userId } };

    const updated = await Chat.findByIdAndUpdate(chatId, update, { new: true })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.json({ success: true, isArchived: !isArchived, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
