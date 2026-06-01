import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { analyzeMeetingTranscript } from '../services/aiService';
import { 
  Video, Calendar, Clock, Users, Plus, Sparkles, 
  Mic, MicOff, VideoOff, PhoneOff, AlertTriangle, Play, HelpCircle,
  Monitor, Radio, FileText 
} from 'lucide-react';
import type { Meeting } from '../types';

export const MeetingsView: React.FC = () => {
  const { meetings, addMeeting, updateMeeting, currentUser } = useWorkspace();
  const [selectedMeetId, setSelectedMeetId] = useState<string>(meetings[0]?.id || '');
  
  // Lobby sandbox states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showLobbyNotes, setShowLobbyNotes] = useState(false);
  const [lobbyNotesText, setLobbyNotesText] = useState('Sync Minutes:\n- Discussed Sprint 24 blocker.\n- Next release Wednesday.');
  
  // Analysis states
  const [transcriptInput, setTranscriptInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Create Meeting Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-06-02');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newDuration, setNewDuration] = useState('30 mins');
  const [newNotes, setNewNotes] = useState('');

  const activeMeet = meetings.find(m => m.id === selectedMeetId) || meetings[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addMeeting(newTitle, newDate, newTime, newDuration, newNotes);
      setShowCreateModal(false);
      setNewTitle('');
      setNewNotes('');
    }
  };

  const handleAnalyze = async () => {
    if (!transcriptInput.trim() || !activeMeet) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeMeetingTranscript(transcriptInput);
      const updated: Meeting = {
        ...activeMeet,
        transcript: transcriptInput,
        summary: results.summary,
        actionItems: results.actionItems,
        deadlines: results.deadlines,
        risks: results.risks
      };
      updateMeeting(updated);
      setTranscriptInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleTranscript = () => {
    setTranscriptInput(
      `Tushar Sahu: Hey everyone, welcome to our daily technical sync. Let's run through updates.\n` +
      `Amit Verma: I'm currently working on the Docker container pipelines. I've encountered some caching issues with multi-stage builds, which is slowing down our backend deployment logs. I'll need about a day to debug.\n` +
      `Priya Patel: On the frontend design side, the Notion workspace and meetings module UI is fully complete. We are currently integrating the markdown parser and testing typing indicator animations in chat.\n` +
      `Tushar Sahu: Excellent work. Once Amit resolves the pipeline blocker, we will pull all services into testing. Let's aim to wrap up Sprint 24 by this Wednesday. Action items: Amit to fix Docker configurations, Priya to complete markdown edge-cases, and Rahul to check test server metrics.`
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', margin: '-32px' }} className="animate-slide-in">
      {/* Sidebar - Scheduled Meet Lists */}
      <div style={{ width: '280px', borderRight: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn btn-primary"
          style={{ width: '100%', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Schedule Alignment</span>
        </button>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Scheduled Alignments</h4>
          {meetings.map(m => {
            const isActive = activeMeet?.id === m.id;
            return (
              <div 
                key={m.id}
                onClick={() => setSelectedMeetId(m.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--bg-glow)' : 'transparent',
                  border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                className="btn-ghost"
              >
                <h5 style={{ fontSize: '0.8rem', color: isActive ? '#fff' : 'var(--text-muted)', fontWeight: isActive ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.title}
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={10} />
                    {m.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isActive ? 'var(--accent-purple)' : 'inherit', fontWeight: isActive ? 600 : 400 }}>
                    <Clock size={10} />
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Board Pane */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        {activeMeet ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', padding: '32px', height: '100%', alignItems: 'start' }}>
            
            {/* Left Column: Webcam Sandbox & Agenda Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Sandbox Video Lobby */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span>Interactive Video Meeting Lobby Sandbox</span>
                </h3>

                {/* Simulated Webcam / Screen Share Frame */}
                <div style={{
                  height: '240px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {isRecording && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.85)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 10,
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                    }}>
                      <span className="pulse-glow-dot" style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%' }} />
                      <span style={{ letterSpacing: '0.05em' }}>• REC</span>
                    </div>
                  )}

                  {inCall ? (
                    /* Active call screen grid */
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      width: '100%',
                      height: '100%',
                      padding: '12px',
                      boxSizing: 'border-box'
                    }}>
                      {/* Grid Item 1: You */}
                      <div style={{
                        position: 'relative',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        {isVideoOff ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                            <Users size={20} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Camera Off</span>
                          </div>
                        ) : isSharingScreen ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(139, 92, 246, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px dashed var(--accent-purple)',
                            boxSizing: 'border-box'
                          }}>
                            <Monitor size={24} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontSize: '0.6rem', color: '#fff', marginTop: '4px' }}>Sharing...</span>
                          </div>
                        ) : (
                          <img 
                            src={currentUser.avatar} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} 
                          />
                        )}
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '2px' }}>
                          You {isMuted ? '🔇' : '🎙️'}
                        </span>
                      </div>

                      {/* Grid Item 2: Rahul */}
                      <div style={{
                        position: 'relative',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                        />
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '2px' }}>
                          Rahul Sharma 🎙️
                        </span>
                      </div>

                      {/* Grid Item 3: Priya */}
                      <div style={{
                        position: 'relative',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                        />
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '2px' }}>
                          Priya Patel 🎙️
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Regular lobby camera preview */
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      {isVideoOff ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid var(--border-light)' }}>
                            <Users size={32} style={{ color: 'var(--text-muted)', margin: 'auto' }} />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>Your Camera is Off</p>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          {isSharingScreen ? (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px dashed var(--accent-purple)',
                              boxSizing: 'border-box'
                            }}>
                              <Monitor size={48} style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
                              <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Sharing Screen Canvas...</p>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Other participants see your active application frame</p>
                            </div>
                          ) : (
                            <img 
                              src={currentUser.avatar} 
                              alt="Your Webcam" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.1)' }} 
                            />
                          )}
                          {/* Audio visual waves sandbox animation indicator */}
                          <div style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', gap: '2px', height: '10px', alignItems: 'center' }}>
                              <span className={isMuted ? '' : 'pulse-glow-dot'} style={{ width: '3px', height: isMuted ? '2px' : '8px', animationDuration: '0.6s' }} />
                              <span className={isMuted ? '' : 'pulse-glow-dot'} style={{ width: '3px', height: isMuted ? '2px' : '10px', animationDuration: '0.4s', animationDelay: '0.1s' }} />
                              <span className={isMuted ? '' : 'pulse-glow-dot'} style={{ width: '3px', height: isMuted ? '2px' : '6px', animationDuration: '0.5s', animationDelay: '0.2s' }} />
                            </div>
                            <span style={{ fontWeight: 600 }}>{currentUser.name} (You)</span>
                          </div>
                        </div>
                      )}

                      {/* lobby participants overlays */}
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        zIndex: 5
                      }}>
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          Rahul (Online)
                        </span>
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          Priya (Online)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control bar */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isMuted ? 'var(--accent-red)' : '#fff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)} 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isVideoOff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isVideoOff ? 'var(--accent-red)' : '#fff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
                    <span>{isVideoOff ? 'Camera On' : 'Camera Off'}</span>
                  </button>

                  <button 
                    onClick={() => setIsSharingScreen(!isSharingScreen)} 
                    disabled={isVideoOff}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: isVideoOff ? 'not-allowed' : 'pointer',
                      backgroundColor: isSharingScreen ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isSharingScreen ? 'var(--accent-purple)' : '#fff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isVideoOff ? 0.5 : 1
                    }}
                  >
                    <Monitor size={14} />
                    <span>{isSharingScreen ? 'Stop Share' : 'Share Screen'}</span>
                  </button>

                  <button 
                    onClick={() => setIsRecording(!isRecording)} 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isRecording ? 'var(--accent-red)' : '#fff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Radio size={14} />
                    <span>{isRecording ? 'Stop Rec' : 'Record'}</span>
                  </button>

                  <button 
                    onClick={() => setShowLobbyNotes(!showLobbyNotes)} 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: showLobbyNotes ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: showLobbyNotes ? 'var(--accent-blue)' : '#fff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={14} />
                    <span>Minutes</span>
                  </button>

                  <button 
                    onClick={() => setInCall(!inCall)} 
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: inCall ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: inCall ? 'var(--accent-red)' : 'var(--accent-green)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600
                    }}
                  >
                    <PhoneOff size={14} />
                    <span>{inCall ? 'End Session' : 'Enter Call'}</span>
                  </button>
                </div>

                {/* Collapsible live call minutes sandbox notes */}
                {showLobbyNotes && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sync Notes & Live Minutes</label>
                    <textarea 
                      value={lobbyNotesText}
                      onChange={e => setLobbyNotesText(e.target.value)}
                      className="input-field"
                      rows={3}
                      style={{ fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>

              {/* Agenda details */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>Meeting Agenda</span>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginTop: '8px' }}>{activeMeet.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                    {activeMeet.notes}
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />

                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Invited Attendees</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {activeMeet.attendees.map(name => (
                      <span key={name} style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '4px 10px', borderRadius: '4px', color: '#fff' }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analyzer & Generated Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* live transcript analyzer input */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
                  <span>NexusAI Alignment Transcript Analyzer</span>
                </h3>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Paste standard meeting transcript dialogue to analyze sprints, identify risks, schedule action items, and flag blockers.
                </p>

                <textarea 
                  value={transcriptInput}
                  onChange={e => setTranscriptInput(e.target.value)}
                  placeholder="Paste sync details here..."
                  className="input-field"
                  rows={4}
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  <button 
                    onClick={loadSampleTranscript}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px', gap: '4px' }}
                  >
                    <Play size={12} />
                    <span>Load Sample Transcript</span>
                  </button>

                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !transcriptInput.trim()}
                    className="btn btn-primary animate-pulse"
                    style={{ fontSize: '0.75rem', padding: '6px 12px', gap: '4px', cursor: transcriptInput.trim() ? 'pointer' : 'not-allowed', opacity: transcriptInput.trim() ? 1 : 0.6 }}
                  >
                    <Sparkles size={12} />
                    <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
                  </button>
                </div>
              </div>

              {/* rendered analyzer insights */}
              {activeMeet.summary ? (
                <div className="glass-glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>AI Executive Summary</h4>
                    <p style={{ fontSize: '0.8rem', color: '#fff', lineHeight: 1.5 }}>
                      {activeMeet.summary}
                    </p>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />

                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Action Items Assign</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeMeet.actionItems?.map((act, i) => (
                        <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '4px', height: '4px', backgroundColor: 'var(--accent-blue)', borderRadius: '50%' }} />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeMeet.deadlines && activeMeet.deadlines.length > 0 && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-yellow)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Timeline Targets</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {activeMeet.deadlines.map((dl, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ display: 'inline-block', width: '4px', height: '4px', backgroundColor: 'var(--accent-yellow)', borderRadius: '50%' }} />
                              <span>{dl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeMeet.risks && activeMeet.risks.length > 0 && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Alert Risks</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeMeet.risks.map((risk, i) => (
                            <div key={i} style={{ 
                              padding: '8px 12px', 
                              backgroundColor: 'rgba(239, 68, 68, 0.04)', 
                              border: '1px solid rgba(239, 68, 68, 0.15)', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              color: 'var(--accent-red)',
                              display: 'flex',
                              alignItems: 'start',
                              gap: '8px'
                            }}>
                              <AlertTriangle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              ) : (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                  <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No AI Analysis insights loaded. Paste transcript dialouge above to compile.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Video size={48} style={{ color: 'var(--border-glow)', marginBottom: '16px' }} />
            <h3>No Scheduled Meeting Selected</h3>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Select an alignment meeting from the sidebar.</p>
          </div>
        )}
      </div>

      {/* D. Schedule Alignment Modal */}
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
            width: '450px',
            padding: '28px',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Schedule Tech Alignment</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Meeting Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Sprint 24 Review Session"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Start Time</label>
                  <input 
                    type="text" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="input-field" 
                    placeholder="e.g. 11:30 AM"
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Duration</label>
                <input 
                  type="text" 
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. 45 mins"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Discussion Agenda</label>
                <textarea 
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="input-field" 
                  rows={3}
                  placeholder="Outline key targets..."
                  style={{ resize: 'none' }}
                />
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
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
