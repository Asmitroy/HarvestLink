/**
 * auth.js — JWT authentication middleware
 * Verifies Bearer token from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'kisanconnect-dev-secret-change-in-prod';
export const JWT_EXPIRY = '24h';

/**
 * authenticateToken
 * Middleware that protects routes by requiring a valid JWT.
 * Usage: router.get('/protected', authenticateToken, handler)
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

/**
 * requireRole
 * Higher-order middleware that restricts access to specific roles.
 * Usage: router.post('/listings', authenticateToken, requireRole('farmer'), handler)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`
      });
    }
    next();
  };
}
