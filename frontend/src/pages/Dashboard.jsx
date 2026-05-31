import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  LogOut,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Plus,
  Users,
  Settings,
  Sparkles,
  Pin,
  Archive,
  CheckCheck,
  Languages,
  User as UserIcon,
  X,
  Volume2,
  VolumeX,
  VideoOff,
  CornerUpLeft,
  Trash2,
  Edit2,
  FileText,
  Clock,
  Compass,
  Layout,
  Calendar as CalendarIcon,
  Bell,
  Mic,
  MicOff,
  ChevronRight,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';

import { api } from '../services/api';
import { logout } from '../redux/slices/authSlice';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import KanbanBoard from '../components/KanbanBoard';
import MeetingScheduler from '../components/MeetingScheduler';
import {
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
  clearCallState
} from '../redux/slices/chatSlice';

const SOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket;

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Scoped Workspace Slices
  const {
    workspaces,
    activeWorkspace,
    channels,
    selectedChannel,
    messages,
    kanbanTasks,
    scheduledMeetings,
    pushNotifications,
    onlinePresenceMap,
    activeCall,
    incomingCall
  } = useSelector((state) => state.chat);

  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'kanban', 'meetings', 'friends'
  const [userPresence, setUserPresence] = useState('Online'); // Online, Away, Busy, Offline

  // Friends & DM System States
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState('online'); // 'online', 'all', 'pending', 'add'
  const [friendEmailInput, setFriendEmailInput] = useState('');
  const [friendRequestStatus, setFriendRequestStatus] = useState({ success: null, message: '' });
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [directChatsList, setDirectChatsList] = useState([]);
  const [selectedDirectChat, setSelectedDirectChat] = useState(null);

  
  // Sidebar states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelNameInput, setChannelNameInput] = useState('');
  const [channelDescInput, setChannelDescInput] = useState('');
  const [channelIsPrivate, setChannelIsPrivate] = useState(false);
  
  // Messaging input states
  const [messageInput, setMessageInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showNotificationsTray, setShowNotificationsTray] = useState(false);
  
  // File uploads
  const [attachedFileUrl, setAttachedFileUrl] = useState('');
  const [attachedFileType, setAttachedFileType] = useState('text'); // text, image, pdf, video, voice
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  
  // Voice Recording state (Step 12 Voice Notes)
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // AI states
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSummary, setAiSummary] = useState('');

  // WebRTC Stream Elements
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const connectionRef = useRef();
  const messageEndRef = useRef(null);

  // Active Workspace Members list
  const [workspaceMembersList, setWorkspaceMembersList] = useState([]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
      audio.volume = 0.35;
      audio.play();
    } catch (e) {}
  };

  const loadFriendsData = async () => {
    try {
      const friendsData = await api.getFriends();
      if (friendsData.success) {
        setFriendsList(friendsData.data);
      }
      const requestsData = await api.getFriendRequests();
      if (requestsData.success) {
        setFriendRequests(requestsData.data);
      }
      const chatsData = await api.getDirectChats();
      if (chatsData.success) {
        setDirectChatsList(chatsData.data);
      }
    } catch (err) {
      console.error('Error loading friends:', err);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmailInput.trim()) return;
    setFriendRequestStatus({ success: null, message: '' });

    try {
      const data = await api.sendFriendRequest(friendEmailInput);
      if (data.success) {
        setFriendRequestStatus({ success: true, message: 'Friend request sent successfully!' });
        setFriendEmailInput('');
        loadFriendsData();
        // Emit Socket Event to notify recipient
        socket?.emit('new_friend_request', {
          senderId: user._id,
          recipientId: data.data.recipient._id,
          requestData: data.data
        });
      } else {
        setFriendRequestStatus({ success: false, message: data.message || 'Failed to send request.' });
      }
    } catch (err) {
      setFriendRequestStatus({ success: false, message: 'An error occurred. User might not exist.' });
    }
  };

  const handleAcceptFriendRequest = async (requestId, senderId) => {
    try {
      const data = await api.acceptFriendRequest(requestId);
      if (data.success) {
        loadFriendsData();
        // Emit Socket Event to notify sender
        socket?.emit('friend_request_approved', {
          senderId: senderId,
          recipientId: user._id,
          recipientUser: user
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      const data = await api.rejectFriendRequest(requestId);
      if (data.success) {
        loadFriendsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const data = await api.removeFriend(friendId);
      if (data.success) {
        loadFriendsData();
        // Emit Socket Event to notify friend
        socket?.emit('friend_removed', { friendId, userId: user._id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartDirectChat = async (friend) => {
    try {
      const data = await api.accessChat(friend._id);
      if (data.success) {
        const chat = data.data;
        setSelectedDirectChat(chat);
        dispatch(setActiveWorkspace(null)); // Deactivate active workspace
        
        // Fetch 1-to-1 chat messages
        const msgsData = await api.getMessages(chat._id);
        if (msgsData.success) {
          dispatch(fetchMessagesSuccess(msgsData.data));
          socket?.emit('join_room', chat._id);
          setAiSuggestions([]);
          setAiSummary('');
        }
        
        // Refresh conversations list
        const chatsData = await api.getDirectChats();
        if (chatsData.success) {
          setDirectChatsList(chatsData.data);
        }
        
        setCurrentView('chat'); // Switch to main timeline chat layout
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectHome = () => {
    dispatch(setActiveWorkspace(null));
    setSelectedDirectChat(null);
    setCurrentView('friends');
    loadFriendsData();
  };

  // 1. Initial Load Workspaces
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadWorkspaces();
    loadFriendsData();
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      const data = await api.getWorkspaces();
      if (data.success) {
        dispatch(fetchWorkspacesSuccess(data.data));
        if (data.data.length > 0) {
          const storedActiveId = localStorage.getItem('activeWorkspaceId');
          const matchingWorkspace = data.data.find(w => w._id === storedActiveId);
          handleWorkspaceSelect(matchingWorkspace || data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Handle Workspace Selection (Step 1 Workspaces)
  const handleWorkspaceSelect = async (ws) => {
    if (!ws) return;
    localStorage.setItem('activeWorkspaceId', ws._id);
    dispatch(setActiveWorkspace(ws));
    setCurrentView('chat');
    
    // Fetch channels scoped strictly in this workspace
    try {
      const channelsData = await api.getChannels();
      if (channelsData.success) {
        dispatch(fetchChannelsSuccess(channelsData.data));
        if (channelsData.data.length > 0) {
          handleChannelSelect(channelsData.data[0]);
        }
      }
      
      // Load Workspace Tasks (Kanban)
      const tasksData = await api.getTasks();
      if (tasksData.success) {
        dispatch(fetchTasksSuccess(tasksData.data));
      }

      // Load Workspace Meetings (Calendar)
      const meetingsData = await api.getMeetings();
      if (meetingsData.success) {
        dispatch(fetchMeetingsSuccess(meetingsData.data));
      }

      // Load push notifications
      const notificationsData = await api.getNotifications();
      if (notificationsData.success) {
        dispatch(fetchNotificationsSuccess(notificationsData.data));
      }

      // Load Workspace Members (Step 2 Roles)
      const membersData = await api.getWorkspaceMembers();
      if (membersData.success) {
        setWorkspaceMembersList(membersData.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChannelSelect = async (channel) => {
    dispatch(setSelectedChannel(channel));
    try {
      const msgsData = await api.getMessages(channel._id);
      if (msgsData.success) {
        dispatch(fetchMessagesSuccess(msgsData.data));
        socket?.emit('join_room', channel._id);
        setAiSuggestions([]);
        setAiSummary('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Sockethandshake & Mentions listeners
  useEffect(() => {
    if (!user) return;

    socket = io(SOCKET_ENDPOINT);
    socket.emit('setup', { user, statusType: userPresence });

    socket.on('typing_status', ({ room, typing, senderId, senderName }) => {
      if (selectedChannel && selectedChannel._id === room) {
        setIsTyping(typing);
        setTypingUser(senderName || 'Someone');
      }
    });

    socket.on('receive_message', (newMessage) => {
      if (selectedChannel && selectedChannel._id === newMessage.channel) {
        dispatch(addMessageSuccess(newMessage));
      } else if (selectedDirectChat && (selectedDirectChat._id === newMessage.chat || selectedDirectChat._id === newMessage.chat?._id)) {
        dispatch(addMessageSuccess(newMessage));
      } else {
        playNotificationSound();
      }
    });

    // Capture dynamic push notification mentions alert (Step 8 Notifications Center)
    socket.on('notification_received', (notification) => {
      dispatch(addNotificationSuccess(notification));
      playNotificationSound();
    });

    socket.on('user_presence_updated', ({ userId, presence }) => {
      dispatch(updatePresence({ userId, presence }));
      // Reload workspace members to capture online pills updates
      reloadWorkspaceMembers();
      // Reload friends list to sync presence online states
      loadFriendsData();
    });

    // Friends WebSocket Listeners
    socket.on('friend_request_received', (requestData) => {
      playNotificationSound();
      loadFriendsData();
    });

    socket.on('friend_request_accepted', ({ recipientId, recipientUser }) => {
      playNotificationSound();
      loadFriendsData();
    });

    socket.on('unfriended_by_user', ({ userId }) => {
      loadFriendsData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeWorkspace, selectedChannel, selectedDirectChat]);

  const reloadWorkspaceMembers = async () => {
    try {
      const membersData = await api.getWorkspaceMembers();
      if (membersData.success) {
        setWorkspaceMembersList(membersData.data);
      }
    } catch (e) {}
  };

  // Scroll timeline
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Create Workspace
  const handleCreateWorkspace = async (name, description) => {
    try {
      const data = await api.createWorkspace(name, description);
      if (data.success) {
        loadWorkspaces();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Invite Member (Step 2 RBAC scoping checks)
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const data = await api.inviteUser(inviteEmail, inviteRole);
      if (data.success) {
        setInviteEmail('');
        setShowInviteModal(false);
        reloadWorkspaceMembers();
      } else {
        alert(data.message || 'Invitation failed. Verify your workspace permissions.');
      }
    } catch (e) {
      alert('Forbidden. Scoped workspace role required to invite members.');
    }
  };

  // Remove Member
  const handleRemoveMember = async (mId) => {
    if (!confirm('Are you sure you want to remove this user from the workspace?')) return;
    try {
      const data = await api.removeUser(mId);
      if (data.success) {
        reloadWorkspaceMembers();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Action forbidden. Only Owner or Admin can remove members.');
    }
  };

  // Create Channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelNameInput) return;
    try {
      const data = await api.createChannel(channelNameInput, channelDescInput, channelIsPrivate);
      if (data.success) {
        setChannelNameInput('');
        setChannelDescInput('');
        setChannelIsPrivate(false);
        setShowChannelModal(false);
        // Refresh Channels
        const channelsData = await api.getChannels();
        if (channelsData.success) {
          dispatch(fetchChannelsSuccess(channelsData.data));
        }
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Forbidden. Scoped role needed to launch channels.');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const activeTargetId = selectedChannel?._id || selectedDirectChat?._id;
    if (!activeTargetId) return;
    if (!messageInput.trim() && !attachedFileUrl) return;

    try {
      socket?.emit('stop_typing', { room: activeTargetId, senderId: user._id });
      setTyping(false);

      const response = await api.sendMessage(
        activeTargetId,
        messageInput,
        attachedFileUrl,
        attachedFileType,
        replyingMessage?._id
      );

      if (response.success) {
        dispatch(addMessageSuccess(response.data));
        socket?.emit('send_message', response.data);
        setMessageInput('');
        setAttachedFileUrl('');
        setAttachedFileType('text');
        setReplyingMessage(null);
        
        if (response.data._id) {
          fetchSmartReplies(response.data._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSmartReplies = async (msgId) => {
    try {
      const data = await api.getSmartReplies(msgId);
      if (data.success) {
        setAiSuggestions(data.suggestions);
      }
    } catch (e) {}
  };

  const handleSmartReplyClick = (reply) => {
    setMessageInput(reply);
  };

  const handleTranslateMessage = async (msg) => {
    try {
      const data = await api.translateMessage(msg._id, 'Spanish');
      if (data.success) {
        const updatedMsg = { ...msg, message: `${msg.message} \n🌐 (Translated): ${data.translatedText}` };
        dispatch(updateMessageInList(updatedMsg));
      }
    } catch (e) {}
  };

  const handleSummarizeChat = async () => {
    if (!selectedChannel) return;
    try {
      const data = await api.getChatSummary(selectedChannel._id);
      if (data.success) {
        setAiSummary(data.summary);
      }
    } catch (e) {}
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { room: selectedChannel._id, senderId: user._id, senderName: user.name });
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop_typing', { room: selectedChannel._id, senderId: user._id });
        setTyping(false);
      }
    }, timerLength);
  };

  const handlePinChat = () => {
    // legacy chat pin mock alert
    alert('Pinning direct chats supported under 1-to-1 rooms');
  };

  // Reactions Engine (Step 5 reactions)
  const handleAddEmoji = async (msgId, emoji) => {
    try {
      const data = await api.toggleReaction(msgId, emoji);
      if (data.success) {
        dispatch(updateMessageInList(data.data));
      }
    } catch (e) {}
  };

  // Voice Note capture (Step 12 Voice Notes MediaRecorder API)
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return alert('Media recording not supported on this browser');
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Simulates audio upload and returns custom mock webm media path
        setAttachedFileUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        setAttachedFileType('voice');
      };
      
      recorder.start();
      setRecording(true);
      setAudioChunks(chunks);
    } catch (e) {
      console.log(e);
      alert('Could not start recording. Verify mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  // Kanban integration (Step 9)
  const handleAddTask = async (taskData) => {
    try {
      const data = await api.createTask(taskData);
      if (data.success) {
        dispatch(addTaskSuccess(data.data));
      }
    } catch (e) {}
  };

  const handleUpdateTaskStatus = async (taskId, updateData) => {
    try {
      const data = await api.updateTaskStatus(taskId, updateData);
      if (data.success) {
        dispatch(updateTaskInList(data.data));
      }
    } catch (e) {}
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const data = await api.deleteTask(taskId);
      if (data.success) {
        dispatch(removeTaskFromList(taskId));
      }
    } catch (e) {}
  };

  const handleAiGenerateTasks = async (prompt) => {
    try {
      const data = await api.aiGenerateTasks(prompt);
      if (data.success) {
        // Reload tasks list
        const tasksData = await api.getTasks();
        if (tasksData.success) {
          dispatch(fetchTasksSuccess(tasksData.data));
        }
      }
    } catch (e) {}
  };

  // Meeting scheduler (Step 10)
  const handleAddMeeting = async (meetingData) => {
    try {
      const data = await api.createMeeting(meetingData);
      if (data.success) {
        dispatch(addMeetingSuccess(data.data));
      }
    } catch (e) {}
  };

  // Direct Call signaling (Step 13)
  const handleCallUser = (isVideoCall) => {
    alert('Direct WebRTC calls scoped under user panels. Select general channel call icons.');
  };

  // Notification Toggle
  const handleMarkNotificationRead = async (nId) => {
    try {
      const data = await api.markNotificationRead(nId);
      if (data.success) {
        dispatch(markNotificationReadSuccess(data.data));
      }
    } catch (e) {}
  };

  // Presence Trigger switch
  const handlePresenceChange = (newPresence) => {
    setUserPresence(newPresence);
    if (socket && user) {
      socket.emit('setup', { user, statusType: newPresence });
    }
  };

  // Workspace role labels styling mapping
  const getRoleBadgeColor = (role) => {
    const colors = {
      Owner: 'bg-rose-500/10 text-rose-400 border border-rose-500/10',
      Admin: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10',
      Manager: 'bg-amber-500/10 text-amber-400 border border-amber-500/10',
      Member: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/10',
      Guest: 'bg-teal-500/10 text-teal-400 border border-teal-500/10',
    };
    return colors[role] || colors.Member;
  };

  const activeUserRole = workspaceMembersList.find(m => m.user._id === user?._id)?.role || 'Member';

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden text-zinc-200">
      
      {/* 1. Left Workspace Sidebar Switcher (Discord Style) */}
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={handleWorkspaceSelect}
        onCreateWorkspace={handleCreateWorkspace}
      />

      {/* 2. Workspace / Home Sidebar */}
      <div className="w-64 h-full bg-zinc-950/80 border-r border-zinc-900 flex flex-col shrink-0">
        
        {activeWorkspace ? (
          <>
            {/* Workspace details header */}
            <div className="p-4 border-b border-zinc-900/60 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate text-white uppercase tracking-wider">{activeWorkspace.name}</h2>
                <p className="text-[10px] text-zinc-500 truncate">{activeWorkspace.description || 'Active Enterprise tenant'}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 font-bold shrink-0">
                {activeUserRole}
              </span>
            </div>

            {/* Global tabs list (Chat timelines, Kanban board, Scheduler) */}
            <div className="p-3 space-y-1">
              <button
                onClick={() => setCurrentView('chat')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${currentView === 'chat' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white'}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Workspace Channels</span>
              </button>
              
              <button
                onClick={() => setCurrentView('kanban')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${currentView === 'kanban' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white'}`}
              >
                <Layout className="w-4 h-4 shrink-0" />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setCurrentView('meetings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${currentView === 'meetings' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white'}`}
              >
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span>Scheduler slots</span>
              </button>
            </div>

            {/* Scoped Sidebar Details based on active Tab */}
            {currentView === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Channels listing section */}
                <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500 mt-2 shrink-0">
                  <span>Timeline Feeds</span>
                  {['Owner', 'Admin', 'Manager'].includes(activeUserRole) && (
                    <button onClick={() => setShowChannelModal(true)} className="p-0.5 hover:text-white" title="Launch Channel">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
                  {channels.map((chan) => {
                    const isSelected = selectedChannel?._id === chan._id;
                    return (
                      <button
                        key={chan._id}
                        onClick={() => handleChannelSelect(chan)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
                      >
                        <span className="truncate"># {chan.channelName}</span>
                        {chan.isPrivate && <span className="text-[8px] uppercase tracking-wider text-amber-500 font-bold shrink-0">Private</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Profile online/presence selector */}
                <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/20 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${userPresence === 'Online' ? 'bg-emerald-500 glow-green' : userPresence === 'Away' ? 'bg-amber-500' : userPresence === 'Busy' ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                    <select
                      value={userPresence}
                      onChange={(e) => handlePresenceChange(e.target.value)}
                      className="bg-transparent text-[11px] text-zinc-300 font-semibold focus:outline-none border-none cursor-pointer"
                    >
                      <option value="Online" className="bg-zinc-950 text-white">Online</option>
                      <option value="Away" className="bg-zinc-950 text-white">Away</option>
                      <option value="Busy" className="bg-zinc-950 text-white">Busy</option>
                      <option value="Offline" className="bg-zinc-950 text-white">Offline</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Discord Style Home Header */}
            <div className="p-4 border-b border-zinc-900/60 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Home</h2>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">
                Direct Messages
              </span>
            </div>

            {/* Home Side Menu */}
            <div className="p-3 space-y-1 shrink-0">
              <button
                onClick={() => setCurrentView('friends')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${currentView === 'friends' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white'}`}
              >
                <Users className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Friends</span>
              </button>
            </div>

            {/* Direct Messages List */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500 mt-2 shrink-0">
                <span>Direct Messages</span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
                {directChatsList.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 px-3 py-4 text-center">No active direct chats.<br/>Add a friend and start chatting!</p>
                ) : (
                  directChatsList.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p._id !== user._id) || { name: 'Chat Room', avatar: '', isOnline: false };
                    const isSelected = selectedDirectChat?._id === chat._id && currentView === 'chat';
                    const otherParticipantPresence = onlinePresenceMap[otherParticipant._id] || (otherParticipant.isOnline ? 'Online' : 'Offline');

                    return (
                      <button
                        key={chat._id}
                        onClick={async () => {
                          setSelectedDirectChat(chat);
                          dispatch(setActiveWorkspace(null));
                          const msgsData = await api.getMessages(chat._id);
                          if (msgsData.success) {
                            dispatch(fetchMessagesSuccess(msgsData.data));
                            socket?.emit('join_room', chat._id);
                            setAiSuggestions([]);
                            setAiSummary('');
                          }
                          setCurrentView('chat');
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-5 h-5 rounded-md overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-[10px]">
                            {otherParticipant.avatar ? (
                              <img src={otherParticipant.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              otherParticipant.name.charAt(0)
                            )}
                          </div>
                          <span className={`absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border border-zinc-950 ${otherParticipantPresence === 'Online' ? 'bg-emerald-500 glow-green' : otherParticipantPresence === 'Away' ? 'bg-amber-500' : otherParticipantPresence === 'Busy' ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                        </div>
                        <span className="truncate flex-1 text-left">{otherParticipant.name}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Profile online/presence selector */}
              <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/20 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${userPresence === 'Online' ? 'bg-emerald-500 glow-green' : userPresence === 'Away' ? 'bg-amber-500' : userPresence === 'Busy' ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                  <select
                    value={userPresence}
                    onChange={(e) => handlePresenceChange(e.target.value)}
                    className="bg-transparent text-[11px] text-zinc-300 font-semibold focus:outline-none border-none cursor-pointer"
                  >
                    <option value="Online" className="bg-zinc-950 text-white">Online</option>
                    <option value="Away" className="bg-zinc-950 text-white">Away</option>
                    <option value="Busy" className="bg-zinc-950 text-white">Busy</option>
                    <option value="Offline" className="bg-zinc-950 text-white">Offline</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {(currentView === 'kanban' || currentView === 'meetings') && (
          <div className="flex-1 flex flex-col p-4 text-xs text-zinc-500 leading-relaxed justify-between">
            <div className="space-y-4">
              <p className="leading-relaxed">
                Use the top workspace controls inside the panel to add or filter active tasks and schedulers.
              </p>
              <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/10 space-y-2">
                <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider block">Board Stats</span>
                <div className="flex items-center justify-between">
                  <span>Pending Tasks</span>
                  <span className="font-bold text-white">{kanbanTasks.filter(t => t.status !== 'Done').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Planned Syncs</span>
                  <span className="font-bold text-white">{scheduledMeetings.length}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite Team
            </button>
          </div>
        )}
      </div>

      {/* 3. Central Dynamic timelines feed area */}
      <div className="flex-1 h-full flex flex-col bg-zinc-900/30">
        
        {/* Scoped View Timeline Router */}
        {currentView === 'chat' && (
          (selectedChannel || selectedDirectChat) ? (
            <>
              {/* Timeline Room Header */}
              <div className="h-16 border-b border-zinc-900/60 flex items-center justify-between px-6 bg-zinc-950/20 shrink-0">
                <div className="flex items-center gap-2">
                  {selectedChannel ? (
                    <>
                      <span className="text-base font-bold text-white"># {selectedChannel.channelName}</span>
                      <span className="text-[10px] text-zinc-500 truncate max-w-[200px]"> - {selectedChannel.description || 'Workspace channel'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-bold text-white">@ {selectedDirectChat.participants.find(p => p._id !== user._id)?.name || 'Direct Chat'}</span>
                      <span className="text-[10px] text-zinc-500 truncate max-w-[200px]"> - Direct Messaging</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Notification Centre Trigger Icon (Step 8 Badge Count) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotificationsTray(!showNotificationsTray)}
                      className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Alert Center"
                    >
                      <Bell className="w-4 h-4" />
                      {pushNotifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-[8px] font-bold flex items-center justify-center text-white scale-90">
                          {pushNotifications.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </button>

                    {/* Notifications center floating tray (Step 8 Notifications Center list) */}
                    {showNotificationsTray && (
                      <div className="absolute right-0 top-12 z-35 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800/50">
                        <div className="p-3.5 flex items-center justify-between bg-zinc-900/60">
                          <span className="text-xs font-bold text-white">Workspace Alerts</span>
                          <button onClick={() => setShowNotificationsTray(false)}>
                            <X className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-zinc-900/30">
                          {pushNotifications.length === 0 ? (
                            <div className="p-6 text-center text-[10px] text-zinc-650">No new workspace alerts</div>
                          ) : (
                            pushNotifications.map(n => (
                              <div
                                key={n._id}
                                onClick={() => handleMarkNotificationRead(n._id)}
                                className={`p-3.5 cursor-pointer hover:bg-zinc-900/30 transition-colors flex gap-2 justify-between items-start ${!n.isRead ? 'bg-indigo-600/5' : ''}`}
                              >
                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-zinc-300 leading-relaxed">{n.message}</p>
                                  <span className="text-[8px] text-zinc-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSummarizeChat}
                    className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Summarize Channel Discussion"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Summarize
                  </button>
                </div>
              </div>

              {/* Discussion Summary Banner */}
              {aiSummary && (
                <div className="mx-6 mt-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-600/5 relative z-10 flex gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 h-fit">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">Workspace channel discussion summary</span>
                      <button onClick={() => setAiSummary('')}>
                        <X className="w-3 h-3 text-zinc-500 hover:text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Chat timelines message list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <Compass className="w-8 h-8 text-zinc-800 mb-2 animate-pulse-slow" />
                    <p className="text-xs">No logs posted. Initiate discussions scoped to #{selectedChannel.channelName}.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isOwnMessage = m.sender._id === user?._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex gap-3 max-w-[70%] ${isOwnMessage ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-800">
                          {m.sender.avatar ? (
                            <img src={m.sender.avatar} alt={m.sender.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center font-bold text-xs">
                              {m.sender.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Message body */}
                        <div className="space-y-1 relative group">
                          
                          {/* Threaded Reply strip (Step 6 Threaded replies banner) */}
                          {m.parentMessageId && (
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-[10px] text-zinc-400 mb-1 flex flex-col gap-0.5 border-l-2 border-l-indigo-500">
                              <span className="font-semibold text-zinc-200">Thread reply</span>
                              <p className="truncate max-w-xs">{m.parentMessageId.message || 'Shared thread attachment'}</p>
                            </div>
                          )}

                          <div className={`p-3.5 rounded-2xl text-xs relative leading-relaxed ${isOwnMessage ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-900/60 border border-zinc-850 text-zinc-200 rounded-tl-none'}`}>
                            
                            {/* Rich File Sharing rendering (Step 3 Image, PDF sharing) */}
                            {m.attachmentUrl && m.attachmentType === 'image' && (
                              <img src={m.attachmentUrl} alt="Shared Image" className="max-w-xs rounded-lg mb-2 object-cover" />
                            )}
                            {m.attachmentUrl && m.attachmentType === 'pdf' && (
                              <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/40 text-[10px] text-indigo-300 mb-2 border border-zinc-800 hover:bg-zinc-950/80">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <span>Shared PDF Document</span>
                              </a>
                            )}
                            {m.attachmentUrl && m.attachmentType === 'voice' && (
                              <audio src={m.attachmentUrl} controls className="max-w-xs mb-2 scale-90" />
                            )}

                            <p>{m.message}</p>

                            {/* Reactions display (Step 5 Reactions badge list) */}
                            {m.reactions && m.reactions.length > 0 && (
                              <div className="absolute -bottom-2 right-2 flex gap-1 bg-zinc-900 border border-zinc-850 rounded-full px-1.5 py-0.5 text-[9px] shadow-lg">
                                {m.reactions.map((r, i) => (
                                  <span key={i} title="Reacted">{r.emoji}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Message status line */}
                          <div className={`flex items-center gap-2 text-[9px] text-zinc-500 ${isOwnMessage ? 'justify-end' : ''}`}>
                            <span className="font-semibold text-zinc-400">{m.sender.name}</span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            
                            {isOwnMessage && (
                              <>
                                <span>•</span>
                                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                              </>
                            )}

                            {/* Message actions (Slack reaction picker, threaded replies click) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-2">
                              <button onClick={() => handleTranslateMessage(m)} className="hover:text-white" title="Translate with AI">
                                <Languages className="w-3 h-3" />
                              </button>
                              <button onClick={() => setReplyingMessage(m)} className="hover:text-white" title="Thread Reply">
                                <CornerUpLeft className="w-3 h-3" />
                              </button>
                              
                              {/* Quick reactions trigger picker (Step 5 Slack Reactions 👍 ❤️ 🔥 🚀) */}
                              <div className="flex gap-1 border border-zinc-800 rounded px-1.5 py-0.5 bg-zinc-950">
                                {['👍', '❤️', '🔥', '🚀'].map(emoji => (
                                  <button key={emoji} onClick={() => handleAddEmoji(m._id, emoji)} className="hover:scale-125 transition-all text-[9px]">
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}

                {/* Live typing status indicators */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[70%]">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-800">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="p-3.5 bg-zinc-900 text-zinc-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                      <span className="font-semibold text-white">{typingUser}</span> is typing
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-300" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* AI suggestion reply tags */}
              {aiSuggestions.length > 0 && (
                <div className="px-6 py-2 border-t border-zinc-900/40 bg-zinc-950/10 flex gap-2 items-center flex-wrap">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    AI Replies:
                  </span>
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSmartReplyClick(suggestion)}
                      className="px-3 py-1 text-xs rounded-full border border-indigo-500/20 bg-indigo-600/5 hover:bg-indigo-600/20 hover:border-indigo-400 text-indigo-300 transition-all font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Replying banner indicator */}
              {replyingMessage && (
                <div className="mx-6 px-4 py-2 border border-zinc-800 bg-zinc-900 rounded-t-xl flex items-center justify-between border-b-transparent">
                  <div className="flex flex-col text-xs text-zinc-400">
                    <span className="font-bold text-zinc-200">Reply thread scoped to {replyingMessage.sender.name}</span>
                    <span className="truncate max-w-md">{replyingMessage.message}</span>
                  </div>
                  <button onClick={() => setReplyingMessage(null)}>
                    <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                  </button>
                </div>
              )}

              {/* File Attachment preview */}
              {attachedFileUrl && (
                <div className="mx-6 px-4 py-2 border border-zinc-800 bg-zinc-900 rounded-t-xl flex items-center justify-between border-b-transparent gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-indigo-300">File attached ({attachedFileType})</span>
                  </div>
                  <button onClick={() => setAttachedFileUrl('')}>
                    <X className="w-4 h-4 text-zinc-500 hover:text-rose-400" />
                  </button>
                </div>
              )}

              {/* Message Compose Form */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-zinc-900/60 bg-zinc-950/10 shrink-0">
                <div className="relative flex items-center gap-3">
                  
                  {/* File Attachment Menu Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white transition-colors"
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {showAttachmentMenu && (
                      <div className="absolute bottom-14 left-0 z-30 w-48 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFileUrl('https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600');
                            setAttachedFileType('image');
                            setShowAttachmentMenu(false);
                          }}
                          className="w-full text-left p-2 hover:bg-zinc-900 rounded-lg text-[10px] flex items-center gap-2 text-zinc-350 hover:text-white"
                        >
                          🖼️ Attach Mock Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                            setAttachedFileType('pdf');
                            setShowAttachmentMenu(false);
                          }}
                          className="w-full text-left p-2 hover:bg-zinc-900 rounded-lg text-[10px] flex items-center gap-2 text-zinc-350 hover:text-white"
                        >
                          📄 Attach Mock PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Voice Notes Capture widget (Step 12 Mic Recorder trigger) */}
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl border transition-all ${recording ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-zinc-900 border-zinc-850 text-zinc-450 hover:text-white'}`}
                    title={recording ? 'Stop Recording Voice Note' : 'Record Voice Note'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleTyping}
                    placeholder="Type #message or mention team member with @..."
                    className="flex-1 py-3 px-4 rounded-xl glass-input text-xs text-white"
                  />

                  <button
                    type="submit"
                    className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/20 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 animate-pulse-slow">
                <MessageSquare className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                {activeWorkspace ? `#${activeWorkspace.name} timeline` : 'Direct Messaging Hub'}
              </h2>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                {activeWorkspace 
                  ? 'Add or launch a workspace channel from the left thread list to coordinate in real-time.' 
                  : 'Select an active direct message conversation from the sidebar, or add a friend to start chatting in private.'}
              </p>
            </div>
          )
        )}

        {currentView === 'kanban' && (
          <KanbanBoard
            tasks={kanbanTasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onAiGenerateTasks={handleAiGenerateTasks}
            workspaceMembers={workspaceMembersList}
          />
        )}

        {currentView === 'meetings' && (
          <MeetingScheduler
            meetings={scheduledMeetings}
            onAddMeeting={handleAddMeeting}
            workspaceMembers={workspaceMembersList}
          />
        )}

        {currentView === 'friends' && (
          <div className="flex-1 flex flex-col bg-zinc-950/40 relative overflow-hidden">
            {/* Friends Top Navigation Bar */}
            <div className="h-16 border-b border-zinc-900/60 flex items-center justify-between px-6 bg-zinc-950/20 shrink-0">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Friends</span>
                
                <div className="w-[1px] h-4 bg-zinc-800 mx-2" />

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFriendsFilter('online')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${friendsFilter === 'online' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setFriendsFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${friendsFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFriendsFilter('pending')}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${friendsFilter === 'pending' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
                  >
                    Pending
                    {friendRequests.length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFriendsFilter('add');
                      setFriendRequestStatus({ success: null, message: '' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${friendsFilter === 'add' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' : 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white'}`}
                  >
                    Add Friend
                  </button>
                </div>
              </div>

              {/* Search Bar for friends */}
              {friendsFilter !== 'add' && (
                <div className="relative w-48 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Friends Content Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ADD FRIEND TAB VIEW */}
              {friendsFilter === 'add' && (
                <div className="max-w-md bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Friend</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      You can add friends with their email address. Email addresses are case-insensitive.
                    </p>
                  </div>

                  <form onSubmit={handleSendFriendRequest} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="friend@example.com"
                      value={friendEmailInput}
                      onChange={(e) => setFriendEmailInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl glass-input text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/10 shrink-0"
                    >
                      Send request
                    </button>
                  </form>

                  {friendRequestStatus.message && (
                    <div className={`p-3 rounded-xl border text-xs font-semibold ${friendRequestStatus.success ? 'bg-emerald-600/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-600/5 border-rose-500/20 text-rose-400'}`}>
                      {friendRequestStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* PENDING REQUESTS TAB VIEW */}
              {friendsFilter === 'pending' && (
                <div className="space-y-6">
                  {/* Incoming Requests */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">
                      Incoming Requests ({friendRequests.filter(r => r.recipient._id === user._id).length})
                    </span>

                    {friendRequests.filter(r => r.recipient._id === user._id).length === 0 ? (
                      <p className="text-xs text-zinc-600">No incoming friend requests.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {friendRequests
                          .filter(r => r.recipient._id === user._id)
                          .map((req) => (
                            <div key={req._id} className="p-3 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 overflow-hidden shrink-0">
                                  {req.sender.avatar ? (
                                    <img src={req.sender.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    req.sender.name.charAt(0)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{req.sender.name}</p>
                                  <p className="text-[10px] text-zinc-500 truncate">{req.sender.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleAcceptFriendRequest(req._id, req.sender._id)}
                                  className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                                  title="Accept request"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRejectFriendRequest(req._id)}
                                  className="p-1.5 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                                  title="Decline request"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing Requests */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">
                      Sent Requests ({friendRequests.filter(r => r.sender._id === user._id).length})
                    </span>

                    {friendRequests.filter(r => r.sender._id === user._id).length === 0 ? (
                      <p className="text-xs text-zinc-600">No sent friend requests.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {friendRequests
                          .filter(r => r.sender._id === user._id)
                          .map((req) => (
                            <div key={req._id} className="p-3 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 overflow-hidden shrink-0">
                                  {req.recipient.avatar ? (
                                    <img src={req.recipient.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    req.recipient.name.charAt(0)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{req.recipient.name}</p>
                                  <p className="text-[10px] text-zinc-500 truncate">{req.recipient.email}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRejectFriendRequest(req._id)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-650 hover:text-white text-zinc-400 transition-all shrink-0"
                                title="Cancel request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ONLINE & ALL FRIENDS LIST VIEW */}
              {friendsFilter !== 'add' && friendsFilter !== 'pending' && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">
                    {friendsFilter === 'online' ? 'Online' : 'All'} Friends ({
                      friendsList.filter((f) => {
                        const presence = onlinePresenceMap[f._id] || (f.isOnline ? 'Online' : 'Offline');
                        const matchesSearch = f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) || f.email.toLowerCase().includes(friendSearchQuery.toLowerCase());
                        if (friendsFilter === 'online') {
                          return presence !== 'Offline' && matchesSearch;
                        }
                        return matchesSearch;
                      }).length
                    })
                  </span>

                  {friendsList.filter((f) => {
                    const presence = onlinePresenceMap[f._id] || (f.isOnline ? 'Online' : 'Offline');
                    const matchesSearch = f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) || f.email.toLowerCase().includes(friendSearchQuery.toLowerCase());
                    if (friendsFilter === 'online') {
                      return presence !== 'Offline' && matchesSearch;
                    }
                    return matchesSearch;
                  }).length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/15 border border-dashed border-zinc-900 rounded-2xl">
                      <p className="text-xs text-zinc-650">No friends found matching active filters.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-900/60 border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/15">
                      {friendsList
                        .filter((f) => {
                          const presence = onlinePresenceMap[f._id] || (f.isOnline ? 'Online' : 'Offline');
                          const matchesSearch = f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) || f.email.toLowerCase().includes(friendSearchQuery.toLowerCase());
                          if (friendsFilter === 'online') {
                            return presence !== 'Offline' && matchesSearch;
                          }
                          return matchesSearch;
                        })
                        .map((friend) => {
                          const presence = onlinePresenceMap[friend._id] || (friend.isOnline ? 'Online' : 'Offline');
                          return (
                            <div key={friend._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/15 transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 overflow-hidden">
                                    {friend.avatar ? (
                                      <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      friend.name.charAt(0)
                                    )}
                                  </div>
                                  <span className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 border-zinc-950 ${presence === 'Online' ? 'bg-emerald-500 glow-green' : presence === 'Away' ? 'bg-amber-500' : presence === 'Busy' ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{friend.name}</p>
                                  <p className="text-[10px] text-zinc-500 truncate leading-relaxed">
                                    {friend.status || 'Active conversation member'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleStartDirectChat(friend)}
                                  className="p-2 rounded-xl bg-indigo-650/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                  title="Message"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to unfriend ${friend.name}?`)) {
                                      handleRemoveFriend(friend._id);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-zinc-900/60 hover:bg-rose-650 hover:text-white text-zinc-500 transition-all shadow-sm"
                                  title="Unfriend"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* 4. Right Sidebar Members directory (Step 1, 2 Members list) */}
      {activeWorkspace && (
        <div className="w-64 h-full bg-zinc-950 border-l border-zinc-900/60 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-900/60 flex items-center gap-2 text-white shrink-0">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Workspace Directory</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div className="space-y-3">
              {workspaceMembersList.map((m) => {
                const isOwner = m.role === 'Owner';
                const userPresenceStatus = onlinePresenceMap[m.user._id] || (m.user.isOnline ? 'Online' : 'Offline');

                return (
                  <div key={m.user._id} className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/25 border border-transparent hover:border-zinc-900 transition-all group/member">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {m.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${userPresenceStatus === 'Online' ? 'bg-emerald-500 glow-green' : userPresenceStatus === 'Away' ? 'bg-amber-500' : userPresenceStatus === 'Busy' ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-white truncate">{m.user.name}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0 ${getRoleBadgeColor(m.role)}`}>
                          {m.role}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-500 truncate">{m.user.status || 'Active Member'}</p>
                    </div>

                    {/* Option to remove member (only accessible for Owner or Admin, scoped by RBAC Step 2) */}
                    {['Owner', 'Admin'].includes(activeUserRole) && m.user._id !== user?._id && !isOwner && (
                      <button
                        onClick={() => handleRemoveMember(m.user._id)}
                        className="opacity-0 group-hover/member:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          WORKSPACE COMPONENT MODALS
          ========================================== */}

      {/* 5. Invite Workspace Member Modal (Step 2 RBAC scoping checked) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white">Invite Member to Workspace</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Member Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-350 focus:outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Edit Task / Channels)</option>
                  <option value="Member">Member (Read / Write)</option>
                  <option value="Guest">Guest (Read Only)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Launch Workspace Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white">Launch Workspace Channel</h3>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. development-sprint"
                  value={channelNameInput}
                  onChange={(e) => setChannelNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Scoped sprint development discussion"
                  value={channelDescInput}
                  onChange={(e) => setChannelDescInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="private-check"
                  checked={channelIsPrivate}
                  onChange={(e) => setChannelIsPrivate(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="private-check" className="text-xs text-zinc-400">Make this channel private</label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Launch Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
