import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Hash, Send, Clock, CornerUpLeft, 
  MessageSquare, User, ChevronRight, X 
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    channels, users, messages, activeChatId, setActiveChatId, 
    chatIsDM, setChatIsDM, sendMessage, addReaction, addReply, 
    typingUser, currentUser, scheduledMessages 
  } = useWorkspace();

  const [inputText, setInputText] = useState('');
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [threadText, setThreadText] = useState('');
  
  // Autocomplete Mentions Menu State
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  
  // Scheduled Message Popover State
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().substring(0, 10);
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const threadBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser, activeChatId]);

  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessageId, messages]);

  // Compute active conversation details
  const activeChannel = !chatIsDM ? channels.find(c => c.id === activeChatId) : null;
  const activeDMUser = chatIsDM ? users.find(u => u.id === activeChatId) : null;

  const currentChatMessages = messages.filter(m => {
    if (m.scheduledFor && new Date(m.scheduledFor) > new Date()) return false; // Hide scheduled
    if (chatIsDM) {
      return m.isDM && (
        (m.senderId === currentUser.id && m.recipientId === activeChatId) ||
        (m.senderId === activeChatId && m.recipientId === currentUser.id)
      );
    } else {
      return !m.isDM && m.channelId === activeChatId;
    }
  });

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Autocomplete Mention Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const atIdx = val.lastIndexOf('@');
    if (atIdx > -1 && atIdx === val.length - 1) {
      setShowMentionMenu(true);
      setMentionFilter('');
    } else if (atIdx > -1 && showMentionMenu) {
      const query = val.substring(atIdx + 1);
      if (query.includes(' ') || val.endsWith(' ')) {
        setShowMentionMenu(false);
      } else {
        setMentionFilter(query.toLowerCase());
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const selectMention = (userName: string) => {
    const atIdx = inputText.lastIndexOf('@');
    if (atIdx > -1) {
      const mainText = inputText.substring(0, atIdx);
      setInputText(`${mainText}@${userName} `);
    }
    setShowMentionMenu(false);
  };

  // Scheduled Message Submission
  const handleScheduleSubmit = () => {
    if (!inputText.trim()) return;
    const scheduleISOStr = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    sendMessage(inputText, scheduleISOStr);
    setInputText('');
    setShowScheduler(false);
  };

  const selectedThreadMessage = messages.find(m => m.id === threadMessageId);

  const handleThreadReplySend = () => {
    if (!threadText.trim() || !threadMessageId) return;
    addReply(threadMessageId, threadText);
    setThreadText('');
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 140px)',
      margin: '-32px',
      backgroundColor: 'var(--bg-primary)'
    }} className="animate-slide-in">
      
      {/* 1. Left Navigation panel inside Chat (List Channels/Members) */}
      <div style={{
        width: '240px',
        borderRight: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto'
      }}>
        {/* Channels Section */}
        <div>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Channels
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {channels.map(ch => {
              const isActive = !chatIsDM && activeChatId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => { setChatIsDM(false); setActiveChatId(ch.id); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-glow)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    textAlign: 'left',
                    transition: 'var(--transition-fast)'
                  }}
                  className="btn-ghost"
                >
                  <Hash size={14} style={{ color: isActive ? 'var(--accent-blue)' : 'inherit' }} />
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Direct Messages
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {users.filter(u => u.id !== currentUser.id).map(u => {
              const isActive = chatIsDM && activeChatId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => { setChatIsDM(true); setActiveChatId(u.id); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-glow)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    textAlign: 'left',
                    transition: 'var(--transition-fast)'
                  }}
                  className="btn-ghost"
                >
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: u.status === 'online' ? 'var(--accent-green)' : u.status === 'busy' ? 'var(--accent-red)' : u.status === 'away' ? 'var(--accent-yellow)' : '#94a3b8',
                      border: '1.5px solid var(--bg-secondary)'
                    }} />
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheduled Messages Section */}
        {scheduledMessages.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 700, paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Scheduled Queue ({scheduledMessages.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scheduledMessages.map(m => (
                <div key={m.id} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '4px', fontSize: '0.75rem' }}>
                  <p style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.text}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>
                    Send: {m.scheduledFor ? new Date(m.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Conversations Board Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}>
        {/* Chat Section Header */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(15, 23, 42, 0.2)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {chatIsDM ? (
                <User size={16} style={{ color: 'var(--accent-blue)' }} />
              ) : (
                <Hash size={16} style={{ color: 'var(--accent-blue)' }} />
              )}
              <h3 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
                {chatIsDM ? activeDMUser?.name : activeChannel?.name}
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {chatIsDM ? `Direct messaging with ${activeDMUser?.name}` : activeChannel?.description}
            </p>
          </div>
        </div>

        {/* Message Logs Scroller */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {currentChatMessages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              No messages here yet. Initiate the conversation.
            </div>
          ) : (
            currentChatMessages.map(m => (
              <div 
                key={m.id} 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  position: 'relative',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)'
                }}
                className="message-item-container"
              >
                <img 
                  src={m.senderAvatar} 
                  alt={m.senderName} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{m.senderName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                    {m.text}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Seen by {m.readBy && m.readBy.length > 0 ? users.filter(u => m.readBy.includes(u.id)).map(u => u.name.split(' ')[0]).join(', ') : 'Tushar'}
                  </span>

                  {/* Reaction Badges */}
                  {m.reactions.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {m.reactions.map(r => {
                        const hasReacted = r.users.includes(currentUser.name);
                        return (
                          <button
                            key={r.emoji}
                            onClick={() => addReaction(m.id, r.emoji)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              backgroundColor: hasReacted ? 'var(--bg-glow)' : 'rgba(255,255,255,0.03)',
                              border: hasReacted ? '1px solid var(--border-glow)' : '1px solid var(--border-light)',
                              borderRadius: '4px',
                              color: hasReacted ? '#fff' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Thread Summary Badge */}
                  {m.replies.length > 0 && (
                    <button
                      onClick={() => setThreadMessageId(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      className="btn-ghost"
                    >
                      <MessageSquare size={12} />
                      <span>{m.replies.length} {m.replies.length === 1 ? 'reply' : 'replies'}</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {/* Floating Action Menu on Message Hover */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  zIndex: 5
                }} className="message-hover-actions">
                  {/* Reaction buttons shortcuts */}
                  {['👍', '❤️', '🚀', '🎉'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => addReaction(m.id, emoji)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '0.9rem' }}
                      className="btn-ghost"
                    >
                      {emoji}
                    </button>
                  ))}
                  <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />
                  <button 
                    onClick={() => setThreadMessageId(m.id)}
                    title="Reply in Thread"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                    className="btn-ghost"
                  >
                    <CornerUpLeft size={14} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator Display */}
          {typingUser && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingLeft: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {typingUser} is typing...
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <span className="pulse-glow-dot" style={{ width: '5px', height: '5px' }} />
                <span className="pulse-glow-dot" style={{ width: '5px', height: '5px', animationDelay: '0.2s' }} />
                <span className="pulse-glow-dot" style={{ width: '5px', height: '5px', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Section */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'rgba(15, 23, 42, 0.1)',
          position: 'relative'
        }}>
          {/* floating mention autocomplete lookup popup */}
          {showMentionMenu && (
            <div style={{
              position: 'absolute',
              bottom: '75px',
              left: '24px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              width: '180px',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {users
                .filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(mentionFilter))
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => selectMention(u.name)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    className="btn-ghost"
                  >
                    <img src={u.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                    <span>{u.name}</span>
                  </button>
                ))}
            </div>
          )}

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
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${chatIsDM ? '@' + activeDMUser?.name : '#' + activeChannel?.name} (Type @ for team autocomplete)`}
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

            {/* Actions utilities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Message Scheduler Clock Button */}
              <button 
                onClick={() => setShowScheduler(!showScheduler)}
                title="Schedule Message"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: scheduledMessages.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }}
                className="btn-ghost"
              >
                <Clock size={16} />
              </button>

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

          {/* Scheduler Popover Modal */}
          {showScheduler && (
            <div style={{
              position: 'absolute',
              bottom: '75px',
              right: '24px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
              width: '240px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>Schedule Message</h4>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Date</label>
                <input 
                  type="date" 
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.75rem', padding: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Time</label>
                <input 
                  type="time" 
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.75rem', padding: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button 
                  onClick={() => setShowScheduler(false)}
                  className="btn btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleSubmit}
                  className="btn btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Thread Replies Sidebar panel on the right */}
      {threadMessageId && selectedThreadMessage && (
        <div style={{
          width: '320px',
          borderLeft: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {/* Thread Header */}
          <div style={{
            height: '64px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>Conversation Thread</h4>
            <button 
              onClick={() => setThreadMessageId(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              className="btn-ghost"
            >
              <X size={16} />
            </button>
          </div>

          {/* Original Anchor Message */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <img src={selectedThreadMessage.senderAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{selectedThreadMessage.senderName}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {new Date(selectedThreadMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4 }}>
                  {selectedThreadMessage.text}
                </p>
              </div>
            </div>
          </div>

          {/* Thread Replies List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedThreadMessage.replies.map(reply => (
              <div key={reply.id} style={{ display: 'flex', gap: '10px' }}>
                <img src={reply.senderAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{reply.senderName}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4 }}>
                    {reply.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={threadBottomRef} />
          </div>

          {/* Thread Replies Input Box */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              gap: '8px'
            }}>
              <input 
                type="text" 
                value={threadText}
                onChange={e => setThreadText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleThreadReplySend(); }}
                placeholder="Reply..."
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleThreadReplySend}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex' }}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dynamic injection of message hover style configurations */}
      <style>{`
        .message-hover-actions { display: none; }
        .message-item-container:hover { background-color: rgba(255, 255, 255, 0.015); }
        .message-item-container:hover .message-hover-actions { display: flex; }
      `}</style>
    </div>
  );
};
