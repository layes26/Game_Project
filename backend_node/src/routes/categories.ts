import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Category from '../models/Category';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/',
  async (req: Request, res: Response) => {
    try {
      const categories = await Category.find({ isActive: true })
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
    } catch (error: any) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get categories',
        error: error.message,
      });
    }
  }
);

// Get category by ID
router.get('/:id',
  async (req: Request, res: Response) => {
    try {
      const category = await Category.findById(req.params.id).lean();

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
    } catch (error: any) {
      console.error('Get category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get category',
        error: error.message,
      });
    }
  }
);

// Admin: Create category
router.post('/',
  authMiddleware,
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('image').optional().trim(),
    body('sortOrder').optional().isInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
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
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with similar name already exists',
        });
      }

      const category = new Category({
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
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message,
      });
    }
  }
);

// Admin: Update category
router.put('/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, description, image, isActive, sortOrder } = req.body;

      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Update fields
      if (name) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existingCategory = await Category.findOne({ slug, _id: { $ne: category._id } });
        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Category with similar name already exists',
          });
        }
        category.name = name;
        category.slug = slug;
      }

      if (description !== undefined) category.description = description;
      if (image !== undefined) category.image = image;
      if (isActive !== undefined) category.isActive = isActive;
      if (sortOrder !== undefined) category.sortOrder = sortOrder;

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
    } catch (error: any) {
      console.error('Update category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message,
      });
    }
  }
);

// Admin: Delete category
router.delete('/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const category = await Category.findById(req.params.id);

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
    } catch (error: any) {
      console.error('Delete category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message,
      });
    }
  }
);

export default router;

