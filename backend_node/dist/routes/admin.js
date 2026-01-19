"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const admin_1 = __importDefault(require("../middleware/admin"));
const router = (0, express_1.Router)();
// Get dashboard statistics
router.get('/dashboard', auth_1.authMiddleware, admin_1.default, async (req, res) => {
    try {
        const [totalUsers, totalOrders, pendingOrders, completedOrders, totalRevenue, recentOrders,] = await Promise.all([
            User_1.default.countDocuments(),
            Order_1.default.countDocuments(),
            Order_1.default.countDocuments({ status: 'PENDING' }),
            Order_1.default.countDocuments({ status: 'COMPLETED' }),
            Order_1.default.aggregate([
                { $match: { status: 'COMPLETED' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order_1.default.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);
        const revenue = totalRevenue[0]?.total || 0;
        // Get top products
        const topProducts = await Order_1.default.aggregate([
            { $unwind: '$items' },
            { $group: {
                    _id: '$items.productName',
                    count: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.totalPrice' },
                } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        return res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    totalRevenue: revenue,
                },
                recentOrders: recentOrders.map(order => ({
                    id: order._id.toString(),
                    orderNumber: order.orderNumber,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount,
                    createdAt: order.createdAt,
                })),
                topProducts,
            },
        });
    }
    catch (error) {
        console.error('Get dashboard error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get dashboard',
            error: error.message,
        });
    }
});
// Get all orders (admin)
router.get('/orders', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
    (0, express_validator_1.query)('paymentStatus').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const paymentStatus = req.query.paymentStatus;
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order_1.default.countDocuments(filter),
        ]);
        return res.json({
            success: true,
            data: {
                orders: orders.map(order => ({
                    ...order,
                    id: order._id.toString(),
                    items: order.items.map(item => ({
                        ...item,
                        productId: item.productId?.toString(),
                        denominationId: item.denominationId?.toString(),
                    })),
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error('Get admin orders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get orders',
            error: error.message,
        });
    }
});
// Update order status
router.patch('/orders/:id', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
    (0, express_validator_1.body)('paymentStatus').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    (0, express_validator_1.body)('notes').optional().trim(),
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
        const { status, paymentStatus, notes } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        if (status)
            order.status = status;
        if (paymentStatus)
            order.paymentStatus = paymentStatus;
        if (notes !== undefined)
            order.notes = notes;
        await order.save();
        return res.json({
            success: true,
            message: 'Order updated successfully',
            data: {
                order: {
                    ...order.toObject(),
                    id: order._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Update order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: error.message,
        });
    }
});
// Complete order
router.post('/orders/:id/complete', auth_1.authMiddleware, admin_1.default, [(0, express_validator_1.param)('id').isMongoId()], async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        order.status = 'COMPLETED';
        order.paymentStatus = 'COMPLETED';
        await order.save();
        return res.json({
            success: true,
            message: 'Order completed',
            data: {
                order: {
                    ...order.toObject(),
                    id: order._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Complete order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to complete order',
            error: error.message,
        });
    }
});
// Cancel order
router.post('/orders/:id/cancel', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('reason').optional().trim(),
], async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        order.status = 'CANCELLED';
        order.notes = reason || 'Cancelled by admin';
        await order.save();
        return res.json({
            success: true,
            message: 'Order cancelled',
            data: {
                order: {
                    ...order.toObject(),
                    id: order._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Cancel order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message,
        });
    }
});
// Get all users (admin)
router.get('/users', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User_1.default.countDocuments(),
        ]);
        return res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    ...user,
                    id: user._id.toString(),
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message,
        });
    }
});
// Update user role
router.patch('/users/:id', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('role').isIn(['USER', 'ADMIN']),
], async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.json({
            success: true,
            message: 'User updated',
            data: {
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
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
// Get all products (admin)
router.get('/products', auth_1.authMiddleware, admin_1.default, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product_1.default.find()
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product_1.default.countDocuments(),
        ]);
        return res.json({
            success: true,
            data: {
                products: products.map(product => ({
                    ...product,
                    id: product._id.toString(),
                    categoryId: product.categoryId?._id?.toString() || product.categoryId?.toString(),
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error('Get admin products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map