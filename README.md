# ConnectX – Real-Time Chat & Collaboration Platform

ConnectX is a premium, high-performance real-time chat and collaboration platform designed for modern product teams and engineers. Built using a robust MERN architecture with native Socket.io events and WebRTC signaling, it delivers low-latency communication packaged inside an engaging, modern dark-themed glassmorphism interface.

---

## Key Features

### 🌟 Phase 1: MVP Core
- **Secure Authentication**: Password hashing with bcrypt, stateless session tracking with JWT, fully operational forgot password, and email verification processes (logged directly to console for instant local development).
- **User Profiles**: Custom status quotes, bios, and active presence triggers (`isOnline`, `lastSeen` timestamps).
- **Real-Time One-to-One Chat**: Instant messages over Socket.io, typing indicators, read receipts, delivery confirmations, and message history.
- **Thread Management**: Pin conversations, archive chats, search users, and delete threads.
- **Media sharing**: Integration for pictures, PDFs, and attachments.

### 🚀 Phase 2: Advanced Collaboration
- **Group Chats**: Dynamic creation of group rooms, member additions/removals, and custom group avatars.
- **Interactive Messaging**: Edit/delete sent messages, parent replies, message forwarding, and emoji reactions overlay.
- **Alerts**: Sound triggers on incoming messages and browser unread notifications.

### 💎 Phase 3: Industry-Level Integrations
- **WebRTC Calls**: Low-latency peer-to-peer voice and video calls running over custom socket signaling, complete with audio/video stream toggles.
- **AI Assistent (OpenAI)**: Dynamic Smart Replies, contextual auto-translation, and full thread transcript summaries.
- **Enterprise Security**: Helmet headers protection, API rate limiting, and global request validation.

---

## Technologies Used

- **Frontend**: React 19, React Router v6, Redux Toolkit, Socket.io Client, Tailwind CSS, Lucide Icons, Simple Peer.
- **Backend**: Node.js, Express.js, Mongoose, Socket.io Server, JWT, BcryptJS, Nodemailer.
- **Database**: MongoDB (Local or Atlas).

---

## Getting Started

### Prerequisites
- Node.js installed locally.
- MongoDB running locally or a MongoDB Atlas URI.

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. The dependencies are already pre-installed. Create/update your `.env` file (one has already been generated for you with mock/local fallbacks).
3. Start the backend:
   ```bash
   npm run start
   ```
   The backend will launch on `http://localhost:5000`.

### 2. Frontend Setup
1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The app will run locally on `http://localhost:5173`. Open this URL in multiple browser windows to test real-time messaging, calling, and presence features!
