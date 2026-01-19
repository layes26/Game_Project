import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order';
import Payment from '../models/Payment';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Submit manual payment (bKash/Nagad)
router.post('/manual',
  authMiddleware,
  [
    body('orderId').notEmpty(),
    body('paymentMethod').isIn(['BKASH', 'NAGAD']),
    body('senderNumber').notEmpty(),
    body('transactionId').notEmpty(),
    body('amount').isFloat({ min: 0 }),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
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
      const order = await Order.findById(orderId);

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
      const existingPayment = await Payment.findOne({
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
      const payment = new Payment({
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
    } catch (error: any) {
      console.error('Submit payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit payment',
        error: error.message,
      });
    }
  }
);

// Get payment status for an order
router.get('/order/:orderId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 }).lean();

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
    } catch (error: any) {
      console.error('Get payment status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error.message,
      });
    }
  }
);

// Card payment initiation (placeholder for future Stripe integration)
router.post('/card',
  authMiddleware,
  [
    body('orderId').notEmpty(),
    body('paymentMethod').equals('CARD'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);

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
      const payment = new Payment({
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
    } catch (error: any) {
      console.error('Card payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate card payment',
        error: error.message,
      });
    }
  }
);

export default router;

