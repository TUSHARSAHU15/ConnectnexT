import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Calendar, Award, CheckCircle, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Task } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const SprintsView: React.FC = () => {
  const { sprints, tasks, completeSprint, users } = useWorkspace();

  const activeSprint = sprints.find(s => s.status === 'active');
  const completedSprints = sprints.filter(s => s.status === 'completed');
  const futureSprints = sprints.filter(s => s.status === 'future');

  const activeTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
  const donePoints = activeTasks
    .filter(t => t.status === 'Done')
    .reduce((sum, t) => sum + t.storyPoints, 0);

  const totalPoints = activeTasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const getTasksByStatus = (status: string): Task[] => {
    return activeTasks.filter(t => t.status === status);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'High':
        return { backgroundColor: 'rgba(234, 179, 8, 0.15)', color: 'var(--accent-yellow)', border: '1px solid rgba(234, 179, 8, 0.2)' };
      case 'Medium':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-slide-in">
      {/* active sprint dashboard */}
      {activeSprint ? (
        <div className="glass-glow-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '100%',
            background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="badge badge-high" style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Active Sprint</span>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', marginTop: '10px', fontWeight: 800 }}>{activeSprint.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px', maxWidth: '600px', lineHeight: 1.5 }}>
                {activeSprint.goal}
              </p>
            </div>
            
            <button 
              onClick={completeSprint}
              className="btn btn-primary"
              style={{ padding: '10px 20px', gap: '8px' }}
            >
              <RefreshCw size={16} />
              <span>Complete Sprint Cycle</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-blue)' }}>
                <Calendar size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Duration Timeline</p>
                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
                  {activeSprint.startDate} to {activeSprint.endDate}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(142, 70, 45, 0.08)', color: 'var(--accent-green)' }}>
                <Award size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Sprint Launch Status</p>
                <p style={{ color: 'var(--accent-green)', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
                  {donePoints} of {activeSprint.storyPointsGoal} SP Completed
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.08)', color: 'var(--accent-yellow)' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Overall Velocity Progress</p>
                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
                  {progressPercent}% Complete
                </p>
              </div>
            </div>
          </div>

          {/* progress bar */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              <span>Sprint Completion Curve</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
                borderRadius: '99px',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: 'var(--accent-yellow)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active sprint cycle at the moment. Activate one below.</p>
        </div>
      )}

      {/* active sprint tasks grouping status */}
      {activeSprint && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Sprint Tasks Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {['To Do', 'In Progress', 'Testing', 'Done'].map(status => {
              const statusTasks = getTasksByStatus(status);
              return (
                <div key={status} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{status}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {statusTasks.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                    {statusTasks.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>No tasks</p>
                    ) : (
                      statusTasks.map(t => {
                        const dev = users.find(u => u.id === t.assigneeId);
                        return (
                          <div key={t.id} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.65rem', ...getPriorityStyle(t.priority), padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{t.priority}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.id}</span>
                            </div>
                            <h5 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, lineHeight: 1.4, marginBottom: '10px' }}>{t.title}</h5>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <img src={dev?.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dev?.name.split(' ')[0]}</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>{t.storyPoints} SP</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* list of other sprints */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        {/* completed sprints */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
            <span>Completed Sprint History</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedSprints.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '16px 0' }}>No completed sprints.</p>
            ) : (
              completedSprints.map(s => (
                <div key={s.id} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{s.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.startDate} to {s.endDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>{s.completedPoints} SP Shipped</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* future sprints */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--accent-purple)' }} />
            <span>Planned Backlog Sprints</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {futureSprints.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '16px 0' }}>No planned future sprints.</p>
            ) : (
              futureSprints.map(s => (
                <div key={s.id} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{s.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Target: {s.startDate} to {s.endDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700 }}>{s.storyPointsGoal} SP Goal</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Burndown Chart Section */}
      {activeSprint && (
        <div className="glass-glow-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
            <span>Active Sprint Burndown Chart (Sprint 24)</span>
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: 'Day 1', Ideal: 40, Actual: 40 },
                { day: 'Day 2', Ideal: 36, Actual: 38 },
                { day: 'Day 3', Ideal: 32, Actual: 35 },
                { day: 'Day 4', Ideal: 28, Actual: 35 },
                { day: 'Day 5', Ideal: 24, Actual: 28 },
                { day: 'Day 6', Ideal: 20, Actual: 24 },
                { day: 'Day 7', Ideal: 16, Actual: 24 },
                { day: 'Day 8', Ideal: 12, Actual: 17 },
                { day: 'Day 9', Ideal: 8, Actual: 17 },
                { day: 'Day 10', Ideal: 4, Actual: null },
                { day: 'Day 11', Ideal: 0, Actual: null }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }} />
                <Legend iconType="circle" fontSize={11} />
                <Line type="monotone" dataKey="Ideal" stroke="rgba(255,255,255,0.25)" strokeDasharray="5 5" strokeWidth={2} name="Ideal Burndown Guideline" />
                <Line type="monotone" dataKey="Actual" stroke="var(--accent-blue)" strokeWidth={3} activeDot={{ r: 6 }} name="Actual Remaining Story Points" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
