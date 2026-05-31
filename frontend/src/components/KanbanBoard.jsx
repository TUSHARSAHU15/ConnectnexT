import React, { useState } from 'react';
import { Plus, Trash2, Calendar, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function KanbanBoard({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onAiGenerateTasks,
  workspaceMembers
}) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Column definitions
  const columns = [
    { id: 'Todo', title: 'To Do', color: 'bg-zinc-800/40 text-zinc-400' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' },
    { id: 'Review', title: 'Review', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/10' },
    { id: 'Done', title: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' },
  ];

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, { status });
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle,
      description: taskDesc,
      assigneeId: taskAssignee || undefined,
      dueDate: taskDueDate || undefined,
      status: 'Todo'
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssignee('');
    setTaskDueDate('');
    setShowTaskModal(false);
  };

  const handleTriggerAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      await onAiGenerateTasks(aiPrompt);
      setAiPrompt('');
      setShowAiModal(false);
    } catch (e) {
      console.log('AI task error:', e);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/20 overflow-hidden p-6 text-zinc-200">
      
      {/* Board Controls / Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900/60 mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Kanban Board
          </h2>
          <p className="text-xs text-zinc-500">Manage development sprints and tasks</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Task Generator
          </button>
          
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Draggable Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto overflow-y-hidden pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col h-full bg-zinc-900/35 border border-zinc-900 rounded-2xl p-4 min-w-[250px] overflow-hidden"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-900/50 shrink-0">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold text-zinc-500">{colTasks.length}</span>
              </div>

              {/* Tasks List Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-center p-4">
                    <p className="text-[10px] text-zinc-600">Drag tasks here</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/85 hover:border-zinc-700/85 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg shadow-black/20 group relative overflow-hidden"
                    >
                      {/* Left highlight strip */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 ${col.id === 'In Progress' ? 'bg-indigo-500' : col.id === 'Review' ? 'bg-amber-500' : col.id === 'Done' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-xs font-bold text-white leading-relaxed truncate">{task.title}</h4>
                        <button
                          onClick={() => onDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity shrink-0"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 mb-3.5">
                        {task.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-zinc-500 border-t border-zinc-900/50 pt-2.5">
                        {/* Assignee Badge */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">
                            {task.assignee ? task.assignee.name : 'Unassigned'}
                          </span>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 shrink-0 text-amber-500/80">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white">Create Workspace Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement authentication routes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Support passwords hashing with bcryptjs"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {workspaceMembers.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Launch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Task Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
              <h3 className="text-sm font-bold text-white">AI Kanban Task Generator</h3>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Describe your current development requirements or copy-paste recent chat transcripts. Our OpenAI parser will automatically divide them into separate Kanban task items and populate your sprint board.
            </p>
            <form onSubmit={handleTriggerAiGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">AI Prompts / Chat logs</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. We need to build the login view and connect database connections. Also deploy the API to Render next week."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={aiGenerating}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate Tasks
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
