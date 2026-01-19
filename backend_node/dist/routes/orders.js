"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Denomination_1 = __importDefault(require("../models/Denomination"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Generate order number
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
}
// Get user orders (authenticated)
router.get('/', auth_1.authMiddleware, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const filter = { userId: req.user?.uid };
        if (status) {
            filter.status = status;
        }
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
        console.error('Get orders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get orders',
            error: error.message,
        });
    }
});
// Get order by ID
router.get('/:id', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isMongoId()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const order = await Order_1.default.findOne({
            _id: req.params.id,
            userId: req.user?.uid,
        }).lean();
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        return res.json({
            success: true,
            data: {
                order: {
                    ...order,
                    id: order._id.toString(),
                    items: order.items.map(item => ({
                        ...item,
                        productId: item.productId?.toString(),
                        denominationId: item.denominationId?.toString(),
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Get order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get order',
            error: error.message,
        });
    }
});
// Create order (authenticated user)
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('billingInfo').isObject(),
    (0, express_validator_1.body)('billingInfo.fullName').notEmpty(),
    (0, express_validator_1.body)('billingInfo.email').isEmail(),
    (0, express_validator_1.body)('billingInfo.phone').notEmpty(),
    (0, express_validator_1.body)('paymentMethod').isIn(['CARD', 'BKASH', 'NAGAD']),
    (0, express_validator_1.body)('items').isArray({ min: 1 }),
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
        const { billingInfo, paymentMethod, items, notes } = req.body;
        const userId = req.user?.uid;
        // Validate and process items
        const orderItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product_1.default.findById(item.productId);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                });
            }
            const denomination = await Denomination_1.default.findById(item.denominationId);
            if (!denomination || !denomination.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Denomination not found: ${item.denominationId}`,
                });
            }
            const itemTotal = denomination.price * (item.quantity || 1);
            totalAmount += itemTotal;
            orderItems.push({
                productId: product._id,
                denominationId: denomination._id,
                productName: product.name,
                denominationAmount: denomination.amount,
                quantity: item.quantity || 1,
                unitPrice: denomination.price,
                totalPrice: itemTotal,
                gameUid: item.gameUid || '',
                server: item.server || '',
                playerId: item.playerId || '',
            });
        }
        // Create order
        const order = new Order_1.default({
            orderNumber: generateOrderNumber(),
            userId,
            items: orderItems,
            totalAmount,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod,
            billingInfo,
            notes: notes || '',
        });
        await order.save();
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: {
                    ...order.toObject(),
                    id: order._id.toString(),
                    items: order.items.map(item => ({
                        ...item,
                        productId: item.productId?.toString(),
                        denominationId: item.denominationId?.toString(),
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
        });
    }
});
// Create guest order (no auth required)
router.post('/guest', [
    (0, express_validator_1.body)('billingInfo').isObject(),
    (0, express_validator_1.body)('billingInfo.fullName').notEmpty(),
    (0, express_validator_1.body)('billingInfo.email').isEmail(),
    (0, express_validator_1.body)('billingInfo.phone').notEmpty(),
    (0, express_validator_1.body)('paymentMethod').isIn(['CARD', 'BKASH', 'NAGAD']),
    (0, express_validator_1.body)('items').isArray({ min: 1 }),
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
        const { billingInfo, paymentMethod, items, notes } = req.body;
        // Validate and process items (same as authenticated order)
        const orderItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product_1.default.findById(item.productId);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                });
            }
            const denomination = await Denomination_1.default.findById(item.denominationId);
            if (!denomination || !denomination.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Denomination not found: ${item.denominationId}`,
                });
            }
            const itemTotal = denomination.price * (item.quantity || 1);
            totalAmount += itemTotal;
            orderItems.push({
                productId: product._id,
                denominationId: denomination._id,
                productName: product.name,
                denominationAmount: denomination.amount,
                quantity: item.quantity || 1,
                unitPrice: denomination.price,
                totalPrice: itemTotal,
                gameUid: item.gameUid || '',
                server: item.server || '',
                playerId: item.playerId || '',
            });
        }
        // Create guest order (userId is null)
        const order = new Order_1.default({
            orderNumber: generateOrderNumber(),
            userId: 'GUEST',
            items: orderItems,
            totalAmount,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod,
            billingInfo,
            notes: notes || '',
        });
        await order.save();
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: {
                    ...order.toObject(),
                    id: order._id.toString(),
                    items: order.items.map(item => ({
                        ...item,
                        productId: item.productId?.toString(),
                        denominationId: item.denominationId?.toString(),
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Create guest order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
        });
    }
});
// Get order by order number (for guests)
router.get('/number/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order_1.default.findOne({ orderNumber }).lean();
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        return res.json({
            success: true,
            data: {
                order: {
                    ...order,
                    id: order._id.toString(),
                    items: order.items.map(item => ({
                        ...item,
                        productId: item.productId?.toString(),
                        denominationId: item.denominationId?.toString(),
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Get order by number error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get order',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map