"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const firebase_1 = require("../config/firebase");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header missing or invalid',
            });
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            return res.status(401).json({
                success: false,
                message: 'ID token missing',
            });
        }
        const decodedToken = await (0, firebase_1.verifyIdToken)(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            role: decodedToken.role || 'USER',
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'ID token expired',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token',
        });
    }
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.js.map