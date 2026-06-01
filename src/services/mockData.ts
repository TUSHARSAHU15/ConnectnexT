import type { User, Channel, Message, Task, Sprint, Meeting, Document, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Tushar Sahu',
    email: 'tushar@nexushub.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Owner',
    status: 'online',
    productivityScore: 94,
    workloadPoints: 12,
    completedTasksCount: 28,
  },
  {
    id: 'user-2',
    name: 'Rahul Sharma',
    email: 'rahul@nexushub.app',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Admin',
    status: 'online',
    productivityScore: 88,
    workloadPoints: 15,
    completedTasksCount: 22,
  },
  {
    id: 'user-3',
    name: 'Priya Patel',
    email: 'priya@nexushub.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Manager',
    status: 'busy',
    productivityScore: 91,
    workloadPoints: 8,
    completedTasksCount: 19,
  },
  {
    id: 'user-4',
    name: 'Amit Verma',
    email: 'amit@nexushub.app',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Member',
    status: 'away',
    productivityScore: 76,
    workloadPoints: 24, // High workload (burnout indicator risk)
    completedTasksCount: 31,
  },
  {
    id: 'user-5',
    name: 'Sarah Connor',
    email: 'sarah@nexushub.app',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Member',
    status: 'offline',
    productivityScore: 85,
    workloadPoints: 6,
    completedTasksCount: 14,
  },
];

export const mockChannels: Channel[] = [
  { id: 'ch-1', name: 'general', description: 'Company-wide announcements and work-based discussions', isPrivate: false },
  { id: 'ch-2', name: 'development', description: 'Tech stack chatter, pull request reviews, and deploy logs', isPrivate: false },
  { id: 'ch-3', name: 'design', description: 'UI/UX design updates, Figma links, and creative brainstorming', isPrivate: false },
  { id: 'ch-4', name: 'marketing', description: 'GTM strategies, social media posts, and advertising analytics', isPrivate: false },
  { id: 'ch-5', name: 'announcements', description: 'Important milestones, executive briefs, and office updates', isPrivate: false },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    channelId: 'ch-1',
    isDM: false,
    senderId: 'user-2',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Good morning team! Welcome to the new NexusHub workspace. Let us use this channel for general updates.',
    timestamp: '2026-06-01T08:30:00Z',
    reactions: [
      { emoji: '👍', count: 3, users: ['Tushar Sahu', 'Priya Patel', 'Amit Verma'] },
      { emoji: '🚀', count: 2, users: ['Tushar Sahu', 'Amit Verma'] },
    ],
    replies: [
      {
        id: 'reply-1',
        senderId: 'user-1',
        senderName: 'Tushar Sahu',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        text: 'Super excited to launch this! Outstanding work team.',
        timestamp: '2026-06-01T08:32:00Z',
      },
    ],
    readBy: ['user-1', 'user-3', 'user-4'],
  },
  {
    id: 'msg-2',
    channelId: 'ch-2',
    isDM: false,
    senderId: 'user-4',
    senderName: 'Amit Verma',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Hey guys, I have pushed the initial Docker configurations to the repository. Please review the Dockerfiles.',
    timestamp: '2026-06-01T09:15:00Z',
    reactions: [
      { emoji: '❤️', count: 1, users: ['Priya Patel'] },
    ],
    replies: [],
    readBy: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'msg-3',
    channelId: 'ch-3',
    isDM: false,
    senderId: 'user-3',
    senderName: 'Priya Patel',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Just uploaded the high-fidelity UI designs for our video call dashboard in Figma. Check out the glowing camera views!',
    timestamp: '2026-06-01T09:40:00Z',
    reactions: [
      { emoji: '🎉', count: 2, users: ['Tushar Sahu', 'Rahul Sharma'] },
    ],
    replies: [],
    readBy: ['user-1', 'user-2'],
  },
];

export const mockDMs: Message[] = [
  {
    id: 'dm-1',
    isDM: true,
    recipientId: 'user-1',
    senderId: 'user-2',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Hi Tushar, did you check the sprint completion probabilities in the analytics dashboard? It is showing 87% which looks solid.',
    timestamp: '2026-06-01T10:00:00Z',
    reactions: [],
    replies: [],
    readBy: ['user-1'],
  },
  {
    id: 'dm-2',
    isDM: true,
    recipientId: 'user-2',
    senderId: 'user-1',
    senderName: 'Tushar Sahu',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Yes Rahul! The Recharts are looking incredibly rich. Let us catch up in the daily sync call later to plan the final demo.',
    timestamp: '2026-06-01T10:05:00Z',
    reactions: [
      { emoji: '👍', count: 1, users: ['Rahul Sharma'] },
    ],
    replies: [],
    readBy: ['user-2'],
  },
];

export const mockSprints: Sprint[] = [
  {
    id: 'sp-1',
    name: 'Sprint 24: Core Platform Launch',
    goal: 'Launch the core collaboration components, verify Socket/mock pipelines, configure video call previews, and finalize the dashboard layout.',
    status: 'active',
    startDate: '2026-05-20',
    endDate: '2026-06-03',
    storyPointsGoal: 40,
    completedPoints: 23,
  },
  {
    id: 'sp-2',
    name: 'Sprint 25: AI Integration Enhancements',
    goal: 'Connect the vector indices, implement meeting transcript summarizer, and build automatic task templates.',
    status: 'future',
    startDate: '2026-06-04',
    endDate: '2026-06-18',
    storyPointsGoal: 32,
    completedPoints: 0,
  },
];

export const mockTasks: Task[] = [
  {
    id: 'tsk-1',
    title: 'Initialize Docker Container Pipeline',
    description: 'Set up multi-stage Dockerfiles for frontend/backend, configure standard docker-compose.yml for MongoDB, Redis, and hot reloading.',
    assigneeId: 'user-4',
    priority: 'High',
    status: 'In Progress',
    storyPoints: 5,
    comments: [
      { id: 'c-1', senderName: 'Rahul Sharma', senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', text: 'Amit, make sure to minimize image sizes by utilizing alpine versions.', timestamp: '2026-05-30T11:00:00Z' },
    ],
    dependencies: [],
    sprintId: 'sp-1',
    createdAt: '2026-05-25T09:00:00Z',
  },
  {
    id: 'tsk-2',
    title: 'Build Live Socket.io Core Sync Engine',
    description: 'Structure custom Express middleware to authorize JWT profiles over socket connections, create message/room gateways, and verify typing indicator handlers.',
    assigneeId: 'user-4',
    priority: 'Critical',
    status: 'To Do',
    storyPoints: 8,
    comments: [],
    dependencies: [
      { taskId: 'tsk-1', title: 'Initialize Docker Container Pipeline', type: 'blocked-by' },
    ],
    sprintId: 'sp-1',
    createdAt: '2026-05-25T10:00:00Z',
  },
  {
    id: 'tsk-3',
    title: 'Integrate Notion Document Uploads & Markdown Viewer',
    description: 'Build rich text canvas allowing teams to write markdown wikis directly. Handle document file drops (PDF, DOCX, TXT) and structure parser hooks.',
    assigneeId: 'user-3',
    priority: 'Medium',
    status: 'Testing',
    storyPoints: 3,
    comments: [
      { id: 'c-2', senderName: 'Tushar Sahu', senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', text: 'The Markdown rendering is working cleanly Priya. Let us support code block highlight rules too.', timestamp: '2026-05-31T15:20:00Z' },
    ],
    dependencies: [],
    sprintId: 'sp-1',
    createdAt: '2026-05-26T12:00:00Z',
  },
  {
    id: 'tsk-4',
    title: 'Create Executive Recharts Dashboard Layout',
    description: 'Set up visual summary displaying Total Tasks, Sprint Velocity, active channel charts, and high-contrast team productivity heatmap indices.',
    assigneeId: 'user-1',
    priority: 'High',
    status: 'In Progress',
    storyPoints: 5,
    comments: [],
    dependencies: [],
    sprintId: 'sp-1',
    createdAt: '2026-05-27T08:30:00Z',
  },
  {
    id: 'tsk-5',
    title: 'Implement Multi-Role User Management Portal',
    description: 'Create operational console for Workspace Owners to modify team member list, edit active permission roles, and suspend user profiles.',
    assigneeId: 'user-2',
    priority: 'Low',
    status: 'Done',
    storyPoints: 2,
    comments: [],
    dependencies: [],
    sprintId: 'sp-1',
    createdAt: '2026-05-24T14:00:00Z',
  },
  {
    id: 'tsk-6',
    title: 'Setup JWT Auth & Cookie-Session Strategy',
    description: 'Define secure user login routes utilizing Passport.js strategies, sign authorization JWTs, and secure credentials inside httpOnly cookies.',
    assigneeId: 'user-2',
    priority: 'High',
    status: 'Done',
    storyPoints: 5,
    comments: [],
    dependencies: [],
    sprintId: 'sp-1',
    createdAt: '2026-05-23T09:10:00Z',
  },
  {
    id: 'tsk-7',
    title: 'Configure AWS S3 Bucket Media Storage Router',
    description: 'Integrate Multer storage pipelines upload controllers connecting node backend endpoints directly to private cloud S3 bucket structures.',
    assigneeId: 'user-4',
    priority: 'Medium',
    status: 'Backlog',
    storyPoints: 5,
    comments: [],
    dependencies: [],
    createdAt: '2026-05-28T16:00:00Z',
  },
  {
    id: 'tsk-8',
    title: 'Establish Prometheus Metrics Collector & Grafana Widgets',
    description: 'Expose system statistics route listing CPU usage thresholds, active connection volumes, API latency averages, and bundle dashboard widget templates.',
    assigneeId: 'user-4',
    priority: 'Low',
    status: 'Backlog',
    storyPoints: 6,
    comments: [],
    dependencies: [],
    createdAt: '2026-05-29T10:00:00Z',
  },
];

export const mockMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Daily Technical Sync & Sprint Planning',
    date: '2026-06-01',
    time: '11:45 AM',
    duration: '30 mins',
    attendees: ['Tushar Sahu', 'Rahul Sharma', 'Priya Patel', 'Amit Verma'],
    notes: 'Discuss current blockers regarding Docker container pipelines and review Sprint 24 completion goals.',
    transcript: `Tushar Sahu: Hey everyone, welcome to our daily technical sync. Let's run through updates.
Amit Verma: I'm currently working on the Docker container pipelines. I've encountered some caching issues with multi-stage builds, which is slowing down our backend deployment logs. I'll need about a day to debug.
Rahul Sharma: Got it, Amit. Make sure we check CPU allocations on the test node. If those run hot, we can upgrade to an optimized container cluster.
Priya Patel: On the frontend design side, the Notion workspace and meetings module UI is fully complete. We are currently integrating the markdown parser and testing typing indicator animations in chat.
Tushar Sahu: Excellent work. Once Amit resolves the pipeline blocker, we will pull all services into testing. Let's aim to wrap up Sprint 24 by this Wednesday. Action items: Amit to fix Docker configurations, Priya to complete markdown edge-cases, and Rahul to check test server metrics.`,
    summary: 'The team discussed current Sprint 24 progress. Amit reported container build issues which he expects to resolve within 24 hours. Priya has finished frontends for Notion docs and meeting interfaces. Tushar set Wednesday as the target to finalize Sprint 24.',
    actionItems: [
      'Amit: Debug Docker multi-stage build cache pipelines',
      'Priya: Verify markdown parsing boundary cases in Notion wiki',
      'Rahul: Check CPU and memory configurations on test server',
      'Tushar: Organize core launch sprint review for Wednesday'
    ],
    deadlines: ['2026-06-02 (Docker issues)', '2026-06-03 (Sprint end)'],
    risks: ['Docker builds could delay Wednesday core release', 'Test nodes could experience high load due to CPU limits'],
  },
  {
    id: 'meet-2',
    title: 'NexusAI Search Engine Architecture Review',
    date: '2026-06-02',
    time: '3:00 PM',
    duration: '45 mins',
    attendees: ['Tushar Sahu', 'Rahul Sharma', 'Amit Verma'],
    notes: 'Map out the index retrieval mechanism and review LangChain query formatting strategies.',
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Production Deployment Process',
    content: `# Production Deployment Process

This document outlines the standard release guidelines for shipping NexusHub code into our production environment.

## 1. Automated Pipeline (GitHub Actions)
Every code check-in into the \`main\` branch triggers our CI/CD pipeline:
- **Build Checks**: Verifies TypeScript building and builds Vite optimization bundle.
- **Unit Tests**: Runs the Vitest test packages.
- **Docker Build**: Packages frontend and backend into alpine Docker images.

## 2. Cloud Server Staging Deployment
Images are pushed to our registry and deployed to the staging server:
- URL: \`https://staging.nexushub.app\`
- Verification: QA engineers verify changes against our manual regression checklists.

## 3. Database Migration Procedures
If a release includes schema alterations:
- Always run script tasks in a backward-compatible manner.
- Do not drop columns on primary collections directly.
- Take a DB snapshot via MongoDB Atlas prior to triggering main release.

## 4. Production Rollout
Approved staging builds are deployed to Vercel (frontend) and Render (backend) using rolling updates to ensure zero-downtime operations.
`,
    updatedBy: 'Rahul Sharma',
    updatedAt: '2026-05-28T09:30:00Z',
    tags: ['Deployment', 'DevOps', 'AWS']
  },
  {
    id: 'doc-2',
    title: 'Developer Onboarding Guide',
    content: `# Developer Onboarding Guide

Welcome to the NexusHub development team! Here is how to configure your workstation locally:

## Core Tech Requirements
Make sure you have installed:
- **Node.js**: Version 18.x or 20.x
- **Docker Desktop**: For running database and cache services locally
- **MongoDB**: For persistence

## Local Setup
1. Clone the repository: \`git clone https://github.com/TUSHARSAHU15/ConnectnexT.git\`
2. Install npm packages: \`npm install\`
3. Create local configuration: Copy \`.env.example\` to \`.env\` and add keys.
4. Run background services: \`docker-compose up -d\`
5. Start development server: \`npm run dev\`

The application will be running at \`http://localhost:5173\`.
`,
    updatedBy: 'Tushar Sahu',
    updatedAt: '2026-05-29T10:15:00Z',
    tags: ['Onboarding', 'Documentation']
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'Task Assigned',
    title: 'New Task Assigned',
    message: 'Rahul Sharma assigned you to "Create Executive Recharts Dashboard Layout".',
    timestamp: '2026-06-01T08:45:00Z',
    read: false,
    link: 'Projects'
  },
  {
    id: 'notif-2',
    type: 'Mentioned',
    title: 'Mentioned in #general',
    message: 'Rahul Sharma: "Super excited to launch this! Outstanding work @Tushar Sahu."',
    timestamp: '2026-06-01T08:32:00Z',
    read: true,
    link: 'Chat'
  },
  {
    id: 'notif-3',
    type: 'Meeting Reminder',
    title: 'Upcoming Sync Meeting',
    message: 'Daily Sync starts in 15 minutes. Click to prepare agenda.',
    timestamp: '2026-06-01T11:30:00Z',
    read: false,
    link: 'Meetings'
  },
  {
    id: 'notif-4',
    type: 'AI Alert',
    title: 'Potential Burnout Risk',
    message: 'NexusAI detected Amit Verma has 24 story points active. Workload is Critical.',
    timestamp: '2026-06-01T10:12:00Z',
    read: false,
    link: 'Analytics'
  }
];
