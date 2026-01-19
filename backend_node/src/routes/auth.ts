import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import admin from '../config/firebase';
import User from '../models/User';

const router = Router();

// Register new user (creates Firebase user + MongoDB profile)
// Note: Frontend uses Firebase SDK for registration, then sends ID token here
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().isLength({ min: 3, max: 30 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      // Verify Firebase ID token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization header required with Bearer token',
        });
      }

      const idToken = authHeader.split('Bearer ')[1];

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token',
        });
      }

      const { email, username, firstName, lastName } = req.body;

      // Verify email matches Firebase user
      if (decodedToken.email !== email) {
        return res.status(400).json({
          success: false,
          message: 'Email does not match authenticated user',
        });
      }

      // Check if user profile already exists in MongoDB
      let user = await User.findOne({ uid: decodedToken.uid });

      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User profile already exists',
        });
      }

      // Create user profile in MongoDB
      user = new User({
        uid: decodedToken.uid,
        email,
        username,
        firstName,
        lastName,
        role: 'USER',
        isEmailVerified: decodedToken.email_verified || false,
      });

      await user.save();

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            uid: user.uid,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token: idToken,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message,
      });
    }
  }
);

// Login callback - Sync Firebase user with MongoDB after client-side Firebase auth
// Frontend authenticates with Firebase SDK first, then calls this with the ID token
router.post('/login',
  async (req: Request, res: Response) => {
    try {
      // Verify Firebase ID token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization header required with Bearer token',
        });
      }

      const idToken = authHeader.split('Bearer ')[1];

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token',
        });
      }

      // Find or create user in MongoDB
      let user = await User.findOne({ uid: decodedToken.uid });

      if (!user) {
        // Auto-create user profile on first login
        const nameParts = (decodedToken.name || 'User').split(' ');
        user = new User({
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          username: decodedToken.email?.split('@')[0] || `user_${decodedToken.uid.slice(0, 8)}`,
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          role: 'USER',
          isEmailVerified: decodedToken.email_verified || false,
        });
        await user.save();
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            uid: user.uid,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token: idToken,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }
);

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
});

// Update user profile
router.patch('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const { firstName, lastName, phone, avatar } = req.body;

    const user = await User.findOneAndUpdate(
      { uid: decodedToken.uid },
      { 
        firstName, 
        lastName, 
        phone, 
        avatar,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update Firebase display name if changed
    if (firstName || lastName) {
      try {
        await admin.auth().updateUser(decodedToken.uid, {
          displayName: `${user.firstName} ${user.lastName}`,
        });
      } catch (error) {
        console.error('Failed to update Firebase display name:', error);
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
});

// Logout (client-side Firebase logout, server just confirms)
router.post('/logout', async (req: Request, res: Response) => {
  // Since Firebase handles auth client-side, we just return success
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Google OAuth - Handle Google sign-in/sign-up
router.post('/google', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const { email, displayName, photoURL, uid } = req.body;

    // Validate that the token matches the request body
    if (decodedToken.email !== email || decodedToken.uid !== uid) {
      return res.status(400).json({
        success: false,
        message: 'Token mismatch',
      });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ uid });

    if (!user) {
      // Create new user profile for Google sign-up
      const nameParts = (displayName || email)?.split(' ') || ['User'];
      user = new User({
        uid,
        email,
        username: email?.split('@')[0] || `user_${uid.slice(0, 8)}`,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        avatar: photoURL,
        role: 'USER',
        isEmailVerified: true, // Google accounts are verified
        provider: 'google',
      });
      await user.save();
    } else {
      // Update avatar if provided
      if (photoURL && user.avatar !== photoURL) {
        user.avatar = photoURL;
        await user.save();
      }
    }

    return res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
        },
        token: idToken,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
});

// Make user admin (should be protected in production)
router.post('/make-admin/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    // Update MongoDB
    const user = await User.findOneAndUpdate(
      { uid },
      { role: 'ADMIN' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Set admin claim in Firebase
    try {
      await admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' });
    } catch (error) {
      console.error('Failed to set admin claim:', error);
    }

    return res.json({
      success: true,
      message: 'User is now an admin',
      data: { role: 'ADMIN' },
    });
  } catch (error: any) {
    console.error('Make admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to make user admin',
      error: error.message,
    });
  }
});

export default router;

