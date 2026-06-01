import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Search, BookOpen, Plus, Trash2, Calendar, User, FileText, Sparkles } from 'lucide-react';
import { searchKnowledgeBase } from '../services/aiService';


export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useWorkspace();
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const aiSearchResults = searchKnowledgeBase(aiSearchQuery, documents);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('');

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Get all unique tags from documents
  const allTags = Array.from(new Set(documents.flatMap(d => d.tags)));

  // Filtered list of documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? d.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      const tags = newTagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
      addDocument(newTitle, newContent, tags);
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTagsStr('');
    }
  };

  // Basic custom markdown parser for previewing documents
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} style={{ fontSize: '1.6rem', color: '#fff', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', margin: '24px 0 16px 0', fontWeight: 800 }}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} style={{ fontSize: '1.25rem', color: '#fff', margin: '20px 0 12px 0', fontWeight: 700 }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: '6px 0 6px 16px', lineHeight: 1.6 }}>{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return <pre key={idx} style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-glow)', margin: '14px 0', overflowX: 'auto' }}>{line.replace(/`/g, '')}</pre>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      return <p key={idx} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: '8px 0' }}>{line}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', margin: '-32px' }} className="animate-slide-in">
      {/* sidebar listing panel */}
      <div style={{ width: '280px', borderRight: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* search & invite trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary"
            style={{ width: '100%', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Create Document</span>
          </button>

          {/* AI Semantic Wiki Search Portal */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', gap: '8px', boxShadow: 'var(--shadow-glow)' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-blue)' }} />
            <input 
              type="text" 
              placeholder="Ask NexusAI (e.g. deployment)..." 
              value={aiSearchQuery}
              onChange={e => setAiSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '100%' }}
            />
          </div>

          {/* AI Search Matches Dropdown list */}
          {aiSearchQuery.trim() && (
            <div className="glass-card" style={{ maxHeight: '150px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 700 }}>AI MATCHES:</span>
              {aiSearchResults.length === 0 ? (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No semantic matches found.</span>
              ) : (
                aiSearchResults.map(res => (
                  <div 
                    key={res.doc.id}
                    onClick={() => { setSelectedDocId(res.doc.id); setAiSearchQuery(''); }}
                    style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                    className="btn-ghost"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '130px' }}>{res.doc.title}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 700 }}>{res.matchScore} pts</span>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.snippet}</p>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', gap: '8px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search wiki..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {/* tags filter */}
        <div>
          <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Filter Tags</h4>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setSelectedTag(null)}
              style={{
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedTag === null ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
                color: selectedTag === null ? '#fff' : 'var(--text-muted)'
              }}
            >
              All
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: tag === selectedTag ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
                  color: tag === selectedTag ? '#fff' : 'var(--text-muted)'
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }} />

        {/* document logs scroller */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredDocs.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No wiki docs found.</p>
          ) : (
            filteredDocs.map(d => {
              const isActive = activeDoc?.id === d.id;
              return (
                <div 
                  key={d.id}
                  onClick={() => setSelectedDocId(d.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-glow)' : 'transparent',
                    border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  className="btn-ghost"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: isActive ? '#fff' : 'var(--text-muted)', fontWeight: isActive ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '180px' }}>
                      {d.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', overflow: 'hidden' }}>
                    {d.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1px 4px', borderRadius: '2px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mock File Dropper Sandbox */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <div 
            onClick={() => alert("Simulated drag and drop complete! onboarding-checklist.docx uploaded successfully.")}
            style={{
              border: '1.5px dashed var(--border-glow)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(59, 130, 246, 0.01)',
              transition: 'var(--transition-fast)'
            }}
            className="btn-ghost"
          >
            <Plus size={18} style={{ color: 'var(--accent-blue)', margin: '0 auto 8px auto', display: 'block' }} />
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, display: 'block' }}>Drag & Drop Files</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>PDF, DOCX, TXT or Markdown</span>
          </div>
        </div>
      </div>

      {/* right main content viewing details */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        {activeDoc ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* toolbar */}
            <div style={{ height: '64px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={12} />
                  <span>By {activeDoc.updatedBy}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} />
                  <span>{new Date(activeDoc.updatedAt).toLocaleDateString()}</span>
                </span>
              </div>
              <button 
                onClick={() => { deleteDocument(activeDoc.id); }}
                className="btn btn-ghost"
                style={{ color: 'var(--accent-red)', padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                title="Delete Wiki Page"
              >
                <Trash2 size={14} />
                <span>Delete Page</span>
              </button>
            </div>

            {/* markdown canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              {/* rendered tags */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {activeDoc.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', backgroundColor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    #{t}
                  </span>
                ))}
              </div>

              <div>{renderMarkdown(activeDoc.content)}</div>
            </div>

          </div>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ color: 'var(--border-glow)', marginBottom: '16px' }} />
            <h3>No Document Selected</h3>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Select or create a document to get started.</p>
          </div>
        )}
      </div>

      {/* C. Create Wiki Document Modal */}
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
            width: '600px',
            padding: '28px',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Create Notion Wiki Page</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Document Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Production Deployment Roadmap"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Content (Markdown syntax: # H1, ## H2, - lists)</label>
                <textarea 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="input-field" 
                  rows={8}
                  placeholder="# Core Process Guidelines..."
                  style={{ resize: 'vertical', minHeight: '150px' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={newTagsStr}
                  onChange={e => setNewTagsStr(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Onboarding, TechStack, Guidelines"
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
                  Publish Wiki Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
