import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';
import Product from './models/Product';
import Denomination from './models/Denomination';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming_store';

const categories = [
  {
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    description: 'UC (Unknown Cash) top-up for PUBG Mobile',
    image: '/images/pubg.png',
    sortOrder: 1,
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    description: 'Diamonds top-up for Free Fire',
    image: '/images/freefire.jpg',
    sortOrder: 2,
  },
  {
    name: 'Steam',
    slug: 'steam',
    description: 'Steam wallet codes and games',
    image: '/images/steam.jpg',
    sortOrder: 3,
  },
  {
    name: 'Google Play',
    slug: 'google-play',
    description: 'Google Play gift cards',
    image: '/images/google.jpg',
    sortOrder: 4,
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'Amazon gift cards',
    image: '/images/amazon-removebg-preview.png',
    sortOrder: 5,
  },
];

const products = [
  // PUBG Mobile products
  {
    name: 'PUBG UC - 60 UC',
    slug: 'pubg-uc-60',
    description: 'Get 60 UC for PUBG Mobile instantly',
    shortDescription: '60 UC - Instant Delivery',
    image: '/images/pubg.png',
    categorySlug: 'pubg-mobile',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'PUBG UC - 300 UC',
    slug: 'pubg-uc-300',
    description: 'Get 300 UC for PUBG Mobile instantly',
    shortDescription: '300 UC - Instant Delivery',
    image: '/images/pubg.png',
    categorySlug: 'pubg-mobile',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'PUBG UC - 600 UC',
    slug: 'pubg-uc-600',
    description: 'Get 600 UC for PUBG Mobile instantly',
    shortDescription: '600 UC - Instant Delivery',
    image: '/images/pubg.png',
    categorySlug: 'pubg-mobile',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'PUBG UC - 1000 UC',
    slug: 'pubg-uc-1000',
    description: 'Get 1000 UC for PUBG Mobile instantly',
    shortDescription: '1000 UC - Instant Delivery',
    image: '/images/pubg.png',
    categorySlug: 'pubg-mobile',
    isFeatured: true,
    sortOrder: 4,
  },
  {
    name: 'PUBG UC - 2000 UC',
    slug: 'pubg-uc-2000',
    description: 'Get 2000 UC for PUBG Mobile instantly',
    shortDescription: '2000 UC - Instant Delivery',
    image: '/images/pubg.png',
    categorySlug: 'pubg-mobile',
    isFeatured: false,
    sortOrder: 5,
  },
  
  // Free Fire products
  {
    name: 'Free Fire Diamonds - 100',
    slug: 'free-fire-diamonds-100',
    description: 'Get 100 Diamonds for Free Fire instantly',
    shortDescription: '100 Diamonds - Instant Delivery',
    image: '/images/freefire.jpg',
    categorySlug: 'free-fire',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Free Fire Diamonds - 310',
    slug: 'free-fire-diamonds-310',
    description: 'Get 310 Diamonds for Free Fire instantly',
    shortDescription: '310 Diamonds - Instant Delivery',
    image: '/images/freefire.jpg',
    categorySlug: 'free-fire',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Free Fire Diamonds - 520',
    slug: 'free-fire-diamonds-520',
    description: 'Get 520 Diamonds for Free Fire instantly',
    shortDescription: '520 Diamonds - Instant Delivery',
    image: '/images/freefire.jpg',
    categorySlug: 'free-fire',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'Free Fire Diamonds - 1080',
    slug: 'free-fire-diamonds-1080',
    description: 'Get 1080 Diamonds for Free Fire instantly',
    shortDescription: '1080 Diamonds - Instant Delivery',
    image: '/images/freefire.jpg',
    categorySlug: 'free-fire',
    isFeatured: false,
    sortOrder: 4,
  },
  
  // Steam products
  {
    name: 'Steam Wallet - $10',
    slug: 'steam-wallet-10',
    description: 'Steam Wallet $10 Gift Card',
    shortDescription: '$10 Steam Wallet',
    image: '/images/steam.jpg',
    categorySlug: 'steam',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Steam Wallet - $25',
    slug: 'steam-wallet-25',
    description: 'Steam Wallet $25 Gift Card',
    shortDescription: '$25 Steam Wallet',
    image: '/images/steam.jpg',
    categorySlug: 'steam',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Steam Wallet - $50',
    slug: 'steam-wallet-50',
    description: 'Steam Wallet $50 Gift Card',
    shortDescription: '$50 Steam Wallet',
    image: '/images/steam.jpg',
    categorySlug: 'steam',
    isFeatured: false,
    sortOrder: 3,
  },
  
  // Google Play products
  {
    name: 'Google Play - $10',
    slug: 'google-play-10',
    description: 'Google Play Gift Card $10',
    shortDescription: '$10 Google Play',
    image: '/images/google.jpg',
    categorySlug: 'google-play',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Google Play - $25',
    slug: 'google-play-25',
    description: 'Google Play Gift Card $25',
    shortDescription: '$25 Google Play',
    image: '/images/google.jpg',
    categorySlug: 'google-play',
    isFeatured: true,
    sortOrder: 2,
  },
  
  // Amazon products
  {
    name: 'Amazon - $10',
    slug: 'amazon-10',
    description: 'Amazon Gift Card $10',
    shortDescription: '$10 Amazon',
    image: '/images/amazon-removebg-preview.png',
    categorySlug: 'amazon',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Amazon - $25',
    slug: 'amazon-25',
    description: 'Amazon Gift Card $25',
    shortDescription: '$25 Amazon',
    image: '/images/amazon-removebg-preview.png',
    categorySlug: 'amazon',
    isFeatured: true,
    sortOrder: 2,
  },
];

const denominations: { productSlug: string; amount: number; price: number; discount?: number }[] = [
  // PUBG UC
  { productSlug: 'pubg-uc-60', amount: 60, price: 85 },
  { productSlug: 'pubg-uc-300', amount: 300, price: 399, discount: 5 },
  { productSlug: 'pubg-uc-600', amount: 600, price: 799, discount: 5 },
  { productSlug: 'pubg-uc-1000', amount: 1000, price: 1299, discount: 10 },
  { productSlug: 'pubg-uc-2000', amount: 2000, price: 2499, discount: 10 },
  
  // Free Fire Diamonds
  { productSlug: 'free-fire-diamonds-100', amount: 100, price: 99 },
  { productSlug: 'free-fire-diamonds-310', amount: 310, price: 299, discount: 5 },
  { productSlug: 'free-fire-diamonds-520', amount: 520, price: 499, discount: 5 },
  { productSlug: 'free-fire-diamonds-1080', amount: 1080, price: 999, discount: 10 },
  
  // Steam
  { productSlug: 'steam-wallet-10', amount: 10, price: 1100 },
  { productSlug: 'steam-wallet-25', amount: 25, price: 2750, discount: 2 },
  { productSlug: 'steam-wallet-50', amount: 50, price: 5500, discount: 3 },
  
  // Google Play
  { productSlug: 'google-play-10', amount: 10, price: 1100 },
  { productSlug: 'google-play-25', amount: 25, price: 2750, discount: 2 },
  
  // Amazon
  { productSlug: 'amazon-10', amount: 10, price: 1100 },
  { productSlug: 'amazon-25', amount: 25, price: 2750, discount: 2 },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Denomination.deleteMany({});

    // Insert categories
    console.log('Inserting categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Inserted ${createdCategories.length} categories`);

    // Create category map
    const categoryMap = new Map<string, string>();
    createdCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat._id.toString());
    });

    // Prepare products with category IDs
    console.log('Inserting products...');
    const productsWithCategory = products.map(product => ({
      ...product,
      categoryId: categoryMap.get(product.categorySlug),
    }));
    
    const createdProducts = await Product.insertMany(productsWithCategory);
    console.log(`Inserted ${createdProducts.length} products`);

    // Create product map
    const productMap = new Map<string, string>();
    createdProducts.forEach(prod => {
      productMap.set(prod.slug, prod._id);
    });

    // Prepare denominations
    console.log('Inserting denominations...');
    const denominationsWithProduct = denominations
      .filter(d => productMap.has(d.productSlug))
      .map(d => ({
        productId: productMap.get(d.productSlug),
        amount: d.amount,
        price: d.price,
        discount: d.discount || 0,
        isActive: true,
      }));

    await Denomination.insertMany(denominationsWithProduct);
    console.log(`Inserted ${denominationsWithProduct.length} denominations`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

