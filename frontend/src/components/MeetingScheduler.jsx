import React, { useState } from 'react';
import { Plus, Video, Calendar, Clock, Users, X } from 'lucide-react';

export default function MeetingScheduler({
  meetings,
  onAddMeeting,
  workspaceMembers
}) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  const handleAttendeeToggle = (userId) => {
    if (selectedAttendees.includes(userId)) {
      setSelectedAttendees(selectedAttendees.filter(id => id !== userId));
    } else {
      setSelectedAttendees([...selectedAttendees, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime) return;
    onAddMeeting({
      title,
      startTime,
      durationMinutes: parseInt(duration, 10),
      attendeeIds: selectedAttendees
    });
    setTitle('');
    setStartTime('');
    setDuration(60);
    setSelectedAttendees([]);
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/20 p-6 overflow-hidden text-zinc-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900/60 mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Meeting Scheduler</h2>
          <p className="text-xs text-zinc-500">Plan and manage workspace calls and calendar syncs</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex items-center gap-2 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Meeting
        </button>
      </div>

      {/* Meetings Grid / List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-center p-8 max-w-md mx-auto mt-12">
            <Video className="w-8 h-8 text-zinc-700 mb-2 animate-pulse-slow" />
            <p className="text-xs font-semibold text-zinc-400">No scheduled meetings</p>
            <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed">Schedule a video conference sync with other team members in this workspace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="p-5 rounded-2xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-white leading-relaxed">{meeting.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600/10 text-indigo-400 border border-indigo-500/10">
                      Sync
                    </span>
                  </div>

                  <div className="space-y-1.5 text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{new Date(meeting.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>
                        {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendees list avatars */}
                <div className="flex items-center justify-between border-t border-zinc-900/50 pt-4 mt-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {meeting.attendees.slice(0, 4).map((att) => (
                      <div
                        key={att._id}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 overflow-hidden bg-zinc-800"
                        title={att.name}
                      >
                        {att.avatar ? (
                          <img src={att.avatar} alt={att.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[9px] bg-zinc-700 text-white">
                            {att.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                    {meeting.attendees.length > 4 && (
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 bg-zinc-850 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                        +{meeting.attendees.length - 4}
                      </div>
                    )}
                  </div>

                  <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Join Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white">Schedule Team Meeting</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Standup Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              {/* Multi-Attendee Checklist */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Invite Attendees</label>
                <div className="max-h-28 overflow-y-auto border border-zinc-850 rounded-xl divide-y divide-zinc-850 bg-zinc-900/10">
                  {workspaceMembers.map((m) => (
                    <div
                      key={m.user._id}
                      onClick={() => handleAttendeeToggle(m.user._id)}
                      className="flex items-center justify-between p-2.5 hover:bg-zinc-900/50 cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold">{m.user.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedAttendees.includes(m.user._id)}
                        readOnly
                        className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Confirm Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
