"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Category_1 = __importDefault(require("../models/Category"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true })
            .sort({ sortOrder: 1 })
            .lean();
        return res.json({
            success: true,
            data: {
                categories: categories.map(c => ({
                    ...c,
                    id: c._id.toString(),
                })),
            },
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get categories',
            error: error.message,
        });
    }
});
// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id).lean();
        if (!category || !category.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        return res.json({
            success: true,
            data: {
                category: {
                    ...category,
                    id: category._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Get category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get category',
            error: error.message,
        });
    }
});
// Admin: Create category
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('image').optional().trim(),
    (0, express_validator_1.body)('sortOrder').optional().isInt(),
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
        const { name, description, image, sortOrder } = req.body;
        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Check for existing slug
        const existingCategory = await Category_1.default.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with similar name already exists',
            });
        }
        const category = new Category_1.default({
            name,
            slug,
            description: description || '',
            image: image || '',
            sortOrder: sortOrder || 0,
        });
        await category.save();
        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category: {
                    ...category.toObject(),
                    id: category._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message,
        });
    }
});
// Admin: Update category
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { name, description, image, isActive, sortOrder } = req.body;
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        // Update fields
        if (name) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existingCategory = await Category_1.default.findOne({ slug, _id: { $ne: category._id } });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with similar name already exists',
                });
            }
            category.name = name;
            category.slug = slug;
        }
        if (description !== undefined)
            category.description = description;
        if (image !== undefined)
            category.image = image;
        if (isActive !== undefined)
            category.isActive = isActive;
        if (sortOrder !== undefined)
            category.sortOrder = sortOrder;
        await category.save();
        return res.json({
            success: true,
            message: 'Category updated successfully',
            data: {
                category: {
                    ...category.toObject(),
                    id: category._id.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Update category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message,
        });
    }
});
// Admin: Delete category
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        // Soft delete
        category.isActive = false;
        await category.save();
        return res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map