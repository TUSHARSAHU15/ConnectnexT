const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const workspaceId = localStorage.getItem('activeWorkspaceId');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
  };
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_URL}/auth/forgotpassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  resetPassword: async (token, password) => {
    const res = await fetch(`${API_URL}/auth/resetpassword/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  // Users
  searchUsers: async (query) => {
    const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // Workspaces (Step 1 Workspaces)
  getWorkspaces: async () => {
    const res = await fetch(`${API_URL}/workspaces`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  createWorkspace: async (name, description = '') => {
    const res = await fetch(`${API_URL}/workspaces`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return res.json();
  },

  inviteUser: async (email, role = 'Member') => {
    const res = await fetch(`${API_URL}/workspaces/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  },

  removeUser: async (userId) => {
    const res = await fetch(`${API_URL}/workspaces/remove`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  getWorkspaceMembers: async () => {
    const res = await fetch(`${API_URL}/workspaces/members`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Channels
  getChannels: async () => {
    const res = await fetch(`${API_URL}/workspaces/channels`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  createChannel: async (channelName, description = '', isPrivate = false) => {
    const res = await fetch(`${API_URL}/workspaces/channels`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ channelName, description, isPrivate }),
    });
    return res.json();
  },

  // Messages (scoped to channel timeline)
  getMessages: async (channelId) => {
    const res = await fetch(`${API_URL}/messages/${channelId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  sendMessage: async (channelId, content, attachmentUrl = '', attachmentType = 'text', parentMessageId = null) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ channelId, content, attachmentUrl, attachmentType, parentMessageId }),
    });
    return res.json();
  },

  editMessage: async (messageId, content) => {
    const res = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  deleteMessage: async (messageId) => {
    const res = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  toggleReaction: async (messageId, emoji) => {
    const res = await fetch(`${API_URL}/messages/${messageId}/react`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ emoji }),
    });
    return res.json();
  },

  // Kanban Tasks (Step 9 Kanban Board)
  getTasks: async () => {
    const res = await fetch(`${API_URL}/kanban/tasks`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_URL}/kanban/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  updateTaskStatus: async (taskId, updateData) => {
    const res = await fetch(`${API_URL}/kanban/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_URL}/kanban/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  aiGenerateTasks: async (prompt) => {
    const res = await fetch(`${API_URL}/kanban/ai-generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  },

  // Meeting Scheduler (Step 10 Meeting Scheduler)
  getMeetings: async () => {
    const res = await fetch(`${API_URL}/meetings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  createMeeting: async (meetingData) => {
    const res = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meetingData),
    });
    return res.json();
  },

  // Notifications (Step 8 Notification Center)
  getNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  markNotificationRead: async (notificationId) => {
    const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  // OpenAI translations & summaries
  translateMessage: async (messageId, targetLanguage) => {
    const res = await fetch(`${API_URL}/messages/${messageId}/translate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetLanguage }),
    });
    return res.json();
  },

  getSmartReplies: async (messageId) => {
    const res = await fetch(`${API_URL}/messages/${messageId}/smartreplies`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  getChatSummary: async (channelId) => {
    const res = await fetch(`${API_URL}/messages/chat/${channelId}/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },
};
