const Task = require('../models/Task');

// @desc    Create a new Kanban Task
// @route   POST /api/kanban/tasks
// @access  Private (Owner, Admin, Manager, Member)
exports.createTask = async (req, res) => {
  const { title, description, assigneeId, status, dueDate } = req.body;
  const workspaceId = req.workspace._id;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  try {
    const task = await Task.create({
      workspaceId,
      title,
      description: description || '',
      assignee: assigneeId || null,
      status: status || 'Todo',
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatar');
    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Tasks in Workspace
// @route   GET /api/kanban/tasks
// @access  Private (All members)
exports.getWorkspaceTasks = async (req, res) => {
  const workspaceId = req.workspace._id;

  try {
    const tasks = await Task.find({ workspaceId }).populate('assignee', 'name email avatar');
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Task Status (for drag and drop actions)
// @route   PUT /api/kanban/tasks/:taskId
// @access  Private (Owner, Admin, Manager, Member)
exports.updateTaskStatus = async (req, res) => {
  const { status, title, description, assigneeId, dueDate } = req.body;

  try {
    let task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.workspaceId.toString() !== req.workspace._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized for this workspace' });
    }

    task.status = status || task.status;
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.assignee = assigneeId !== undefined ? assigneeId : task.assignee;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    await task.save();

    const populated = await Task.findById(task._id).populate('assignee', 'name email avatar');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Task
// @route   DELETE /api/kanban/tasks/:taskId
// @access  Private (Owner, Admin, Manager)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.workspaceId.toString() !== req.workspace._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Task Generator (Step 11 OpenAI AI Task Generator)
// @route   POST /api/kanban/ai-generate
// @access  Private (Owner, Admin, Manager, Member)
exports.aiGenerateTasks = async (req, res) => {
  const { prompt } = req.body;
  const workspaceId = req.workspace._id;

  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Please provide a chat log or a task prompt description' });
  }

  try {
    let generatedTasks = [];

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock') {
      try {
        const { default: OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI scrum manager. Parse the user request containing chat text or prompt descriptions and convert them into standard task actions. Return ONLY a JSON array of task objects. Format: [{"title": "Design secure login dashboard", "description": "Build high-fidelity UI inputs in frontend index.css"}]. Make it strict JSON without markdown formatting.',
            },
            { role: 'user', content: prompt },
          ],
        });

        generatedTasks = JSON.parse(response.choices[0].message.content.trim());
      } catch (err) {
        console.error('OpenAI Task Gen Error, using mock fallbacks:', err.message);
        generatedTasks = getMockTasks();
      }
    } else {
      generatedTasks = getMockTasks();
    }

    // Automatically create these tasks in the database scoped under this workspace
    const savedTasks = [];
    for (const taskItem of generatedTasks) {
      const t = await Task.create({
        workspaceId,
        title: taskItem.title,
        description: taskItem.description || 'AI Generated task action',
        status: 'Todo',
      });
      savedTasks.push(await t.populate('assignee', 'name email avatar'));
    }

    res.json({ success: true, data: savedTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper mock task array
const getMockTasks = () => {
  return [
    {
      title: 'Design Secure Login Dashboard',
      description: 'Scaffold glassmorphic onboarding layouts using Outfit typeface and Tailwind CSS guidelines.',
    },
    {
      title: 'Deploy Express API to Railway Cloud',
      description: 'Hook active environment properties for MongoDB Atlas database endpoints.',
    },
    {
      title: 'Configure Socket.io Redis Adapters',
      description: 'Integrate redis adapters inside backend server and test presence listeners.',
    },
  ];
};
