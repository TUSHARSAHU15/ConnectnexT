import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { generateTaskBacklog } from '../services/aiService';
import { Bot, User, Trash2, Send, ArrowRight, PlusCircle } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { 
    aiConversations, sendAIMessage, clearAIConversation, isAISpending, 
    addTask, users 
  } = useWorkspace();
  
  const [inputText, setInputText] = useState('');
  const [backlogTasks, setBacklogTasks] = useState<any[]>([]);
  const [generatingBacklog, setGeneratingBacklog] = useState(false);
  const [backlogSuccess, setBacklogSuccess] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiConversations, isAISpending]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendAIMessage(inputText);
    setInputText('');
  };

  const handleShortcutClick = (text: string) => {
    sendAIMessage(text);
  };

  const handleGenerateBacklog = async (appType: string) => {
    setGeneratingBacklog(true);
    setBacklogSuccess(false);
    try {
      const result = await generateTaskBacklog(appType);
      setBacklogTasks(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingBacklog(false);
    }
  };

  const addBacklogTasksToProject = () => {
    if (backlogTasks.length === 0) return;
    
    // Select first online user as default assignee or currentUser
    const defaultAssignee = users.find(u => u.status === 'online')?.id || users[0].id;
    
    backlogTasks.forEach(t => {
      addTask({
        title: t.title,
        description: t.description,
        assigneeId: defaultAssignee,
        priority: t.priority,
        status: 'Backlog',
        storyPoints: t.storyPoints,
        comments: [],
        dependencies: []
      });
    });

    setBacklogTasks([]);
    setBacklogSuccess(true);
    setTimeout(() => setBacklogSuccess(false), 4000);
  };

  // Custom renderer for chat responses support headers and bullet lists
  const formatMsgText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ fontSize: '0.95rem', color: '#fff', margin: '14px 0 8px 0', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'start', margin: '4px 0 4px 8px' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '4px', backgroundColor: 'var(--accent-blue)', borderRadius: '50%', marginTop: '6px' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{line.replace('- ', '')}</span>
          </div>
        );
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={idx} style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{line.replace(/\*/g, '')}</p>;
      }
      return <p key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5, margin: '6px 0' }}>{line}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', margin: '-32px' }} className="animate-slide-in">
      
      {/* Sidebar - Quick Prompts & AI Task generators */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* Prompts shortcuts */}
        <div>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Diagnose Shortcuts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { text: 'Show overdue tasks', label: 'Overdue task scan' },
              { text: 'Summarize project status', label: 'Project Status brief' }
            ].map(shortcut => (
              <button 
                key={shortcut.text}
                onClick={() => handleShortcutClick(shortcut.text)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-light)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-fast)'
                }}
                className="btn-ghost"
              >
                <span>{shortcut.label}</span>
                <ArrowRight size={12} style={{ color: 'var(--accent-blue)' }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />

        {/* AI Task generator Sandbox sandbox */}
        <div>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>AI Backlog Generator</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
            Generate structured task collections based on application requirements. You can import them directly to the projects backlog.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => handleGenerateBacklog('food delivery')}
              disabled={generatingBacklog}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', width: '100%', padding: '8px 12px' }}
            >
              Food Delivery App
            </button>
            <button 
              onClick={() => handleGenerateBacklog('e-commerce store')}
              disabled={generatingBacklog}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', width: '100%', padding: '8px 12px' }}
            >
              E-Commerce Store
            </button>
          </div>

          {/* Render backlog collection result preview */}
          {generatingBacklog && (
            <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div className="pulse-glow-dot" style={{ margin: '0 auto 10px auto' }} />
              Generating structured templates...
            </div>
          )}

          {backlogSuccess && (
            <div style={{ marginTop: '16px', padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-green)', textAlign: 'center' }}>
              Tasks added to project backlog!
            </div>
          )}

          {backlogTasks.length > 0 && (
            <div className="glass-card" style={{ marginTop: '20px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>{backlogTasks.length} Tickets Generated</span>
              </div>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {backlogTasks.map((t, i) => (
                  <div key={i} style={{ padding: '6px 8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '4px', fontSize: '0.7rem' }}>
                    <h5 style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</h5>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.65rem' }}>Priority: {t.priority} - {t.storyPoints} SP</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={addBacklogTasksToProject}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.75rem', padding: '6px', gap: '6px' }}
              >
                <PlusCircle size={14} />
                <span>Add Tickets to board</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        
        {/* Chat window toolbar */}
        <div style={{ height: '64px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>NexusAI Workspace Co-Pilot</h3>
          </div>
          <button 
            onClick={clearAIConversation}
            className="btn btn-ghost"
            style={{ color: 'var(--text-muted)', padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
          >
            <Trash2 size={14} />
            <span>Clear Dialogue</span>
          </button>
        </div>

        {/* dialogue messages logs scroller */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {aiConversations.map(msg => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                style={{ 
                  display: 'flex', 
                  gap: '14px', 
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isAI ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                  border: isAI ? '1px solid var(--border-light)' : 'none',
                  maxWidth: '85%',
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  flexDirection: isAI ? 'row' : 'row-reverse'
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: isAI ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAI ? 'var(--accent-blue)' : 'var(--text-glow)',
                  flexShrink: 0
                }}>
                  {isAI ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isAI ? 'row' : 'row-reverse' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{isAI ? 'NexusAI Co-Pilot' : 'You'}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ textAlign: isAI ? 'left' : 'right' }}>
                    {isAI ? formatMsgText(msg.text) : <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{msg.text}</p>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* loading typing indicators */}
          {isAISpending && (
            <div style={{ display: 'flex', gap: '14px', padding: '16px', alignSelf: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                <Bot size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NexusAI is scanning active tables...</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span className="pulse-glow-dot" style={{ width: '5px', height: '5px' }} />
                  <span className="pulse-glow-dot" style={{ width: '5px', height: '5px', animationDelay: '0.2s' }} />
                  <span className="pulse-glow-dot" style={{ width: '5px', height: '5px', animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* chat dialog input area */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', backgroundColor: 'rgba(15, 23, 42, 0.1)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            gap: '12px'
          }}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask AI assistant about overdue tasks, summaries or generate sprint backlog..."
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
            <button 
              onClick={handleSend}
              style={{
                background: 'var(--accent-blue)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
