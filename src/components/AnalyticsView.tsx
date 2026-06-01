import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, BarChart3, Star, Zap, Sparkles, Users } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tasks, users } = useWorkspace();

  // Compute Statistics
  const totalSP = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const completedSP = tasks
    .filter(t => t.status === 'Done')
    .reduce((sum, t) => sum + t.storyPoints, 0);
  
  const avgProductivity = Math.round(
    users.reduce((sum, u) => sum + u.productivityScore, 0) / users.length
  );

  const criticalTasksCount = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Done').length;

  // Chart 1: Burnout Risk / Workload comparison
  const workloadChartData = users.map(u => {
    const userTasks = tasks.filter(t => t.assigneeId === u.id);
    const completedSP = userTasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + t.storyPoints, 0);
    const pendingSP = userTasks.filter(t => t.status !== 'Done').reduce((sum, t) => sum + t.storyPoints, 0);

    return {
      name: u.name.split(' ')[0],
      Completed: completedSP,
      Active: pendingSP,
      isBurnout: pendingSP >= 20
    };
  });

  // Chart 2: Productivity Scores
  const productivityChartData = users.map(u => ({
    name: u.name.split(' ')[0],
    Score: u.productivityScore
  })).sort((a, b) => b.Score - a.Score);

  // Chart 3: Task Status Distribution
  const statuses = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Done'];
  const statusColors = {
    'Backlog': 'var(--text-muted)',
    'To Do': 'var(--accent-blue)',
    'In Progress': 'var(--accent-yellow)',
    'Testing': 'var(--accent-purple)',
    'Done': 'var(--accent-green)'
  };
  
  const statusChartData = statuses.map(status => {
    const count = tasks.filter(t => t.status === status).length;
    return {
      name: status,
      value: count,
      color: statusColors[status as keyof typeof statusColors]
    };
  }).filter(d => d.value > 0);

  // Highlight burnout developers
  const burnoutDevs = workloadChartData.filter(d => d.isBurnout);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-slide-in">
      
      {/* Analytics stats metrics grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Cumulative Story Points</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{completedSP} / {totalSP} SP</h3>
            <p style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>Velocity shipped: {Math.round((completedSP / totalSP)*100)}%</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Active Critical Blockers</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0', color: criticalTasksCount > 0 ? 'var(--accent-red)' : 'var(--text-main)' }}>
              {criticalTasksCount} Blockers
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Requires immediate triage</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-red)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Average Team Efficiency</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{avgProductivity}%</h3>
            <p style={{ color: 'var(--accent-yellow)', fontSize: '0.7rem' }}>Score: NexusAI Rating Stable</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', color: 'var(--accent-yellow)' }}>
            <Star size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Backlog Health Index</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0', color: 'var(--text-glow)' }}>Excellent</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Refined ticket structures</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-blue)' }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Burnout alerts */}
      {burnoutDevs.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'start',
          gap: '16px',
          padding: '16px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <AlertTriangle size={20} style={{ color: 'var(--accent-red)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>Agile Workload Resource Alert: Burnout Risk Detected</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              {burnoutDevs.map(d => `*${d.name}*`).join(', ')} exceeded recommended workload guidelines, carrying **more than 20 active story points** in the current sprint logs. Workload reassignment recommended to avoid pipeline lag.
            </p>
          </div>
        </div>
      )}

      {/* AI Predictive Insights Hub */}
      <div className="glass-glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
          <span>NexusAI™ Executive Predictive Insights Hub</span>
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
          Real-time machine learning prediction indices trained on Git workload distribution, sprint history velocity logs, and team response latency indexes.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '10px'
        }}>
          {/* Card 1: Risk Detection */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)' }}>
              <AlertTriangle size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Detection</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>Medium (34%)</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Docker caching pipeline blockers flagged. 1 active integration task lacking attachments or verification criteria.
            </p>
          </div>

          {/* Card 2: Deadline Prediction */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-yellow)' }}>
              <TrendingUp size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline Drift</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>+1.5 Days Expected</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Sprint completion probability stands at 87%. Projected completion: Wednesday 6:00 PM based on active velocity markers.
            </p>
          </div>

          {/* Card 3: Team Burnout Indicators */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)' }}>
              <Users size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Burnout Warning</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>1 High-Risk Member</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Amit Verma has 22 active story points. Suggested mitigation: reallocate Docker tasks to ensure velocity metrics stay high.
            </p>
          </div>

          {/* Card 4: Velocity Forecasts */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
              <Star size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Velocity Forecast</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>42 SP / Sprint</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Velocity forecast is stable with a 4.2% projected improvement in Sprint 25 due to structured documentation assets.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Workload stacked comparison chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-blue)' }} />
            <span>Developer Workload Allocation (SP)</span>
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }}
                />
                <Legend iconType="circle" fontSize={11} />
                <Bar dataKey="Completed" stackId="a" fill="var(--accent-green)" name="Completed SP" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Active" stackId="a" fill="var(--accent-blue)" name="Active SP" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity ratings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} style={{ color: 'var(--accent-yellow)' }} />
            <span>Member Efficiency Index Scores</span>
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityChartData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }}
                />
                <Bar dataKey="Score" fill="var(--accent-yellow)" name="Efficiency score (%)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status percentages pie chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: 'var(--accent-purple)' }} />
            <span>Tasks Status Breakdown</span>
          </h3>
          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff' }}
                  />
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Pie custom legends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '50%', paddingLeft: '20px' }}>
              {statusChartData.map(entry => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{entry.name}:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{entry.value} {entry.value === 1 ? 'task' : 'tasks'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
