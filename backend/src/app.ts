import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';

// 1. Winston Professional Logger System
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const httpServer = createServer(app);

// 2. Global CORS and Parser Configurations
app.use(cors({
  origin: '*', // Production configs should specify allowed domain lists
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 3. API Security Shield: Rate Limiting
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, error: 'Too many API requests, please try again later.' }
});
app.use('/api/', apiRateLimiter);

// 4. Redis Client Initializer
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', (err) => logger.error('Redis Connection Failure', err));
redisClient.connect().then(() => logger.info('Redis Server Connection Established'));

// 5. Database Connection (MongoDB Mongoose)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexushub';
mongoose.connect(mongoUri)
  .then(() => logger.info('Mongoose Database Connection Established'))
  .catch((err) => logger.error('Mongoose Connection Error', err));

// 6. JWT Security Authentication Middleware
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const verifyJwt = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_auth_token_key_nexus') as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired auth token' });
  }
};

// 7. Core Authentication Endpoints
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please fulfill all registry criteria fields' });
    }
    const existing = await mongoose.connection.collection('users').findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await mongoose.connection.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const token = jwt.sign(
      { userId: userResult.insertedId.toString(), role: 'Member' },
      process.env.JWT_SECRET || 'super_secret_auth_token_key_nexus',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userResult.insertedId, name, email }
      }
    });
  } catch (err: any) {
    logger.error('Account Registration Error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. RAG Semantic Knowledge Search & ChatGPT Prompt Augmentations
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || 'mock-key' });

app.post('/api/workspaces/:workspaceId/ai/search-wiki', verifyJwt, async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.params;
  const { query } = req.body;
  
  try {
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query prompt query missing' });
    }
    
    // In production, we construct embedding vectors using OpenAI Embeddings API
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY || 'mock-key' });
    const queryVector = await embeddings.embedQuery(query);

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'nexushub-wiki');
    const searchResults = await index.query({
      vector: queryVector,
      topK: 3,
      filter: { workspaceId: { $eq: workspaceId } },
      includeMetadata: true
    });

    res.status(200).json({
      success: true,
      data: searchResults.matches.map(m => ({
        score: m.score,
        documentId: m.metadata?.documentId,
        snippet: m.metadata?.content
      }))
    });
  } catch (err: any) {
    logger.error('RAG Search Failure', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Real-time Multi-Room Socket.io Orchestrations
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  logger.info(`WebSocket Client Connected: ${socket.id}`);

  // Room Join operations
  socket.on('join_workspace', ({ workspaceId }) => {
    socket.join(`workspace_${workspaceId}`);
    logger.info(`Client Socket [${socket.id}] joined Workspace [workspace_${workspaceId}]`);
  });

  socket.on('join_channel', ({ channelId }) => {
    socket.join(`channel_${channelId}`);
    logger.info(`Client Socket [${socket.id}] joined Channel [channel_${channelId}]`);
  });

  // Message and Communication brokers
  socket.on('send_message', async (data) => {
    const { channelId, senderId, senderName, content, readBy } = data;
    try {
      const messagePayload = {
        channelId,
        senderId,
        senderName,
        content,
        readBy: readBy || [senderId],
        createdAt: new Date()
      };
      
      // Emit to all workspace subscribers in channel
      io.to(`channel_${channelId}`).emit('message_received', messagePayload);
      
      // Distribute notification log through Redis state queue
      await redisClient.publish('notifications', JSON.stringify({
        type: 'CHAT_MESSAGE',
        channelId,
        message: `${senderName}: ${content.substring(0, 30)}...`
      }));
    } catch (err) {
      logger.error('Socket broker failure', err);
    }
  });

  socket.on('typing_indicator', ({ channelId, username, isTyping }) => {
    socket.to(`channel_${channelId}`).emit('user_typing', { username, isTyping });
  });

  // Meetings screen lobby hooks
  socket.on('toggle_screen_share', ({ channelId, user, isSharing }) => {
    io.to(`channel_${channelId}`).emit('peer_sharing_state', { user, isSharing });
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket Client Disconnected: ${socket.id}`);
  });
});

// 10. Central Error Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Application Exception', err);
  res.status(500).json({ success: false, error: 'A fatal server error occurred.' });
});

// Boot the application
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`NexusHub Production Express API Server listening on port ${PORT}`);
});
