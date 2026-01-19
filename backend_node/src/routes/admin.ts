import { Router, Request, Response } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import Payment from '../models/Payment';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = Router();

// Get dashboard statistics
router.get('/dashboard',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [
        totalUsers,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders,
      ] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'PENDING' }),
        Order.countDocuments({ status: 'COMPLETED' }),
        Order.aggregate([
          { $match: { status: 'COMPLETED' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      const revenue = totalRevenue[0]?.total || 0;

      // Get top products
      const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.productName', 
          count: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' },
        }},
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
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get dashboard',
        error: error.message,
      });
    }
  }
);

// Get all orders (admin)
router.get('/orders',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
    query('paymentStatus').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const paymentStatus = req.query.paymentStatus as string;

      const filter: any = {};
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(filter),
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
    } catch (error: any) {
      console.error('Get admin orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get orders',
        error: error.message,
      });
    }
  }
);

// Update order status
router.patch('/orders/:id',
  authMiddleware,
  adminMiddleware,
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
    body('paymentStatus').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    body('notes').optional().trim(),
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

      const { status, paymentStatus, notes } = req.body;

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (notes !== undefined) order.notes = notes;

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
    } catch (error: any) {
      console.error('Update order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update order',
        error: error.message,
      });
    }
  }
);

// Complete order
router.post('/orders/:id/complete',
  authMiddleware,
  adminMiddleware,
  [param('id').isMongoId()],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id);

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
    } catch (error: any) {
      console.error('Complete order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete order',
        error: error.message,
      });
    }
  }
);

// Cancel order
router.post('/orders/:id/cancel',
  authMiddleware,
  adminMiddleware,
  [
    param('id').isMongoId(),
    body('reason').optional().trim(),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reason } = req.body;

      const order = await Order.findById(req.params.id);

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
    } catch (error: any) {
      console.error('Cancel order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message,
      });
    }
  }
);

// Get all users (admin)
router.get('/users',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(),
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
    } catch (error: any) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message,
      });
    }
  }
);

// Update user role
router.patch('/users/:id',
  authMiddleware,
  adminMiddleware,
  [
    param('id').isMongoId(),
    body('role').isIn(['USER', 'ADMIN']),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );

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
    } catch (error: any) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }
);

// Get all products (admin)
router.get('/products',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find()
          .populate('categoryId', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(),
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
    } catch (error: any) {
      console.error('Get admin products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error.message,
      });
    }
  }
);

export default router;

