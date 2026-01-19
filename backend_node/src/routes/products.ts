import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import Product from '../models/Product';
import Denomination from '../models/Denomination';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('categoryId').optional(),
    query('search').optional().trim(),
    query('featured').optional().isBoolean(),
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const featured = req.query.featured === 'true';

      // Build filter
      const filter: any = { isActive: true };

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
        Product.find(filter)
          .populate('categoryId', 'name slug image')
          .sort({ sortOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // Fetch denominations for each product
      const productIds = products.map(p => p._id);
      const denominations = await Denomination.find({
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
    } catch (error: any) {
      console.error('Get products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error.message,
      });
    }
  }
);

// Get featured products
router.get('/featured',
  async (req: Request, res: Response) => {
    try {
      const products = await Product.find({ isActive: true, isFeatured: true })
        .populate('categoryId', 'name slug image')
        .sort({ sortOrder: 1 })
        .limit(8)
        .lean();

      return res.json({
        success: true,
        data: { products },
      });
    } catch (error: any) {
      console.error('Get featured products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get featured products',
        error: error.message,
      });
    }
  }
);

// Get product by ID
router.get('/:id',
  [param('id').isMongoId()],
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

      const product = await Product.findById(req.params.id)
        .populate('categoryId', 'name slug image description')
        .lean();

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Get denominations
      const denominations = await Denomination.find({
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
              id: (product.categoryId as any)._id.toString(),
              name: (product.categoryId as any).name,
              slug: (product.categoryId as any).slug,
              image: (product.categoryId as any).image,
              description: (product.categoryId as any).description,
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
    } catch (error: any) {
      console.error('Get product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get product',
        error: error.message,
      });
    }
  }
);

// Get products by category slug
router.get('/category/:slug',
  async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const products = await Product.find({ 
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
    } catch (error: any) {
      console.error('Get products by category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error.message,
      });
    }
  }
);

// Admin: Create product
router.post('/',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        description, 
        shortDescription,
        image, 
        images,
        categoryId, 
        isFeatured, 
        sortOrder,
        denominations,
      } = req.body;

      // Generate slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check for existing slug
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with similar name already exists',
        });
      }

      // Create product
      const product = new Product({
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
        const denomDocs = denominations.map((d: any) => ({
          productId: product._id,
          amount: d.amount,
          price: d.price,
          discount: d.discount || 0,
          isActive: true,
        }));
        
        await Denomination.insertMany(denomDocs);
        createdDenominations = await Denomination.find({ productId: product._id }).lean();
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
    } catch (error: any) {
      console.error('Create product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }
);

// Admin: Update product
router.put('/:id',
  authMiddleware,
  [param('id').isMongoId()],
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

      const { name, description, shortDescription, image, images, categoryId, isFeatured, sortOrder } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Update fields
      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (shortDescription !== undefined) product.shortDescription = shortDescription;
      if (image !== undefined) product.image = image;
      if (images !== undefined) product.images = images;
      if (categoryId) product.categoryId = categoryId;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (sortOrder !== undefined) product.sortOrder = sortOrder;

      // Update slug if name changed
      if (name && name !== product.name) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existingProduct = await Product.findOne({ slug, _id: { $ne: product._id } });
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
    } catch (error: any) {
      console.error('Update product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }
);

// Admin: Delete product
router.delete('/:id',
  authMiddleware,
  [param('id').isMongoId()],
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

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
      await Denomination.updateMany(
        { productId: product._id },
        { isActive: false }
      );

      return res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }
);

export default router;

