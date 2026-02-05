/**
 * Restrict access based on user role
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied for role: ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
