import { Response } from 'express';
import { AuthenticatedRequest } from './auth';

// Check if user is admin
export async function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: Function
) {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

export default adminMiddleware;

