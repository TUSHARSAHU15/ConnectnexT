import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Multi-tenant structures
  workspaces: [],
  activeWorkspace: null,
  channels: [],
  selectedChannel: null,
  // Timelines
  messages: [],
  loading: false,
  error: null,
  // Kanban & Scheduler (Steps 9, 10)
  kanbanTasks: [],
  scheduledMeetings: [],
  // Alerts & Presence (Steps 4, 8)
  pushNotifications: [],
  onlinePresenceMap: {}, // userId -> status
  // Calls (Step 13)
  activeGroupCall: null, // { channelId, callMembers }
  activeCall: null, // direct calls fallback
  incomingCall: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchWorkspacesSuccess: (state, action) => {
      state.loading = false;
      state.workspaces = action.payload;
      if (action.payload.length > 0 && !state.activeWorkspace) {
        state.activeWorkspace = action.payload[0];
      }
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
      state.selectedChannel = null;
      state.messages = [];
    },
    fetchChannelsSuccess: (state, action) => {
      state.loading = false;
      state.channels = action.payload;
      if (action.payload.length > 0 && !state.selectedChannel) {
        state.selectedChannel = action.payload[0];
      }
    },
    setSelectedChannel: (state, action) => {
      state.selectedChannel = action.payload;
    },
    fetchMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
    },
    addMessageSuccess: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageInList: (state, action) => {
      const idx = state.messages.findIndex(m => m._id === action.payload._id);
      if (idx !== -1) {
        state.messages[idx] = action.payload;
      }
    },
    // Kanban Slices (Step 9)
    fetchTasksSuccess: (state, action) => {
      state.kanbanTasks = action.payload;
    },
    addTaskSuccess: (state, action) => {
      state.kanbanTasks.push(action.payload);
    },
    updateTaskInList: (state, action) => {
      const idx = state.kanbanTasks.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) {
        state.kanbanTasks[idx] = action.payload;
      }
    },
    removeTaskFromList: (state, action) => {
      state.kanbanTasks = state.kanbanTasks.filter(t => t._id !== action.payload);
    },
    // Meetings Slices (Step 10)
    fetchMeetingsSuccess: (state, action) => {
      state.scheduledMeetings = action.payload;
    },
    addMeetingSuccess: (state, action) => {
      state.scheduledMeetings.push(action.payload);
    },
    // Notifications Slices (Step 8)
    fetchNotificationsSuccess: (state, action) => {
      state.pushNotifications = action.payload;
    },
    addNotificationSuccess: (state, action) => {
      state.pushNotifications.unshift(action.payload);
    },
    markNotificationReadSuccess: (state, action) => {
      const idx = state.pushNotifications.findIndex(n => n._id === action.payload._id);
      if (idx !== -1) {
        state.pushNotifications[idx].isRead = true;
      }
    },
    // Presence map (Step 4)
    updatePresence: (state, action) => {
      const { userId, presence } = action.payload;
      state.onlinePresenceMap[userId] = presence;
    },
    // WebRTC Calling
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
    },
    clearCallState: (state) => {
      state.activeCall = null;
      state.incomingCall = null;
    },
    setGroupCall: (state, action) => {
      state.activeGroupCall = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStart,
  fetchWorkspacesSuccess,
  setActiveWorkspace,
  fetchChannelsSuccess,
  setSelectedChannel,
  fetchMessagesSuccess,
  addMessageSuccess,
  updateMessageInList,
  fetchTasksSuccess,
  addTaskSuccess,
  updateTaskInList,
  removeTaskFromList,
  fetchMeetingsSuccess,
  addMeetingSuccess,
  fetchNotificationsSuccess,
  addNotificationSuccess,
  markNotificationReadSuccess,
  updatePresence,
  setIncomingCall,
  setActiveCall,
  clearCallState,
  setGroupCall,
  fetchFailure,
} = chatSlice.actions;

export default chatSlice.reducer;
