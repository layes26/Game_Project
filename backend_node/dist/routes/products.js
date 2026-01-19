"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Product_1 = __importDefault(require("../models/Product"));
const Denomination_1 = __importDefault(require("../models/Denomination"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all products
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('categoryId').optional(),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('featured').optional().isBoolean(),
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
        const categoryId = req.query.categoryId;
        const search = req.query.search;
        const featured = req.query.featured === 'true';
        // Build filter
        const filter = { isActive: true };
        if (categoryId) {
            filter.categoryId = categoryId;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (featured) {
            filter.isFeatured = true;
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product_1.default.find(filter)
                .populate('categoryId', 'name slug image')
                .sort({ sortOrder: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product_1.default.countDocuments(filter),
        ]);
        // Fetch denominations for each product
        const productIds = products.map(p => p._id);
        const denominations = await Denomination_1.default.find({
            productId: { $in: productIds },
            isActive: true,
        }).lean();
        // Group denominations by product
        const denomMap = new Map();
        denominations.forEach(d => {
            const pid = d.productId.toString();
            if (!denomMap.has(pid)) {
                denomMap.set(pid, []);
            }
            denomMap.get(pid).push({
                id: d._id.toString(),
                amount: d.amount,
                price: d.price,
                discount: d.discount,
            });
        });
        // Attach denominations to products
        const productsWithDenoms = products.map(product => ({
            ...product,
            id: product._id.toString(),
            categoryId: product.categoryId?._id?.toString() || product.categoryId?.toString(),
            category: product.categoryId?.name ? {
                id: product.categoryId._id.toString(),
                name: product.categoryId.name,
                slug: product.categoryId.slug,
                image: product.categoryId.image,
            } : undefined,
            denominations: denomMap.get(product._id.toString()) || [],
        }));
        return res.json({
            success: true,
            data: {
                products: productsWithDenoms,
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
        console.error('Get products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message,
        });
    }
});
// Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product_1.default.find({ isActive: true, isFeatured: true })
            .populate('categoryId', 'name slug image')
            .sort({ sortOrder: 1 })
            .limit(8)
            .lean();
        return res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        console.error('Get featured products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get featured products',
            error: error.message,
        });
    }
});
// Get product by ID
router.get('/:id', [(0, express_validator_1.param)('id').isMongoId()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const product = await Product_1.default.findById(req.params.id)
            .populate('categoryId', 'name slug image description')
            .lean();
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        // Get denominations
        const denominations = await Denomination_1.default.find({
            productId: product._id,
            isActive: true,
        }).sort({ amount: 1 }).lean();
        return res.json({
            success: true,
            data: {
                product: {
                    ...product,
                    id: product._id.toString(),
                    category: product.categoryId ? {
                        id: product.categoryId._id.toString(),
                        name: product.categoryId.name,
                        slug: product.categoryId.slug,
                        image: product.categoryId.image,
                        description: product.categoryId.description,
                    } : undefined,
                    denominations: denominations.map(d => ({
                        id: d._id.toString(),
                        amount: d.amount,
                        price: d.price,
                        discount: d.discount,
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get product',
            error: error.message,
        });
    }
});
// Get products by category slug
router.get('/category/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const products = await Product_1.default.find({
            isActive: true,
            'categoryId.slug': slug,
        })
            .populate('categoryId', 'name slug image')
            .sort({ sortOrder: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return res.json({
            success: true,
            data: { products },
        });
    }
    catch (error) {
        console.error('Get products by category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message,
        });
    }
});
// Admin: Create product
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { name, description, shortDescription, image, images, categoryId, isFeatured, sortOrder, denominations, } = req.body;
        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Check for existing slug
        const existingProduct = await Product_1.default.findOne({ slug });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with similar name already exists',
            });
        }
        // Create product
        const product = new Product_1.default({
            name,
            slug,
            description: description || '',
            shortDescription: shortDescription || '',
            image: image || '',
            images: images || [],
            categoryId,
            isFeatured: isFeatured || false,
            sortOrder: sortOrder || 0,
        });
        await product.save();
        // Create denominations if provided
        let createdDenominations = [];
        if (denominations && Array.isArray(denominations) && denominations.length > 0) {
            const denomDocs = denominations.map((d) => ({
                productId: product._id,
                amount: d.amount,
                price: d.price,
                discount: d.discount || 0,
                isActive: true,
            }));
            await Denomination_1.default.insertMany(denomDocs);
            createdDenominations = await Denomination_1.default.find({ productId: product._id }).lean();
        }
        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product: {
                    ...product.toObject(),
                    id: product._id.toString(),
                    denominations: createdDenominations.map(d => ({
                        id: d._id.toString(),
                        amount: d.amount,
                        price: d.price,
                        discount: d.discount,
                    })),
                },
            },
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message,
        });
    }
});
// Admin: Update product
router.put('/:id', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isMongoId()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { name, description, shortDescription, image, images, categoryId, isFeatured, sortOrder } = req.body;
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        // Update fields
        if (name)
            product.name = name;
        if (description !== undefined)
            product.description = description;
        if (shortDescription !== undefined)
            product.shortDescription = shortDescription;
        if (image !== undefined)
            product.image = image;
        if (images !== undefined)
            product.images = images;
        if (categoryId)
            product.categoryId = categoryId;
        if (isFeatured !== undefined)
            product.isFeatured = isFeatured;
        if (sortOrder !== undefined)
            product.sortOrder = sortOrder;
        // Update slug if name changed
        if (name && name !== product.name) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existingProduct = await Product_1.default.findOne({ slug, _id: { $ne: product._id } });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with similar name already exists',
                });
            }
            product.slug = slug;
        }
        await product.save();
        return res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message,
        });
    }
});
// Admin: Delete product
router.delete('/:id', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isMongoId()], async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        // Soft delete - set isActive to false
        product.isActive = false;
        await product.save();
        // Also deactivate denominations
        await Denomination_1.default.updateMany({ productId: product._id }, { isActive: false });
        return res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map