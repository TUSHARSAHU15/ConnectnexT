const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const kanbanRoutes = require('./routes/kanbanRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting (Phase 3 Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Express body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.send('ConnectX Backend API Running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);

// Custom Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Setup Server & Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

// Redis socket adapter integration (Step 14 Redis Integration)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
try {
  const { createClient } = require('redis');
  const { createAdapter } = require('@socket.io/redis-adapter');
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => {});
  subClient.on('error', (err) => {});

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Redis Socket Adapter active.');
  }).catch((err) => {
    console.log('Redis service not found, running on memory socket channels.');
  });
} catch (e) {
  console.log('Redis initialization skipped, running on memory socket channels.');
}

// Initialize Socket.io Handler
const socketHandler = require('./sockets/socketHandler');
socketHandler(io);

// Listen on Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ConnectX server running in production mode on port ${PORT}`);
});
