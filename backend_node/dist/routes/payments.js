"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Submit manual payment (bKash/Nagad)
router.post('/manual', auth_1.authMiddleware, [
    (0, express_validator_1.body)('orderId').notEmpty(),
    (0, express_validator_1.body)('paymentMethod').isIn(['BKASH', 'NAGAD']),
    (0, express_validator_1.body)('senderNumber').notEmpty(),
    (0, express_validator_1.body)('transactionId').notEmpty(),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
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
        const { orderId, paymentMethod, senderNumber, transactionId, amount, senderName } = req.body;
        const userId = req.user?.uid;
        // Find order
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        // Check if order belongs to user
        if (order.userId !== 'GUEST' && order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }
        // Check if amount matches
        if (Math.abs(amount - order.totalAmount) > 1) {
            return res.status(400).json({
                success: false,
                message: 'Amount does not match order total',
            });
        }
        // Check for existing payment
        const existingPayment = await Payment_1.default.findOne({
            orderId: order._id,
            transactionId,
        });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'This transaction ID has already been used',
            });
        }
        // Create payment record
        const payment = new Payment_1.default({
            orderId: order._id,
            amount,
            paymentMethod,
            transactionId,
            senderNumber,
            senderName: senderName || '',
            status: 'PENDING',
        });
        await payment.save();
        // Update order payment status
        order.paymentStatus = 'PROCESSING';
        await order.save();
        return res.status(201).json({
            success: true,
            message: 'Payment submitted successfully. It will be reviewed shortly.',
            data: {
                payment: {
                    id: payment._id.toString(),
                    orderId: order._id.toString(),
                    amount: payment.amount,
                    status: payment.status,
                    transactionId: payment.transactionId,
                    createdAt: payment.createdAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Submit payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit payment',
            error: error.message,
        });
    }
});
// Get payment status for an order
router.get('/order/:orderId', auth_1.authMiddleware, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        const payment = await Payment_1.default.findOne({ orderId: order._id }).sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            data: {
                order: {
                    id: order._id.toString(),
                    orderNumber: order.orderNumber,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount,
                },
                payment: payment ? {
                    id: payment._id.toString(),
                    amount: payment.amount,
                    paymentMethod: payment.paymentMethod,
                    transactionId: payment.transactionId,
                    status: payment.status,
                    createdAt: payment.createdAt,
                } : null,
            },
        });
    }
    catch (error) {
        console.error('Get payment status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message,
        });
    }
});
// Card payment initiation (placeholder for future Stripe integration)
router.post('/card', auth_1.authMiddleware, [
    (0, express_validator_1.body)('orderId').notEmpty(),
    (0, express_validator_1.body)('paymentMethod').equals('CARD'),
], async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        // For now, just update order status
        order.paymentStatus = 'PROCESSING';
        await order.save();
        // Create a placeholder payment record
        const payment = new Payment_1.default({
            orderId: order._id,
            amount: order.totalAmount,
            paymentMethod: 'CARD',
            transactionId: `CARD-${Date.now()}`,
            senderNumber: '',
            status: 'PENDING',
        });
        await payment.save();
        return res.json({
            success: true,
            message: 'Card payment initiated',
            data: {
                orderId: order._id.toString(),
                amount: order.totalAmount,
                status: 'processing',
            },
        });
    }
    catch (error) {
        console.error('Card payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initiate card payment',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map