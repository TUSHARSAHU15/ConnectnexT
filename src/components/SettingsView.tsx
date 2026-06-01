import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { LogIn, Mail, Sparkles, Layout, Shield, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, workspaceInfo, updateWorkspaceInfo } = useWorkspace();
  
  // Workspace State
  const [workspaceName, setWorkspaceName] = useState(workspaceInfo.name);
  const [workspaceDesc, setWorkspaceDesc] = useState(workspaceInfo.description);
  const [workspaceLogo, setWorkspaceLogo] = useState(workspaceInfo.initials);
  const [showWorkspaceSuccess, setShowWorkspaceSuccess] = useState(false);

  // Auth State Simulator
  const [authMethod, setAuthMethod] = useState<'Google' | 'GitHub' | 'Email'>('Google');
  const [simulatedEmail, setSimulatedEmail] = useState(currentUser.email);
  const [simulatedName, setSimulatedName] = useState(currentUser.name);
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);

  // Theme State
  const [primaryHue, setPrimaryHue] = useState(217); // accent-blue HSL hue

  const handleWorkspaceSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceInfo(workspaceName, workspaceDesc, workspaceLogo);
    setShowWorkspaceSuccess(true);
    setTimeout(() => setShowWorkspaceSuccess(false), 3000);
  };

  const handleAuthSimulate = (method: 'Google' | 'GitHub' | 'Email') => {
    setAuthMethod(method);
    if (method === 'Google') {
      setSimulatedName('Google User Sessions');
      setSimulatedEmail('oauth.google@nexushub.app');
    } else if (method === 'GitHub') {
      setSimulatedName('git-developer-core');
      setSimulatedEmail('oauth.github@nexushub.app');
    } else {
      setSimulatedName(currentUser.name);
      setSimulatedEmail(currentUser.email);
    }
    setShowAuthSuccess(true);
    setTimeout(() => setShowAuthSuccess(false), 3000);
  };

  const handleThemeChange = (hue: number) => {
    setPrimaryHue(hue);
    document.documentElement.style.setProperty('--accent-blue', `hsl(${hue}, 91%, 60%)`);
    document.documentElement.style.setProperty('--border-glow', `rgba(59, 130, 246, 0.25)`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="animate-slide-in">
      
      {/* Left Column: Workspace profile management */}
      <div className="glass-glow-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout size={18} style={{ color: 'var(--accent-blue)' }} />
          <span>Workspace Branding & Configurations</span>
        </h3>

        <form onSubmit={handleWorkspaceSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Workspace Name</label>
            <input 
              type="text" 
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Discussion Description</label>
            <textarea 
              value={workspaceDesc}
              onChange={e => setWorkspaceDesc(e.target.value)}
              className="input-field"
              rows={3}
              style={{ resize: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Brand Initials Logo</label>
            <input 
              type="text" 
              value={workspaceLogo}
              onChange={e => setWorkspaceLogo(e.target.value)}
              className="input-field"
              maxLength={4}
              required
            />
          </div>

          {showWorkspaceSuccess && (
            <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-green)', textAlign: 'center' }}>
              Workspace profiles updated successfully!
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save Workspace Changes
          </button>
        </form>

        {/* Theme customization slider */}
        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '24px', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-yellow)' }} />
            <span>Theme Accent customization</span>
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Drag slider to customize the primary glowing theme color across menus. Current color hue: {primaryHue}°
          </p>
          <input 
            type="range"
            min="0"
            max="360"
            value={primaryHue}
            onChange={e => handleThemeChange(parseInt(e.target.value))}
            style={{ width: '100%', height: '6px', borderRadius: '99px', cursor: 'pointer', background: 'var(--bg-tertiary)' }}
          />
        </div>
      </div>

      {/* Right Column: auth simulator registrations */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: 'var(--accent-purple)' }} />
          <span>Unified Session Authenticator Simulator</span>
        </h3>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          NexusHub supports OAuth 2.0 social setups. Click a registration platform below to mock credentials.
        </p>

        {/* auth simulator buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <button 
            onClick={() => handleAuthSimulate('Google')}
            className={`btn ${authMethod === 'Google' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '10px', gap: '4px' }}
          >
            <LogIn size={12} />
            <span>Google Login</span>
          </button>
          <button 
            onClick={() => handleAuthSimulate('GitHub')}
            className={`btn ${authMethod === 'GitHub' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '10px', gap: '4px' }}
          >
            <RefreshCw size={12} />
            <span>GitHub Auth</span>
          </button>
          <button 
            onClick={() => handleAuthSimulate('Email')}
            className={`btn ${authMethod === 'Email' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '10px', gap: '4px' }}
          >
            <Mail size={12} />
            <span>Email Reg</span>
          </button>
        </div>

        {/* Auth details panel */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginTop: '8px'
        }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulated OAuth State</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={currentUser.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{simulatedName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{simulatedEmail}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <div>
              <span>Platform Role:</span>
              <span style={{ color: '#fff', marginLeft: '4px', fontWeight: 600 }}>{currentUser.role}</span>
            </div>
            <div>
              <span>Integration Status:</span>
              <span style={{ color: 'var(--accent-green)', marginLeft: '4px', fontWeight: 600 }}>Connected</span>
            </div>
          </div>
        </div>

        {showAuthSuccess && (
          <div style={{ padding: '10px', backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-purple)', textAlign: 'center' }}>
            Switched session to {authMethod} credentials!
          </div>
        )}
      </div>

    </div>
  );
};
