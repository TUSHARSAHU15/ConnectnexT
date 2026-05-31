import React, { useState } from 'react';
import { Plus, Compass, Hash } from 'lucide-react';

export default function WorkspaceSidebar({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onCreateWorkspace
}) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateWorkspace(name, desc);
    setName('');
    setDesc('');
    setShowModal(false);
  };

  return (
    <div className="w-16 h-full bg-zinc-900 border-r border-zinc-800/80 flex flex-col items-center py-6 justify-between shrink-0">
      <div className="flex flex-col gap-4 items-center w-full">
        {/* Workspace Hub Icon */}
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Compass className="w-5 h-5" />
        </div>

        <div className="w-8 h-[1px] bg-zinc-800 my-2" />

        {/* Workspaces List Switcher Circles */}
        <div className="flex flex-col gap-3 w-full items-center overflow-y-auto max-h-[60vh] py-1">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?._id === ws._id;
            return (
              <button
                key={ws._id}
                onClick={() => onSelectWorkspace(ws)}
                className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-indigo-600/20 hover:text-indigo-400 hover:rounded-xl rounded-2xl'}`}
                title={ws.name}
              >
                {/* Active Indicator Strip */}
                <span className={`absolute left-0 w-1 bg-indigo-500 rounded-r-md transition-all duration-300 ${isActive ? 'h-5' : 'h-0 group-hover:h-3'}`} />
                <span className="font-bold text-xs capitalize truncate max-w-[28px]">{ws.name.slice(0, 2)}</span>
              </button>
            );
          })}
        </div>

        {/* Create Workspace Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-zinc-700/50 flex items-center justify-center text-zinc-500 hover:rounded-xl transition-all duration-300 mt-2"
          title="Add Workspace"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-200">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Create New Workspace</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Collaboration space for product team"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-indigo-500/10"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
