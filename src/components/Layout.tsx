import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  LayoutDashboard, MessageSquare, KanbanSquare, CalendarRange, 
  BookOpen, Video, Bot, BarChart3, ShieldAlert, 
  Bell, ChevronDown, LogOut, UserPlus, Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    activeView, setActiveView, notifications, markNotificationRead, 
    clearAllNotifications, currentUser, users, typingUser, workspaceInfo 
  } = useWorkspace();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Manager' | 'Member'>('Member');
  const [inviteName, setInviteName] = useState('');

  const { addNewUser } = useWorkspace();

  const unreadNotifications = notifications.filter(n => !n.read);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Chat', icon: MessageSquare },
    { name: 'Projects', icon: KanbanSquare },
    { name: 'Sprints', icon: CalendarRange },
    { name: 'Documents', icon: BookOpen },
    { name: 'Meetings', icon: Video },
    { name: 'AI Assistant', icon: Bot },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Admin Panel', icon: ShieldAlert },
    { name: 'Settings', icon: Settings },
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteName) {
      addNewUser(inviteName, inviteEmail, inviteRole);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    }
  };

  return (
    <div className="layout-container">
      {/* Sidebar Panel */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Workspace Brand Selector */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {workspaceInfo.initials.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700 }}>{workspaceInfo.name}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace Owner</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveView(item.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: isActive ? 'var(--bg-glow)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition-fast)',
                  borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                  paddingLeft: isActive ? '13px' : '16px'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent-blue)' : 'inherit' }} />
                <span>{item.name}</span>
                {item.name === 'Chat' && typingUser && (
                  <span className="pulse-glow-dot" style={{ marginLeft: 'auto' }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Current Active User Profile Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-light)',
          position: 'relative'
        }}>
          <div 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-fast)'
            }}
            className="btn-ghost"
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={currentUser.avatar} 
                alt="Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                backgroundColor: 'var(--accent-green)',
                borderRadius: '50%',
                border: '2px solid var(--bg-secondary)'
              }} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.role}</p>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Profile Dropdown Dialog */}
          {profileDropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '75px',
              left: '16px',
              right: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 0',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <button 
                onClick={() => { setProfileDropdownOpen(false); setActiveView('Admin Panel'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                className="btn-ghost"
              >
                <span>Workspace Settings</span>
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '6px 0' }} />
              <button 
                onClick={() => setProfileDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-red)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                className="btn-ghost"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Core Container */}
      <main className="main-content">
        {/* Header Bar */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 10
        }}>
          {/* Section Breadcrumbs */}
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }} className="title-gradient">
              {activeView}
            </h1>
          </div>

          {/* Controls Hub */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Active Workspace Directory Avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', marginRight: '4px' }}>
                {users.slice(0, 4).map((u, i) => (
                  <div 
                    key={u.id} 
                    style={{ 
                      marginLeft: i > 0 ? '-10px' : 0, 
                      position: 'relative', 
                      zIndex: 10 - i,
                      cursor: 'help'
                    }}
                    title={`${u.name} (${u.role}) - ${u.status}`}
                  >
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        border: '2px solid var(--bg-primary)',
                        objectFit: 'cover' 
                      }} 
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: u.status === 'online' ? 'var(--accent-green)' : u.status === 'busy' ? 'var(--accent-red)' : u.status === 'away' ? 'var(--accent-yellow)' : '#94a3b8',
                      border: '1.5px solid var(--bg-primary)'
                    }} />
                  </div>
                ))}
                {users.length > 4 && (
                  <div style={{
                    marginLeft: '-10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '2px solid var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    zIndex: 5
                  }}>
                    +{users.length - 4}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowInviteModal(true)}
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              >
                <UserPlus size={14} />
                <span>Invite Team</span>
              </button>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-light)' }} />

            {/* Notifications Center */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: unreadNotifications.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                className="btn-ghost"
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'var(--accent-red)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)'
                  }}>
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '0',
                  width: '320px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Workspace Notifications</h4>
                    {unreadNotifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                        className="btn-ghost"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No notifications in this session.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) setActiveView(n.link);
                            setNotifDropdownOpen(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                            transition: 'var(--transition-fast)'
                          }}
                          className="btn-ghost"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: n.read ? 'var(--text-muted)' : 'var(--accent-blue)'
                            }}>{n.type}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h5 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: n.read ? 400 : 600 }}>{n.title}</h5>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Layout Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative' }}>
          {children}
        </div>
      </main>

      {/* Invite Member Modal Dialog */}
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
                  onChange={e => setInviteRole(e.target.value as any)}
                  className="input-field"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Manage projects)</option>
                  <option value="Member">Member (Regular access)</option>
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
