import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { Task, TaskPriority, TaskStatus } from '../types';
import { 
  Plus, MessageSquare, AlertCircle, AlertOctagon, 
  HelpCircle, CheckCircle2, Trash2, X 
} from 'lucide-react';

export const ProjectView: React.FC = () => {
  const { tasks, users, addTask, updateTask, deleteTask, addComment, currentUser } = useWorkspace();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(users[0]?.id || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('To Do');
  const [newStoryPoints, setNewStoryPoints] = useState(3);
  
  // Add Comment input state
  const [commentInput, setCommentInput] = useState('');

  const columns: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Done'];

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      updateTask({ ...task, status });
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...task, status });
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addTask({
        title: newTitle,
        description: newDesc,
        assigneeId: newAssignee,
        priority: newPriority,
        status: newStatus,
        storyPoints: newStoryPoints,
        comments: [],
        dependencies: []
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewStoryPoints(3);
    }
  };

  const handleAddComment = () => {
    if (commentInput.trim() && selectedTask) {
      addComment(selectedTask.id, commentInput);
      setCommentInput('');
      // Refresh selected task reference to show updated comment list
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask({
          ...updated,
          comments: [
            ...updated.comments,
            {
              id: `c-temp-${Date.now()}`,
              senderName: currentUser.name,
              senderAvatar: currentUser.avatar,
              text: commentInput,
              timestamp: new Date().toISOString()
            }
          ]
        });
      }
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return <AlertOctagon size={14} style={{ color: 'var(--accent-red)' }} />;
      case 'High': return <AlertCircle size={14} style={{ color: 'var(--accent-yellow)' }} />;
      case 'Medium': return <HelpCircle size={14} style={{ color: 'var(--accent-blue)' }} />;
      case 'Low': return <CheckCircle2 size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }} className="animate-slide-in">
      
      {/* Kanban Board Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Organize user stories, track blockers, and manage development pipelines.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ gap: '6px' }}
        >
          <Plus size={16} />
          <span>Create Task</span>
        </button>
      </div>

      {/* Board Columns Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        overflowX: 'auto',
        alignItems: 'start',
        flex: 1
      }}>
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          const colPoints = colTasks.reduce((sum, t) => sum + t.storyPoints, 0);
          return (
            <div 
              key={col} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              className="glass-card"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.25)',
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px'
              }}
            >
              {/* Column Title Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '8px'
              }}>
                <h3 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{col}</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                    {colTasks.length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                    {colPoints} SP
                  </span>
                </div>
              </div>

              {/* Column Card Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {colTasks.map(t => {
                  const assignee = users.find(u => u.id === t.assigneeId);
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => setSelectedTask(t)}
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'grab',
                        transition: 'var(--transition-fast)'
                      }}
                      className="btn-ghost"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {getPriorityIcon(t.priority)}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.id}</span>
                      </div>
                      <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, lineHeight: 1.4, marginBottom: '12px' }}>
                        {t.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Assignee Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img 
                            src={assignee?.avatar} 
                            alt="" 
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                            title={assignee?.name}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {assignee?.name.split(' ')[0]}
                          </span>
                        </div>
                        {/* Story Points & Comments count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                          {t.comments.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}>
                              <MessageSquare size={12} />
                              {t.comments.length}
                            </span>
                          )}
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: 'var(--accent-blue)', 
                            backgroundColor: 'rgba(59, 130, 246, 0.08)', 
                            padding: '2px 6px', 
                            borderRadius: '4px' 
                          }}>
                            {t.storyPoints}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* A. Create Task Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{
            width: '480px',
            padding: '28px',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Create New Kanban Task</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Task Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Build Socket integration logs"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="input-field" 
                  rows={3}
                  placeholder="Structure endpoints..."
                  style={{ resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Assignee</label>
                  <select 
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Priority</label>
                  <select 
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="input-field"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Initial Status</label>
                  <select 
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as TaskStatus)}
                    className="input-field"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Story Points (Estimation)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={13} 
                    value={newStoryPoints}
                    onChange={e => setNewStoryPoints(parseInt(e.target.value) || 1)}
                    className="input-field"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Task Detail Drawer Overlay */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '450px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-light)',
          zIndex: 1100,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column'
        }} className="animate-slide-in">
          {/* Drawer Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15,23,42,0.15)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{selectedTask.id}</span>
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '4px' }}>Task Details</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                className="btn btn-ghost" 
                style={{ padding: '6px', color: 'var(--accent-red)' }}
                title="Delete Ticket"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn btn-ghost" 
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Drawer Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Task Title</h4>
              <input 
                type="text" 
                value={selectedTask.title} 
                onChange={e => {
                  const updated = { ...selectedTask, title: e.target.value };
                  setSelectedTask(updated);
                  updateTask(updated);
                }}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', color: '#fff', fontSize: '0.95rem', fontWeight: 600, width: '100%', outline: 'none', paddingBottom: '4px' }}
              />
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h4>
              <textarea 
                value={selectedTask.description} 
                onChange={e => {
                  const updated = { ...selectedTask, description: e.target.value };
                  setSelectedTask(updated);
                  updateTask(updated);
                }}
                rows={3}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.85rem', width: '100%', outline: 'none', padding: '8px', resize: 'none', lineHeight: 1.4 }}
              />
            </div>

            {/* Core parameters dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Status</h4>
                <select 
                  value={selectedTask.status} 
                  onChange={e => {
                    const updated = { ...selectedTask, status: e.target.value as TaskStatus };
                    setSelectedTask(updated);
                    updateTask(updated);
                  }}
                  className="input-field"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Priority</h4>
                <select 
                  value={selectedTask.priority} 
                  onChange={e => {
                    const updated = { ...selectedTask, priority: e.target.value as TaskPriority };
                    setSelectedTask(updated);
                    updateTask(updated);
                  }}
                  className="input-field"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Assignee</h4>
                <select 
                  value={selectedTask.assigneeId} 
                  onChange={e => {
                    const updated = { ...selectedTask, assigneeId: e.target.value };
                    setSelectedTask(updated);
                    updateTask(updated);
                  }}
                  className="input-field"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Story Points</h4>
                <input 
                  type="number" 
                  min={1} 
                  value={selectedTask.storyPoints} 
                  onChange={e => {
                    const updated = { ...selectedTask, storyPoints: parseInt(e.target.value) || 1 };
                    setSelectedTask(updated);
                    updateTask(updated);
                  }}
                  className="input-field"
                />
              </div>
            </div>

            {/* Task dependencies logic */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Dependencies</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedTask.dependencies.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No dependencies mapped.</span>
                ) : (
                  selectedTask.dependencies.map(d => (
                    <div 
                      key={d.taskId}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        color: 'var(--accent-red)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{d.type.toUpperCase()}: {d.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Attachments Section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Task Attachments</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>nexus-hub-wireframes.pdf</span>
                  <span style={{ color: 'var(--text-muted)' }}>4.2 MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Simulated file upload complete! mock-screenshot.png uploaded successfully.")}
                className="btn btn-secondary"
                style={{ fontSize: '0.7rem', padding: '6px 12px', gap: '4px', width: '100%' }}
              >
                <Plus size={12} />
                <span>Upload PDF / DOCX / TXT / Image</span>
              </button>
            </div>

            {/* Comments Lists */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Comments</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {selectedTask.comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '8px' }}>
                    <img src={c.senderAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{c.senderName}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                  placeholder="Post comments to ticket..."
                  className="input-field"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                />
                <button 
                  onClick={handleAddComment}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  Post
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
