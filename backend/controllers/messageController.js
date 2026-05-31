const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Helper to run mock OpenAI translation
const getMockTranslation = (text, targetLang) => {
  const translations = {
    spanish: `[ES] ${text} (Translated)`,
    french: `[FR] ${text} (Traduit)`,
    german: `[DE] ${text} (Übersetzt)`,
    hindi: `[HI] ${text} (अनुवादित)`,
  };
  return translations[targetLang.toLowerCase()] || `[${targetLang.toUpperCase()}] ${text} (Mock Translated)`;
};

// Helper to run mock OpenAI smart replies
const getMockSmartReplies = (text) => {
  return [
    "Sounds great! Let's do it.",
    "I will look into this and get back to you.",
    "Haha, that's awesome! 😂"
  ];
};

// Helper for Mock OpenAI Summaries
const getMockSummary = (messages) => {
  return "This conversation covers the initial setup of the ConnectX platform, discussing task lists, backend configurations, and coordinating frontend designs.";
};

// @desc    Send a new Message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { content, chatId, mediaUrl, mediaType, parentMessageId } = req.body;

  if ((!content && !mediaUrl) || !chatId) {
    return res.status(400).json({ success: false, message: 'Invalid data passed into request' });
  }

  try {
    let messageData = {
      sender: req.user._id,
      chat: chatId,
      message: content || '',
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'text',
      readBy: [req.user._id],
      deliveredTo: [req.user._id],
    };

    if (parentMessageId) {
      messageData.parentMessage = parentMessageId;
    }

    let message = await Message.create(messageData);

    message = await message.populate('sender', 'name avatar email isOnline status');
    message = await message.populate('chat');
    message = await message.populate({
      path: 'parentMessage',
      populate: { path: 'sender', select: 'name' }
    });
    message = await User.populate(message, {
      path: 'chat.participants',
      select: 'name avatar email isOnline status',
    });

    // Update last message in the chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Messages for a Chat
// @route   GET /api/messages/:chatId
// @access  Private
exports.allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar email isOnline status')
      .populate('chat')
      .populate({
        path: 'parentMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit a Message
// @route   PUT /api/messages/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
  const { content } = req.body;

  try {
    let message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this message' });
    }

    message.message = content;
    message.isEdited = true;
    await message.save();

    message = await Message.findById(message._id)
      .populate('sender', 'name avatar email isOnline status')
      .populate('chat');

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Message (soft delete style)
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    let message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this message' });
    }

    // Convert message content to indicate deletion
    message.message = 'This message was deleted';
    message.mediaUrl = '';
    message.mediaType = 'text';
    await message.save();

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add / Toggle Message Reaction
// @route   POST /api/messages/:messageId/react
// @access  Private
exports.toggleReaction = async (req, res) => {
  const { emoji } = req.body;
  const userId = req.user._id;

  try {
    let message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user already reacted with this exact emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Toggle off if clicking the same emoji
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update to new emoji if different
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    message = await Message.findById(message._id)
      .populate('sender', 'name avatar email isOnline status')
      .populate('chat');

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Translate a Message (OpenAI / Mock AI)
// @route   POST /api/messages/:messageId/translate
// @access  Private
exports.translateMessage = async (req, res) => {
  const { targetLanguage } = req.body;

  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    let translatedText = '';

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock') {
      try {
        const { default: OpenAI } = require('openai'); // dynamic import if package added
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `Translate the following text to ${targetLanguage}. Output only the translation, nothing else.` },
            { role: 'user', content: message.message }
          ],
        });
        translatedText = response.choices[0].message.content.trim();
      } catch (err) {
        console.error('OpenAI Error, falling back to mock:', err.message);
        translatedText = getMockTranslation(message.message, targetLanguage);
      }
    } else {
      translatedText = getMockTranslation(message.message, targetLanguage);
    }

    res.json({ success: true, translatedText });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get smart replies suggestions (OpenAI / Mock AI)
// @route   POST /api/messages/:messageId/smartreplies
// @access  Private
exports.getSmartReplies = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    let suggestions = [];

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock') {
      try {
        const { default: OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Generate 3 short, contextual reply suggestions to the following message. Respond only with a JSON array of strings e.g. ["Yes!", "No, sorry", "Let me check"]. Do not add markdown formatting.' },
            { role: 'user', content: message.message }
          ],
        });
        suggestions = JSON.parse(response.choices[0].message.content.trim());
      } catch (err) {
        console.error('OpenAI Error, falling back to mock:', err.message);
        suggestions = getMockSmartReplies(message.message);
      }
    } else {
      suggestions = getMockSmartReplies(message.message);
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Conversation Summary (OpenAI / Mock AI)
// @route   GET /api/messages/chat/:chatId/summary
// @access  Private
exports.getConversationSummary = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .sort({ createdAt: -1 })
      .limit(15);

    if (messages.length === 0) {
      return res.status(400).json({ success: false, message: 'No messages to summarize' });
    }

    let summaryText = '';

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock') {
      try {
        const { default: OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const messageDump = messages.map(m => m.message).reverse().join('\n');
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Provide a concise, 1-2 sentence summary of this conversation chat transcript.' },
            { role: 'user', content: messageDump }
          ],
        });
        summaryText = response.choices[0].message.content.trim();
      } catch (err) {
        console.error('OpenAI Error, falling back to mock:', err.message);
        summaryText = getMockSummary(messages);
      }
    } else {
      summaryText = getMockSummary(messages);
    }

    res.json({ success: true, summary: summaryText });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
