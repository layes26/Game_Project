"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const Denomination_1 = __importDefault(require("../models/Denomination"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get user cart
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const cart = await Cart_1.default.findOne({ userId: req.user?.uid })
            .populate('items.productId', 'name image slug')
            .lean();
        if (!cart) {
            return res.json({
                success: true,
                data: {
                    cart: {
                        items: [],
                        totalItems: 0,
                        totalPrice: 0,
                    },
                },
            });
        }
        // Calculate total price
        let totalPrice = 0;
        const enrichedItems = [];
        for (const item of cart.items) {
            const denomination = await Denomination_1.default.findById(item.denominationId).lean();
            if (denomination && denomination.isActive) {
                const itemTotal = denomination.price * item.quantity;
                totalPrice += itemTotal;
                enrichedItems.push({
                    id: item._id.toString(),
                    productId: item.productId?._id?.toString() || item.productId?.toString(),
                    product: item.productId?.name ? {
                        name: item.productId.name,
                        image: item.productId.image,
                        slug: item.productId.slug,
                    } : undefined,
                    denominationId: item.denominationId?.toString(),
                    denomination: {
                        id: denomination._id.toString(),
                        amount: denomination.amount,
                        price: denomination.price,
                        discount: denomination.discount,
                    },
                    quantity: item.quantity,
                    gameUid: item.gameUid,
                    server: item.server,
                    playerId: item.playerId,
                    totalPrice: itemTotal,
                });
            }
        }
        return res.json({
            success: true,
            data: {
                cart: {
                    ...cart,
                    id: cart._id.toString(),
                    items: enrichedItems,
                    totalItems: enrichedItems.length,
                    totalPrice,
                },
            },
        });
    }
    catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: error.message,
        });
    }
});
// Add item to cart
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('productId').notEmpty(),
    (0, express_validator_1.body)('denominationId').notEmpty(),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('gameUid').optional().trim(),
    (0, express_validator_1.body)('server').optional().trim(),
    (0, express_validator_1.body)('playerId').optional().trim(),
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
        const { productId, denominationId, quantity, gameUid, server, playerId } = req.body;
        const userId = req.user?.uid;
        // Validate product
        const product = await Product_1.default.findById(productId);
        if (!product || !product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Product not found',
            });
        }
        // Validate denomination
        const denomination = await Denomination_1.default.findById(denominationId);
        if (!denomination || !denomination.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Denomination not found',
            });
        }
        // Find or create cart
        let cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            cart = new Cart_1.default({ userId, items: [] });
        }
        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId &&
            item.denominationId.toString() === denominationId &&
            item.gameUid === (gameUid || ''));
        if (existingItemIndex >= 0) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity || 1;
        }
        else {
            // Add new item
            cart.items.push({
                productId: new (require('mongoose').Types.ObjectId)(productId),
                denominationId: new (require('mongoose').Types.ObjectId)(denominationId),
                quantity: quantity || 1,
                gameUid: gameUid || '',
                server: server || '',
                playerId: playerId || '',
            });
        }
        await cart.save();
        return res.json({
            success: true,
            message: 'Item added to cart',
            data: { cartId: cart._id.toString() },
        });
    }
    catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add to cart',
            error: error.message,
        });
    }
});
// Update cart item
router.put('/:itemId', auth_1.authMiddleware, [
    (0, express_validator_1.body)('quantity').isInt({ min: 0 }),
    (0, express_validator_1.body)('gameUid').optional().trim(),
    (0, express_validator_1.body)('server').optional().trim(),
    (0, express_validator_1.body)('playerId').optional().trim(),
], async (req, res) => {
    try {
        const { quantity, gameUid, server, playerId } = req.body;
        const userId = req.user?.uid;
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }
        const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
        if (itemIndex < 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
            });
        }
        if (quantity === 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        }
        else {
            // Update item
            cart.items[itemIndex].quantity = quantity;
            if (gameUid !== undefined)
                cart.items[itemIndex].gameUid = gameUid;
            if (server !== undefined)
                cart.items[itemIndex].server = server;
            if (playerId !== undefined)
                cart.items[itemIndex].playerId = playerId;
        }
        await cart.save();
        return res.json({
            success: true,
            message: 'Cart updated',
        });
    }
    catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message,
        });
    }
});
// Remove item from cart
router.delete('/:itemId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.uid;
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }
        const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
        if (itemIndex < 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
            });
        }
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.json({
            success: true,
            message: 'Item removed from cart',
        });
    }
    catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove item',
            error: error.message,
        });
    }
});
// Clear cart
router.delete('/', auth_1.authMiddleware, async (req, res) => {
    try {
        await Cart_1.default.deleteOne({ userId: req.user?.uid });
        return res.json({
            success: true,
            message: 'Cart cleared',
        });
    }
    catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map