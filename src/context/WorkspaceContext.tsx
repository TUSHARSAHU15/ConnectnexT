import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Channel, Message, Task, Sprint, Meeting, Document, Notification, AIChatMessage, WorkspaceRole } from '../types';
import { mockUsers, mockChannels, mockMessages, mockDMs, mockSprints, mockTasks, mockMeetings, mockDocuments, mockNotifications } from '../services/mockData';

interface WorkspaceContextType {
  users: User[];
  channels: Channel[];
  messages: Message[];
  sprints: Sprint[];
  tasks: Task[];
  meetings: Meeting[];
  documents: Document[];
  notifications: Notification[];
  activeView: string;
  setActiveView: (view: string) => void;
  activeChatId: string; // channel id or dm recipient user id
  setActiveChatId: (id: string) => void;
  chatIsDM: boolean;
  setChatIsDM: (isDM: boolean) => void;
  currentUser: User;
  workspaceInfo: { name: string; description: string; initials: string };
  updateWorkspaceInfo: (name: string, description: string, initials: string) => void;
  
  // Chat Actions
  sendMessage: (text: string, scheduleFor?: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  addReply: (messageId: string, text: string) => void;
  typingUser: string | null;
  scheduledMessages: Message[];

  // Kanban & Sprints
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  completeSprint: () => void;

  // Documents
  addDocument: (title: string, content: string, tags: string[]) => void;
  deleteDocument: (docId: string) => void;
  
  // Meetings
  addMeeting: (title: string, date: string, time: string, duration: string, notes: string) => void;
  updateMeeting: (meeting: Meeting) => void;
  
  // Admin Operations
  addNewUser: (name: string, email: string, role: WorkspaceRole) => void;
  updateUserRole: (userId: string, role: WorkspaceRole) => void;
  toggleUserStatus: (userId: string, isSuspended: boolean) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // AI Assistant Chat
  aiConversations: AIChatMessage[];
  sendAIMessage: (text: string) => void;
  clearAIConversation: () => void;
  isAISpending: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or seed data
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('nh_users');
    return local ? JSON.parse(local) : mockUsers;
  });

  const [channels] = useState<Channel[]>(() => {
    const local = localStorage.getItem('nh_channels');
    return local ? JSON.parse(local) : mockChannels;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const local = localStorage.getItem('nh_messages');
    const dms = localStorage.getItem('nh_dms');
    const parsedMessages = local ? JSON.parse(local) : mockMessages;
    const parsedDMs = dms ? JSON.parse(dms) : mockDMs;
    return [...parsedMessages, ...parsedDMs];
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const local = localStorage.getItem('nh_sprints');
    return local ? JSON.parse(local) : mockSprints;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const local = localStorage.getItem('nh_tasks');
    return local ? JSON.parse(local) : mockTasks;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const local = localStorage.getItem('nh_meetings');
    return local ? JSON.parse(local) : mockMeetings;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const local = localStorage.getItem('nh_documents');
    return local ? JSON.parse(local) : mockDocuments;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('nh_notifications');
    return local ? JSON.parse(local) : mockNotifications;
  });

  const [aiConversations, setAiConversations] = useState<AIChatMessage[]>(() => {
    const local = localStorage.getItem('nh_ai_conversations');
    return local ? JSON.parse(local) : [
      { id: 'ai-init', sender: 'ai', text: 'Hello! I am NexusAI, your project workspace assistant. Ask me to "Show overdue tasks", "Summarize project status", or request help generating a new project task backlog.', timestamp: new Date().toISOString() }
    ];
  });

  const [workspaceInfo, setWorkspaceInfo] = useState(() => {
    const local = localStorage.getItem('nh_workspace_info');
    return local ? JSON.parse(local) : {
      name: 'Tech Innovators',
      description: 'Unified AI-powered collaboration and workspace dashboard.',
      initials: 'Tech'
    };
  });

  useEffect(() => {
    localStorage.setItem('nh_workspace_info', JSON.stringify(workspaceInfo));
  }, [workspaceInfo]);

  const updateWorkspaceInfo = (name: string, description: string, initials: string) => {
    setWorkspaceInfo({ name, description, initials });
  };

  // Navigation State
  const [activeView, setActiveView] = useState('Dashboard');
  const [activeChatId, setActiveChatId] = useState('ch-1');
  const [chatIsDM, setChatIsDM] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isAISpending, setIsAISpending] = useState(false);

  // Sync state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('nh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nh_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    const chMsgs = messages.filter(m => !m.isDM);
    const dmMsgs = messages.filter(m => m.isDM);
    localStorage.setItem('nh_messages', JSON.stringify(chMsgs));
    localStorage.setItem('nh_dms', JSON.stringify(dmMsgs));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nh_sprints', JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem('nh_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nh_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('nh_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('nh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nh_ai_conversations', JSON.stringify(aiConversations));
  }, [aiConversations]);

  // Current logged in user is always Tushar (User-1)
  const currentUser = users.find(u => u.id === 'user-1') || users[0];

  const scheduledMessages = messages.filter(m => m.scheduledFor && new Date(m.scheduledFor) > new Date());

  // ----------------------------------------------------
  // Chat Actions
  // ----------------------------------------------------
  const sendMessage = (text: string, scheduleFor?: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      isDM: chatIsDM,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toISOString(),
      reactions: [],
      replies: [],
      readBy: [currentUser.id],
      scheduledFor: scheduleFor
    };

    if (chatIsDM) {
      newMessage.recipientId = activeChatId;
    } else {
      newMessage.channelId = activeChatId;
    }

    setMessages(prev => [...prev, newMessage]);

    // Check for @mentions and trigger notification
    if (text.includes('@')) {
      users.forEach(u => {
        if (text.includes(`@${u.name}`)) {
          const newNotif: Notification = {
            id: `notif-${Date.now()}-${u.id}`,
            type: 'Mentioned',
            title: 'Mentioned in Chat',
            message: `${currentUser.name} mentioned you: "${text.substring(0, 40)}..."`,
            timestamp: new Date().toISOString(),
            read: false,
            link: 'Chat'
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      });
    }

    // Simulate standard mock responses (dynamic socket feedback)
    if (!scheduleFor && !chatIsDM) {
      simulateSocketReply(activeChatId, text);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      
      const existingReactionIndex = m.reactions.findIndex(r => r.emoji === emoji);
      let updatedReactions = [...m.reactions];

      if (existingReactionIndex > -1) {
        const reaction = updatedReactions[existingReactionIndex];
        const userHasReacted = reaction.users.includes(currentUser.name);

        if (userHasReacted) {
          // Remove reaction
          const updatedUsers = reaction.users.filter(name => name !== currentUser.name);
          if (updatedUsers.length === 0) {
            updatedReactions = updatedReactions.filter(r => r.emoji !== emoji);
          } else {
            updatedReactions[existingReactionIndex] = {
              ...reaction,
              count: reaction.count - 1,
              users: updatedUsers
            };
          }
        } else {
          // Add user to reaction
          updatedReactions[existingReactionIndex] = {
            ...reaction,
            count: reaction.count + 1,
            users: [...reaction.users, currentUser.name]
          };
        }
      } else {
        // Create new reaction
        updatedReactions.push({
          emoji,
          count: 1,
          users: [currentUser.name]
        });
      }

      return { ...m, reactions: updatedReactions };
    }));
  };

  const addReply = (messageId: string, text: string) => {
    if (!text.trim()) return;

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      return {
        ...m,
        replies: [
          ...m.replies,
          {
            id: `reply-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            text,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }));
  };

  // Simulate WebSocket response based on channel contexts
  const simulateSocketReply = (channelId: string, _userText: string) => {
    const randomUser = users.find(u => u.id !== currentUser.id && u.status === 'online');
    if (!randomUser) return;

    setTimeout(() => {
      setTypingUser(randomUser.name);
      
      setTimeout(() => {
        setTypingUser(null);
        
        let responseText = "Awesome! Let me review this as well.";
        if (channelId === 'ch-2') {
          responseText = "Sounds clean. I will review the PR right now and check the Docker image build output.";
        } else if (channelId === 'ch-3') {
          responseText = "Beautiful work! Let us adjust the primary borders to utilize glassmorphism style rules.";
        }

        const botMsg: Message = {
          id: `msg-${Date.now()}`,
          isDM: false,
          channelId,
          senderId: randomUser.id,
          senderName: randomUser.name,
          senderAvatar: randomUser.avatar,
          text: responseText,
          timestamp: new Date().toISOString(),
          reactions: [],
          replies: [],
          readBy: [randomUser.id]
        };

        setMessages(prev => [...prev, botMsg]);

        // Add Notification if the user navigated away from chat
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          type: 'New Message',
          title: `New Message in #${channels.find(c => c.id === channelId)?.name}`,
          message: `${randomUser.name}: "${responseText.substring(0, 30)}..."`,
          timestamp: new Date().toISOString(),
          read: false,
          link: 'Chat'
        };
        setNotifications(prev => [newNotif, ...prev]);

      }, 2000);
    }, 4000);
  };

  // ----------------------------------------------------
  // Kanban & Sprint Controls
  // ----------------------------------------------------
  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const activeSprint = sprints.find(s => s.status === 'active');
    const task: Task = {
      ...newTaskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sprintId: newTaskData.sprintId || (newTaskData.status !== 'Backlog' ? activeSprint?.id : undefined)
    };

    setTasks(prev => [task, ...prev]);

    // Update workload points for the assignee
    setUsers(prev => prev.map(u => {
      if (u.id === task.assigneeId) {
        return {
          ...u,
          workloadPoints: u.workloadPoints + task.storyPoints
        };
      }
      return u;
    }));

    // Trigger Notification for the assigned developer
    if (task.assigneeId !== currentUser.id) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'Task Assigned',
        title: 'Task Assigned',
        message: `${currentUser.name} assigned you: "${task.title}"`,
        timestamp: new Date().toISOString(),
        read: false,
        link: 'Projects'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const updateTask = (updatedTask: Task) => {
    const originalTask = tasks.find(t => t.id === updatedTask.id);
    if (!originalTask) return;

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    // Handle workload points changes when assignee or points change
    setUsers(prev => prev.map(u => {
      let workload = u.workloadPoints;
      
      // Remove old points if they were assigned to this user
      if (originalTask.assigneeId === u.id && originalTask.status !== 'Done') {
        workload = Math.max(0, workload - originalTask.storyPoints);
      }
      // Add new points if they are now assigned to this user and task isn't Done
      if (updatedTask.assigneeId === u.id && updatedTask.status !== 'Done') {
        workload = workload + updatedTask.storyPoints;
      }
      // If task marked Done, deduct workload points
      if (updatedTask.status === 'Done' && originalTask.status !== 'Done' && updatedTask.assigneeId === u.id) {
        workload = Math.max(0, workload - updatedTask.storyPoints);
      }

      // If task marked back to in-progress from done, add workload points back
      if (originalTask.status === 'Done' && updatedTask.status !== 'Done' && updatedTask.assigneeId === u.id) {
        workload = workload + updatedTask.storyPoints;
      }

      const completedInc = (updatedTask.status === 'Done' && originalTask.status !== 'Done' && u.id === updatedTask.assigneeId) ? 1 : 0;

      return {
        ...u,
        workloadPoints: workload,
        completedTasksCount: u.completedTasksCount + completedInc
      };
    }));
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));

    // Remove user workload points
    if (taskToDelete.status !== 'Done') {
      setUsers(prev => prev.map(u => {
        if (u.id === taskToDelete.assigneeId) {
          return {
            ...u,
            workloadPoints: Math.max(0, u.workloadPoints - taskToDelete.storyPoints)
          };
        }
        return u;
      }));
    }
  };

  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        comments: [
          ...t.comments,
          {
            id: `c-${Date.now()}`,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            text,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }));
  };

  const completeSprint = () => {
    const activeSprint = sprints.find(s => s.status === 'active');
    if (!activeSprint) return;

    // Calculate actual story points completed
    const activeSprintTasks = tasks.filter(t => t.sprintId === activeSprint.id);
    const donePoints = activeSprintTasks
      .filter(t => t.status === 'Done')
      .reduce((sum, t) => sum + t.storyPoints, 0);

    // Update active sprint to completed
    const completedSprint: Sprint = {
      ...activeSprint,
      status: 'completed',
      completedPoints: donePoints
    };

    // Make future sprint the active one
    const futureSprint = sprints.find(s => s.status === 'future');
    const updatedFutureSprint: Sprint | null = futureSprint ? {
      ...futureSprint,
      status: 'active'
    } : null;

    setSprints(prev => prev.map(s => {
      if (s.id === activeSprint.id) return completedSprint;
      if (futureSprint && s.id === futureSprint.id) return updatedFutureSprint!;
      return s;
    }));

    // Move incomplete active sprint tasks to the new active sprint or backlog
    setTasks(prev => prev.map(t => {
      if (t.sprintId === activeSprint.id && t.status !== 'Done') {
        return {
          ...t,
          sprintId: updatedFutureSprint?.id || undefined,
          status: 'Backlog' // Reset status to backlog if no future sprint
        };
      }
      return t;
    }));

    // Add administrative project notification
    const alertNotif: Notification = {
      id: `notif-${Date.now()}`,
      type: 'Project Update',
      title: 'Sprint Completed',
      message: `${activeSprint.name} completed! ${donePoints}/${activeSprint.storyPointsGoal} SP shipped successfully.`,
      timestamp: new Date().toISOString(),
      read: false,
      link: 'Sprints'
    };
    setNotifications(prev => [alertNotif, ...prev]);
  };

  // ----------------------------------------------------
  // Documents Management
  // ----------------------------------------------------
  const addDocument = (title: string, content: string, tags: string[]) => {
    const doc: Document = {
      id: `doc-${Date.now()}`,
      title,
      content,
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
      tags
    };

    setDocuments(prev => [doc, ...prev]);

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      type: 'Project Update',
      title: 'Document Added',
      message: `${currentUser.name} uploaded doc: "${title}" in Notion Wiki.`,
      timestamp: new Date().toISOString(),
      read: false,
      link: 'Documents'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // ----------------------------------------------------
  // Meetings Management
  // ----------------------------------------------------
  const addMeeting = (title: string, date: string, time: string, duration: string, notes: string) => {
    const meeting: Meeting = {
      id: `meet-${Date.now()}`,
      title,
      date,
      time,
      duration,
      attendees: [currentUser.name, 'Rahul Sharma', 'Priya Patel'],
      notes
    };

    setMeetings(prev => [...prev, meeting]);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      type: 'Meeting Reminder',
      title: 'Meeting Scheduled',
      message: `"${title}" has been scheduled for ${date} at ${time}.`,
      timestamp: new Date().toISOString(),
      read: false,
      link: 'Meetings'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const updateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };

  // ----------------------------------------------------
  // Admin & User Configurations
  // ----------------------------------------------------
  const addNewUser = (name: string, email: string, role: WorkspaceRole) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      role,
      status: 'offline',
      productivityScore: 75 + Math.floor(Math.random() * 20),
      workloadPoints: 0,
      completedTasksCount: 0
    };

    setUsers(prev => [...prev, newUser]);
  };

  const updateUserRole = (userId: string, role: WorkspaceRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const toggleUserStatus = (userId: string, isSuspended: boolean) => {
    // If suspended, set offline, else offline (can be toggle suspended flag or active role)
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: isSuspended ? 'offline' : 'online',
          role: isSuspended ? 'Guest' : u.role // Demote to guest if suspended as visual mock
        };
      }
      return u;
    }));
  };

  // ----------------------------------------------------
  // Notifications Hub
  // ----------------------------------------------------
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // ----------------------------------------------------
  // AI Chat Assistant Simulation
  // ----------------------------------------------------
  const sendAIMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: `ai-msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setAiConversations(prev => [...prev, userMsg]);
    setIsAISpending(true);

    setTimeout(() => {
      setIsAISpending(false);
      let replyText = "I parsed your request, but I'm specialized in workspace summaries. Try asking: **'Show overdue tasks'** or **'Summarize project status'** so I can analyze our active databases.";

      const query = text.toLowerCase();
      if (query.includes('overdue') || query.includes('late') || query.includes('behind')) {
        const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.priority === 'Critical');
        
        replyText = `### Active Database Scan Complete
I found **${overdueTasks.length} critical blocker tasks** in our active Sprint board:

${overdueTasks.map((t, i) => `${i+1}. **${t.title}** - Assigned to *${users.find(u => u.id === t.assigneeId)?.name || 'Unassigned'}* (${t.storyPoints} Story Points)`).join('\n')}

*Backend Pipeline issues (Docker build caching) are currently blocking deployment reviews. Priya is currently testing markdown uploads.*`;
      } 
      else if (query.includes('summarize') || query.includes('status') || query.includes('project status')) {
        const activeSprint = sprints.find(s => s.status === 'active');
        const sprintTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
        const total = sprintTasks.length;
        const done = sprintTasks.filter(t => t.status === 'Done').length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;

        replyText = `### Project Status Executive Brief
Here is the automated summary for **${activeSprint?.name || 'Sprint'}**:

- **Sprint Goal**: ${activeSprint?.goal || 'No goal set'}
- **Completion Rate**: **${rate}% completed** (${done}/${total} tasks shipped)
- **Active Blockers**: **2 Critical dependencies** blocked in "To Do"
- **AI Prediction Index**: **87% sprint completion probability** based on current team velocity scores.
- **Risk Alert**: *Amit Verma* is experiencing elevated risk scores with **24 story points** under review.`;
      }

      const aiMsg: AIChatMessage = {
        id: `ai-msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      setAiConversations(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const clearAIConversation = () => {
    setAiConversations([
      { id: 'ai-init', sender: 'ai', text: 'Hello! I am NexusAI, your project workspace assistant. Ask me to "Show overdue tasks", "Summarize project status", or request help generating a new project task backlog.', timestamp: new Date().toISOString() }
    ]);
  };

  // Periodic automatic mock messages typing simulation to make workspace feel active
  useEffect(() => {
    const interval = setInterval(() => {
      const activeSprint = sprints.find(s => s.status === 'active');
      if (!activeSprint) return;
      
      // Randomly select a notification trigger or new message simulation
      const eventChance = Math.random();
      if (eventChance < 0.25) {
        // Typing indicator
        const randomDev = users.find(u => u.id !== currentUser.id && u.status === 'online');
        if (randomDev) {
          setTypingUser(randomDev.name);
          setTimeout(() => {
            setTypingUser(null);
            
            const randomMsgs = [
              "Just updated the Sprint velocity points. Looking excellent!",
              "Does anyone need assistance review their current block tickets?",
              "Pushed hotfix for container session logins.",
              "Scheduled calendar invites for the daily alignment call."
            ];
            const text = randomMsgs[Math.floor(Math.random() * randomMsgs.length)];
            
            const botMsg: Message = {
              id: `msg-${Date.now()}`,
              isDM: false,
              channelId: 'ch-1',
              senderId: randomDev.id,
              senderName: randomDev.name,
              senderAvatar: randomDev.avatar,
              text,
              timestamp: new Date().toISOString(),
              reactions: [],
              replies: [],
              readBy: [randomDev.id]
            };

            setMessages(prev => [...prev, botMsg]);
            
            const newNotif: Notification = {
              id: `notif-${Date.now()}`,
              type: 'New Message',
              title: `New Message in #general`,
              message: `${randomDev.name}: "${text.substring(0, 30)}..."`,
              timestamp: new Date().toISOString(),
              read: false,
              link: 'Chat'
            };
            setNotifications(prev => [newNotif, ...prev]);
          }, 2500);
        }
      }
    }, 60000); // Trigger message bot simulation every minute

    return () => clearInterval(interval);
  }, [users, sprints]);

  return (
    <WorkspaceContext.Provider value={{
      users,
      channels,
      messages,
      sprints,
      tasks,
      meetings,
      documents,
      notifications,
      activeView,
      setActiveView,
      activeChatId,
      setActiveChatId,
      chatIsDM,
      setChatIsDM,
      currentUser,
      workspaceInfo,
      updateWorkspaceInfo,
      
      sendMessage,
      addReaction,
      addReply,
      typingUser,
      scheduledMessages,

      addTask,
      updateTask,
      deleteTask,
      addComment,
      completeSprint,

      addDocument,
      deleteDocument,

      addMeeting,
      updateMeeting,

      addNewUser,
      updateUserRole,
      toggleUserStatus,

      markNotificationRead,
      clearAllNotifications,

      aiConversations,
      sendAIMessage,
      clearAIConversation,
      isAISpending
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
