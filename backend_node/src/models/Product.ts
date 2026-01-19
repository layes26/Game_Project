import mongoose, { Document, Schema } from 'mongoose';

// Product interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  category?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
    }],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ sortOrder: 1 });

// Virtual for category reference (populated when needed)
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Transform output
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;

