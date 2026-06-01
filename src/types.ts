export type WorkspaceRole = 'Owner' | 'Admin' | 'Manager' | 'Member' | 'Guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: WorkspaceRole;
  status: 'online' | 'offline' | 'away' | 'busy';
  productivityScore: number;
  workloadPoints: number;
  completedTasksCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  logo: string;
  ownerId: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // List of user names
}

export interface Message {
  id: string;
  channelId?: string; // If set, it's a channel message
  isDM: boolean;
  recipientId?: string; // If DM, who it goes to
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  reactions: Reaction[];
  replies: ThreadMessage[];
  readBy: string[]; // List of user IDs
  scheduledFor?: string; // ISO string if scheduled
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Testing' | 'Done';

export interface Comment {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface TaskDependency {
  taskId: string;
  title: string;
  type: 'blocks' | 'blocked-by';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  storyPoints: number;
  comments: Comment[];
  dependencies: TaskDependency[];
  sprintId?: string;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'completed' | 'future';
  startDate: string;
  endDate: string;
  storyPointsGoal: number;
  completedPoints: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  notes: string;
  transcript?: string;
  summary?: string;
  actionItems?: string[];
  deadlines?: string[];
  risks?: string[];
  recordingUrl?: string;
}

export interface Notification {
  id: string;
  type: 'Task Assigned' | 'Mentioned' | 'Meeting Reminder' | 'New Message' | 'AI Alert' | 'Project Update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string; // View target
}

export interface Document {
  id: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
  tags: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
