import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Users, CheckSquare, Sparkles, TrendingUp, 
  AlertTriangle, Calendar, ArrowRight 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export const DashboardView: React.FC = () => {
  const { tasks, users, meetings, sprints, setActiveView } = useWorkspace();

  const activeSprint = sprints.find(s => s.status === 'active');
  const sprintTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
  const completedTasks = tasks.filter(t => t.status === 'Done');
  const activeUsers = users.filter(u => u.status !== 'offline');

  // Compute analytics metrics
  const donePoints = sprintTasks
    .filter(t => t.status === 'Done')
    .reduce((sum, t) => sum + t.storyPoints, 0);
  
  const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const sprintProgressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Chart Data: Productivity Trend (Mock data matching calendar dates)
  const productivityTrendData = [
    { day: 'Mon', completionRate: 65, velocity: 24 },
    { day: 'Tue', completionRate: 70, velocity: 28 },
    { day: 'Wed', completionRate: 78, velocity: 30 },
    { day: 'Thu', completionRate: 74, velocity: 26 },
    { day: 'Fri', completionRate: 85, velocity: 34 },
    { day: 'Sat', completionRate: 87, velocity: 35 },
    { day: 'Sun', completionRate: 87, velocity: 38 },
  ];

  // Chart Data: Tasks by assignee (Dynamic compiled from real workspace states)
  const memberWorkloadData = users.map(u => {
    const userTasks = tasks.filter(t => t.assigneeId === u.id);
    const completed = userTasks.filter(t => t.status === 'Done').length;
    const remaining = userTasks.filter(t => t.status !== 'Done').length;
    return {
      name: u.name.split(' ')[0],
      Completed: completed,
      Pending: remaining,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-slide-in">
      
      {/* 6 Core Summary Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Active Workspace Members */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Workspace Members</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{users.length} Members</h3>
            <p style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>{activeUsers.length} active now</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-blue)' }}>
            <Users size={20} />
          </div>
        </div>

        {/* Total Workspace Tasks */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Active Projects & Tasks</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{tasks.length} Tasks</h3>
            <p style={{ color: 'var(--accent-purple)', fontSize: '0.7rem' }}>{completedTasks.length} shipped successfully</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.08)', color: 'var(--accent-purple)' }}>
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Messages Today */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Messages Today</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>142 Messages</h3>
            <p style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>+18% spike vs yesterday</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Tasks Overdue */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Tasks Overdue</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0', color: 'var(--accent-red)' }}>3 Overdue</h3>
            <p style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>Backend block in pipeline</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-red)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Sprint Launch Progress */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Sprint Completion</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{sprintProgressPercent}%</h3>
            <p style={{ color: 'var(--accent-yellow)', fontSize: '0.7rem' }}>{donePoints} of {totalPoints} story points</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', color: 'var(--accent-yellow)' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        {/* AI Sprint Probability */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>AI Success Index</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0', color: 'var(--text-glow)' }}>87% Prob.</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>NexusHub Predictive Engine</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--text-glow)' }}>
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* 2 Central Content Columns: AI Insights Box & Upcoming Schedules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* AI Actionable Insights Box */}
        <div className="glass-glow-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>NexusAI Smart Workspace Diagnostics</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-red)', marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>2 Critical Overdue Tasks Blocks</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  "Build Live Socket.io Core Sync Engine" is overdue by 2 days. Backend team is currently blocked by Docker container pipeline configuration setups.
                </p>
                <button 
                  onClick={() => setActiveView('Projects')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-red)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  className="btn-ghost"
                >
                  <span>Reassign Task assignee</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'rgba(234, 179, 8, 0.05)',
              border: '1px solid rgba(234, 179, 8, 0.15)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Sparkles size={18} style={{ color: 'var(--accent-yellow)', marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Agile Workload Resource Flags</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  *Amit Verma* has exceeded active velocity limits, handling **24 active story points** in Sprint 24. Burnout index has flagged alert state.
                </p>
                <button 
                  onClick={() => setActiveView('Analytics')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-yellow)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  className="btn-ghost"
                >
                  <span>Examine Team Analytics</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Meetings Calendar Panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', width: '100%', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Upcoming Alignments</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {meetings.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '16px 0' }}>No scheduled meet syncs.</p>
            ) : (
              meetings.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveView('Meetings')}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  className="btn-ghost"
                >
                  <h4 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{m.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{m.date}</span>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{m.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, margin: 0 }}>Executive Performance Metrics</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {/* Task Completion Rate */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Completion Rate</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>94.2%</span>
              <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem', fontWeight: 600 }}>+4.1%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '94.2%', height: '100%', backgroundColor: 'var(--accent-green)' }} />
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Resolution Time</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>18.4 Hours</span>
              <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem', fontWeight: 600 }}>-2.3h</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--accent-blue)' }} />
            </div>
          </div>

          {/* Velocity Score */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sprint Velocity Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>92 / 100</span>
              <span style={{ color: 'var(--accent-yellow)', fontSize: '0.7rem', fontWeight: 600 }}>Optimal</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-yellow)' }} />
            </div>
          </div>

          {/* Team Productivity */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Productivity Rating</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Highly Stable</span>
              <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem', fontWeight: 600 }}>96%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: '96%', height: '100%', backgroundColor: 'var(--accent-purple)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs Grids */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Productivity curve area graph */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 600 }}>Team Velocity Trend (Daily)</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }} 
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="velocity" stroke="var(--accent-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorVelocity)" name="Velocity Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Task Distribution Stacked Bar Graph */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 600 }}>Workload Task Distribution</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }}
                />
                <Legend iconType="circle" fontSize={11} />
                <Bar dataKey="Completed" stackId="a" fill="var(--accent-green)" name="Completed" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Pending" stackId="a" fill="var(--accent-blue)" name="Active Tasks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Activity Heatmap */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, margin: 0 }}>Team Activity Heatmap Calendar</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Visualizing collective channel communications, task updates, and document uploads over the last 5 weeks.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px', border: '1px solid var(--border-light)' }} />
            <span style={{ width: '10px', height: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', backgroundColor: 'rgba(59, 130, 246, 0.5)', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-blue)', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--text-glow)', borderRadius: '2px' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {/* Day of week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '4px 0', height: '110px' }}>
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Render 7 rows (days) and 35 columns (weeks) */}
            {Array.from({ length: 7 }).map((_, rowIndex) => {
              // Row represents weekday
              return (
                <div key={rowIndex} style={{ display: 'flex', gap: '6px' }}>
                  {Array.from({ length: 35 }).map((_, colIndex) => {
                    // Seeded random-like color based on indices to create a beautiful consistent layout
                    const activitySeed = (rowIndex * 3 + colIndex * 7) % 5;
                    let bgColor = 'rgba(255,255,255,0.02)';
                    let border = '1px solid var(--border-light)';
                    if (activitySeed === 1) {
                      bgColor = 'rgba(59, 130, 246, 0.2)';
                      border = 'none';
                    } else if (activitySeed === 2) {
                      bgColor = 'rgba(59, 130, 246, 0.5)';
                      border = 'none';
                    } else if (activitySeed === 3) {
                      bgColor = 'var(--accent-blue)';
                      border = 'none';
                    } else if (activitySeed === 4) {
                      bgColor = 'var(--text-glow)';
                      border = 'none';
                    }

                    return (
                      <div
                        key={colIndex}
                        title={`Week ${colIndex + 1}, Day ${rowIndex + 1}: ${activitySeed * 4 + rowIndex} contributions`}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '2.5px',
                          backgroundColor: bgColor,
                          border: border,
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        className="btn-ghost"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
