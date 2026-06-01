import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { UserCheck, ShieldOff, AlertOctagon, UserPlus, Users, MessageSquare, Database, Activity } from 'lucide-react';
import type { WorkspaceRole } from '../types';

export const AdminPanelView: React.FC = () => {
  const { users, currentUser, updateUserRole, toggleUserStatus, addNewUser, workspaceInfo } = useWorkspace();

  // Invite Modal Inside Admin Panel
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('Member');
  const [inviteName, setInviteName] = useState('');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteName) {
      addNewUser(inviteName, inviteEmail, inviteRole);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'var(--accent-green)';
      case 'busy': return 'var(--accent-red)';
      case 'away': return 'var(--accent-yellow)';
      default: return '#94a3b8';
    }
  };

  // Restrict admin controls visually to Owner or Admin role
  const hasAdminPrivilege = currentUser.role === 'Owner' || currentUser.role === 'Admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-slide-in">
      
      {/* Admin Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure permissions, manage user lifecycle states, and review workspace allocations.</p>
        </div>
        
        {hasAdminPrivilege && (
          <button 
            onClick={() => setShowInviteModal(true)} 
            className="btn btn-primary"
            style={{ gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {!hasAdminPrivilege && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '4px',
          color: 'var(--accent-red)',
          fontSize: '0.8rem'
        }}>
          <AlertOctagon size={16} />
          <span>You are viewing in read-only mode. Workspace administrative privileges are restricted to Owners and Admins.</span>
        </div>
      )}

      {/* Workspace Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Active Users */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Active Users</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>{users.filter(u => u.status !== 'offline').length} / {users.length}</h3>
            <p style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>80% concurrency indicator</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-blue)' }}>
            <Users size={20} />
          </div>
        </div>

        {/* Messages Sent */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Messages Sent</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>14,280</h3>
            <p style={{ color: 'var(--accent-purple)', fontSize: '0.7rem' }}>+12% spike this week</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.08)', color: 'var(--accent-purple)' }}>
            <MessageSquare size={20} />
          </div>
        </div>

        {/* Storage Usage */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Storage Allocated</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>4.2 GB / 10 GB</h3>
            <p style={{ color: 'var(--accent-yellow)', fontSize: '0.7rem' }}>42% capacity reached</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', color: 'var(--accent-yellow)' }}>
            <Database size={20} />
          </div>
        </div>

        {/* API Load */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>API Load Metrics</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 2px 0' }}>98.6% Uptime</h3>
            <p style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>14ms mean latency response</p>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)' }}>
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Workspace Member Life Cycle Table */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team Member</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Workspace Role</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Activity score</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Workload points</th>
              {hasAdminPrivilege && (
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, textAlign: 'right' }}>Security Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isSelf = u.id === currentUser.id;
              const isSuspended = u.role === 'Guest' && u.status === 'offline';
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-fast)' }} className="btn-ghost">
                  {/* Name / Avatar / Status */}
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={u.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(u.status),
                        border: '1.5px solid var(--bg-tertiary)'
                      }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                        {u.name} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginLeft: '4px' }}>(You)</span>}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: {u.status}</p>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</td>

                  {/* Role Dropdown */}
                  <td style={{ padding: '16px' }}>
                    {hasAdminPrivilege && !isSelf ? (
                      <select 
                        value={u.role}
                        onChange={e => updateUserRole(u.id, e.target.value as WorkspaceRole)}
                        className="input-field"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-tertiary)', width: 'auto' }}
                      >
                        <option value="Owner">Owner</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Member">Member</option>
                        <option value="Guest">Guest</option>
                      </select>
                    ) : (
                      <span className={`badge ${u.role === 'Owner' || u.role === 'Admin' ? 'badge-critical' : 'badge-low'}`} style={{ fontSize: '0.65rem' }}>
                        {u.role}
                      </span>
                    )}
                  </td>

                  {/* Productivity score */}
                  <td style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    {u.productivityScore}%
                  </td>

                  {/* Workload Points */}
                  <td style={{ padding: '16px', fontSize: '0.8rem', color: u.workloadPoints >= 20 ? 'var(--accent-red)' : '#fff', fontWeight: 600 }}>
                    {u.workloadPoints} SP
                  </td>

                  {/* Actions */}
                  {hasAdminPrivilege && (
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {!isSelf && (
                        <button
                          onClick={() => toggleUserStatus(u.id, !isSuspended)}
                          className="btn btn-secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            gap: '4px',
                            color: isSuspended ? 'var(--accent-green)' : 'var(--accent-red)',
                            backgroundColor: isSuspended ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderColor: isSuspended ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                          }}
                        >
                          {isSuspended ? <UserCheck size={12} /> : <ShieldOff size={12} />}
                          <span>{isSuspended ? 'Activate User' : 'Suspend User'}</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* E. Invite Modal */}
      {showInviteModal && (
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
            width: '420px',
            padding: '28px',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Invite New Team Member</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Add a new member to the {workspaceInfo.name} workspace dashboard. They will immediately gain channel access.
            </p>
            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="input-field" 
                  placeholder="johndoe@company.com"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Permission Role</label>
                <select 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as WorkspaceRole)}
                  className="input-field"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Manage projects)</option>
                  <option value="Member">Member (Regular access)</option>
                  <option value="Guest">Guest (Guest / Suspended)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
