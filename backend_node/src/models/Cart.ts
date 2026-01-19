import mongoose, { Document, Schema } from 'mongoose';

// Cart Item interface
export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  denominationId: mongoose.Types.ObjectId;
  quantity: number;
  gameUid: string;
  server?: string;
  playerId?: string;
}

// Cart interface
export interface ICart extends Document {
  userId: string; // Firebase UID
  items: ICartItem[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  denominationId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  gameUid: {
    type: String,
    required: true,
    default: '',
  },
  server: {
    type: String,
    default: '',
  },
  playerId: {
    type: String,
    default: '',
  },
}, { _id: true });

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Transform output
cartSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;

