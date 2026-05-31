const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');
const User = require('../models/User');

// @desc    Create a new Workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Please provide a workspace name' });
  }

  try {
    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Owner' }],
    });

    // Create a default '#general' channel automatically
    await Channel.create({
      workspaceId: workspace._id,
      channelName: 'general',
      description: 'Default announcement and general discussion feed',
      members: [req.user._id],
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's workspaces
// @route   GET /api/workspaces
// @access  Private
exports.getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'name email avatar');

    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite/Add user to a workspace (Step 2 RBAC)
// @route   POST /api/workspaces/invite
// @access  Private (Owner, Admin, Manager)
exports.inviteUser = async (req, res) => {
  const { email, role } = req.body;
  const workspaceId = req.workspace._id;

  if (!email) {
    return res.status(400).json({ success: false, message: 'User email is required' });
  }

  try {
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    // Check if user is already a member
    const alreadyMember = req.workspace.members.find(
      (m) => m.user.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
    }

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $push: {
          members: { user: userToInvite._id, role: role || 'Member' },
        },
      },
      { new: true }
    ).populate('members.user', 'name email avatar');

    // Add user to all public channels in workspace automatically
    const publicChannels = await Channel.find({ workspaceId, isPrivate: false });
    for (const channel of publicChannels) {
      await Channel.findByIdAndUpdate(channel._id, {
        $addToSet: { members: userToInvite._id },
      });
    }

    res.json({ success: true, data: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from a workspace
// @route   DELETE /api/workspaces/remove
// @access  Private (Owner, Admin)
exports.removeUser = async (req, res) => {
  const { userId } = req.body;
  const workspaceId = req.workspace._id;

  try {
    const memberToRemove = req.workspace.members.find(
      (m) => m.user.toString() === userId
    );

    if (!memberToRemove) {
      return res.status(404).json({ success: false, message: 'User is not a member of this workspace' });
    }

    // Cannot remove the owner
    if (memberToRemove.role === 'Owner' || req.workspace.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Workspace Owner cannot be removed' });
    }

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $pull: { members: { user: userId } },
      },
      { new: true }
    );

    // Pull from all workspace channels
    await Channel.updateMany(
      { workspaceId },
      { $pull: { members: userId } }
    );

    res.json({ success: true, data: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Channel inside Workspace
// @route   POST /api/channels
// @access  Private (Owner, Admin, Manager)
exports.createChannel = async (req, res) => {
  const { channelName, description, isPrivate } = req.body;
  const workspaceId = req.workspace._id;

  if (!channelName) {
    return res.status(400).json({ success: false, message: 'Channel name is required' });
  }

  try {
    // Check if channel already exists in this workspace
    const exists = await Channel.findOne({ workspaceId, channelName: channelName.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Channel already exists in this workspace' });
    }

    const newChannel = await Channel.create({
      workspaceId,
      channelName: channelName.toLowerCase(),
      description: description || '',
      isPrivate: isPrivate || false,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, data: newChannel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Channels for current Workspace
// @route   GET /api/channels
// @access  Private (All Workspace Members)
exports.getWorkspaceChannels = async (req, res) => {
  const workspaceId = req.workspace._id;

  try {
    // Fetch channels in this workspace where user is a member or channel is public
    const channels = await Channel.find({
      workspaceId,
      $or: [
        { isPrivate: false },
        { members: req.user._id }
      ]
    });

    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get members list in workspace
// @route   GET /api/workspaces/members
// @access  Private (All Workspace Members)
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.workspace._id).populate('members.user', 'name email avatar status isOnline lastSeen');
    res.json({ success: true, data: workspace.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
