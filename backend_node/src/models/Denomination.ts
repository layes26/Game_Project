import mongoose, { Document, Schema } from 'mongoose';

// Denomination interface
export interface IDenomination extends Document {
  productId: mongoose.Types.ObjectId;
  amount: number; // Game currency amount (UC, Diamonds, etc.)
  price: number; // Price in BDT
  discount?: number; // Discount percentage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const denominationSchema = new Schema<IDenomination>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for product lookups
denominationSchema.index({ productId: 1, isActive: 1 });
denominationSchema.index({ amount: 1 });

// Transform output
denominationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Denomination = mongoose.model<IDenomination>('Denomination', denominationSchema);

export default Denomination;

