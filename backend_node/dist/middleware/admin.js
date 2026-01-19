"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
// Check if user is admin
async function adminMiddleware(req, res, next) {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
}
exports.default = adminMiddleware;
//# sourceMappingURL=admin.js.map