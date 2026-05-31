const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket Connected:', socket.id);

    // User setup with custom status options: Online, Away, Busy, Offline (Step 4 Presence)
    socket.on('setup', async ({ user, statusType }) => {
      if (!user || !user._id) return;
      
      socket.join(user._id);
      onlineUsers.set(user._id, socket.id);
      
      const presenceStatus = statusType || 'Online'; // Online, Away, Busy, Offline
      console.log(`User ${user.name} online with presence: ${presenceStatus}`);

      try {
        await User.findByIdAndUpdate(user._id, {
          isOnline: presenceStatus !== 'Offline',
          status: presenceStatus, // online status quote / statusType
          lastSeen: Date.now()
        });
        
        // Broadcast presence status update
        socket.broadcast.emit('user_presence_updated', { userId: user._id, presence: presenceStatus });
      } catch (err) {
        console.error('Presence setup error:', err.message);
      }
    });

    // Handle explicit status change (Away, Busy, Online, Offline)
    socket.on('change_presence', async ({ userId, presence }) => {
      if (!userId || !presence) return;
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: presence !== 'Offline',
          status: presence,
          lastSeen: Date.now()
        });
        io.emit('user_presence_updated', { userId, presence });
      } catch (err) {
        console.error(err);
      }
    });

    // Join room (scoped to Workspace Channels)
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`Socket joined workspace room: ${room}`);
    });

    // Typing
    socket.on('typing', ({ room, senderId, senderName }) => {
      socket.in(room).emit('typing_status', { room, typing: true, senderId, senderName });
    });

    // Stop typing
    socket.on('stop_typing', ({ room, senderId }) => {
      socket.in(room).emit('typing_status', { room, typing: false, senderId });
    });

    // Send Message (supporting attachments, threaded replies, and mention alerts)
    socket.on('send_message', async (newMessage) => {
      const { channel, chat, sender, message } = newMessage;
      const targetRoom = channel ? channel._id : (chat ? chat._id : null);
      if (!targetRoom) return;

      // Broadcast message to room
      socket.in(targetRoom).emit('receive_message', newMessage);

      // Mentions Engine (Step 8 Notification Center)
      // Check if message content contains e.g., @name
      if (message && message.includes('@')) {
        const mentionRegex = /@(\w+(\s\w+)?)/g;
        let match;
        
        while ((match = mentionRegex.exec(message)) !== null) {
          const mentionedName = match[1].trim();
          try {
            const targetUser = await User.findOne({ name: { $regex: new RegExp(`^${mentionedName}$`, 'i') } });
            if (targetUser && targetUser._id.toString() !== sender._id.toString()) {
              // Create notification in DB
              const notification = await Notification.create({
                userId: targetUser._id,
                type: 'Mention',
                message: `You were mentioned by ${sender.name} in a message: "${message.substring(0, 40)}..."`,
              });

              // Emit socket alert directly to mentioned user
              const targetSocket = onlineUsers.get(targetUser._id.toString());
              if (targetSocket) {
                io.to(targetSocket).emit('notification_received', notification);
              }
            }
          } catch (e) {
            console.error('Mention processing error:', e.message);
          }
        }
      }
    });

    // ==========================================
    // GROUP CALLING SIGNALLING (Step 13 Calls)
    // ==========================================
    socket.on('join_group_call', ({ channelId, userId, userName }) => {
      socket.join(`call_${channelId}`);
      socket.in(`call_${channelId}`).emit('user_joined_call', { userId, userName, socketId: socket.id });
    });

    socket.on('leave_group_call', ({ channelId, userId }) => {
      socket.leave(`call_${channelId}`);
      socket.in(`call_${channelId}`).emit('user_left_call', { userId });
    });

    socket.on('webrtc_signal', ({ targetSocketId, signal, fromUserId, fromUserName }) => {
      io.to(targetSocketId).emit('webrtc_signal_received', {
        signal,
        fromSocketId: socket.id,
        fromUserId,
        fromUserName
      });
    });

    // Real-time Friend Request Signaling
    socket.on('new_friend_request', ({ senderId, recipientId, requestData }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('friend_request_received', requestData);
      }
    });

    socket.on('friend_request_approved', ({ senderId, recipientId, recipientUser }) => {
      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit('friend_request_accepted', { recipientId, recipientUser });
      }
    });

    socket.on('friend_removed', ({ friendId, userId }) => {
      const friendSocket = onlineUsers.get(friendId);
      if (friendSocket) {
        io.to(friendSocket).emit('unfriended_by_user', { userId });
      }
    });

    socket.on('disconnect', async () => {
      console.log('Socket Disconnected:', socket.id);
      
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: Date.now()
          });
          io.emit('user_presence_updated', { userId: disconnectedUserId, presence: 'Offline' });
        } catch (err) {
          console.error('Error logging presence offline:', err.message);
        }
      }
    });
  });
};

module.exports = socketHandler;
