const Meeting = require('../models/Meeting');

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private (Owner, Admin, Manager, Member)
exports.createMeeting = async (req, res) => {
  const { title, startTime, durationMinutes, attendeeIds } = req.body;
  const workspaceId = req.workspace._id;

  if (!title || !startTime) {
    return res.status(400).json({ success: false, message: 'Meeting title and start time are required' });
  }

  try {
    const start = new Date(startTime);
    const duration = durationMinutes || 60; // default 1 hour
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const meeting = await Meeting.create({
      workspaceId,
      title,
      startTime: start,
      endTime: end,
      attendees: attendeeIds || [req.user._id],
    });

    const populated = await Meeting.findById(meeting._id).populate('attendees', 'name email avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all meetings in workspace
// @route   GET /api/meetings
// @access  Private (All members)
exports.getWorkspaceMeetings = async (req, res) => {
  const workspaceId = req.workspace._id;

  try {
    const meetings = await Meeting.find({ workspaceId })
      .populate('attendees', 'name email avatar')
      .sort({ startTime: 1 });

    res.json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
