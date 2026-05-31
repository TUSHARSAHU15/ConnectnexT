const Workspace = require('../models/Workspace');

// Middleware to check if logged in user has an allowed role in the scoped workspace
const checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    const workspaceId =
      req.headers['x-workspace-id'] ||
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Workspace ID is required for access control' });
    }

    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      // Owner override
      if (workspace.owner.toString() === req.user._id.toString()) {
        req.workspace = workspace;
        req.userWorkspaceRole = 'Owner';
        return next();
      }

      // Check member role
      const memberInfo = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!memberInfo) {
        return res.status(403).json({ success: false, message: 'Not a member of this workspace' });
      }

      const userRole = memberInfo.role;
      req.workspace = workspace;
      req.userWorkspaceRole = userRole;

      // Assert permission
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Required workspace role not met. Allowed roles: ${allowedRoles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({ success: false, message: 'RBAC role validation failed' });
    }
  };
};

module.exports = checkRole;
