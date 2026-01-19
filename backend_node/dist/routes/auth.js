"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const firebase_1 = __importDefault(require("../config/firebase"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Register new user (creates Firebase user + MongoDB profile)
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 30 }),
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { email, username, firstName, lastName, password } = req.body;
        // Check if user already exists in MongoDB
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists',
            });
        }
        // Create user in Firebase Auth
        let firebaseUser;
        try {
            firebaseUser = await firebase_1.default.auth().createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
            });
        }
        catch (error) {
            if (error.code === 'auth/email-already-exists') {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered',
                });
            }
            throw error;
        }
        // Create user profile in MongoDB
        const user = new User_1.default({
            uid: firebaseUser.uid,
            email,
            username,
            firstName,
            lastName,
            role: 'USER',
            isEmailVerified: false,
        });
        await user.save();
        // Generate custom token for immediate login
        const customToken = await firebase_1.default.auth().createCustomToken(firebaseUser.uid);
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
                token: customToken,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message,
        });
    }
});
// Login (verify Firebase token and return MongoDB user)
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { email, password } = req.body;
        // Verify Firebase ID token (sent from client after Firebase login)
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
            decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }
        // Check if email matches
        if (decodedToken.email !== email) {
            return res.status(401).json({
                success: false,
                message: 'Email mismatch',
            });
        }
        // Find or create user in MongoDB
        let user = await User_1.default.findOne({ uid: decodedToken.uid });
        if (!user) {
            // Create user profile if doesn't exist
            user = new User_1.default({
                uid: decodedToken.uid,
                email: decodedToken.email || email,
                username: decodedToken.email?.split('@')[0] || `user_${decodedToken.uid.slice(0, 8)}`,
                firstName: decodedToken.name?.split(' ')[0] || 'User',
                lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
});
// Get current user profile
router.get('/me', async (req, res) => {
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
            decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }
        const user = await User_1.default.findOne({ uid: decodedToken.uid });
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
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message,
        });
    }
});
// Update user profile
router.patch('/me', async (req, res) => {
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
            decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }
        const { firstName, lastName, phone, avatar } = req.body;
        const user = await User_1.default.findOneAndUpdate({ uid: decodedToken.uid }, {
            firstName,
            lastName,
            phone,
            avatar,
        }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Update Firebase display name if changed
        if (firstName || lastName) {
            try {
                await firebase_1.default.auth().updateUser(decodedToken.uid, {
                    displayName: `${user.firstName} ${user.lastName}`,
                });
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message,
        });
    }
});
// Logout (client-side Firebase logout, server just confirms)
router.post('/logout', async (req, res) => {
    // Since Firebase handles auth client-side, we just return success
    return res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
// Google OAuth - Handle Google sign-in/sign-up
router.post('/google', async (req, res) => {
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
            decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        }
        catch (error) {
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
        let user = await User_1.default.findOne({ uid });
        if (!user) {
            // Create new user profile for Google sign-up
            const nameParts = (displayName || email)?.split(' ') || ['User'];
            user = new User_1.default({
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
        }
        else {
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
    }
    catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message,
        });
    }
});
// Make user admin (should be protected in production)
router.post('/make-admin/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        // Update MongoDB
        const user = await User_1.default.findOneAndUpdate({ uid }, { role: 'ADMIN' }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Set admin claim in Firebase
        try {
            await firebase_1.default.auth().setCustomUserClaims(uid, { role: 'ADMIN' });
        }
        catch (error) {
            console.error('Failed to set admin claim:', error);
        }
        return res.json({
            success: true,
            message: 'User is now an admin',
            data: { role: 'ADMIN' },
        });
    }
    catch (error) {
        console.error('Make admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to make user admin',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map