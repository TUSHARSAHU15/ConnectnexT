const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    channelName: {
      type: String,
      required: [true, 'Please add a channel name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure channel name unique per workspace
channelSchema.index({ workspaceId: 1, channelName: 1 }, { unique: true });

module.exports = mongoose.model('Channel', channelSchema);
