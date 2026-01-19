import mongoose, { Document, Schema } from 'mongoose';

// Payment interface
export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  senderNumber: string;
  senderName?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CARD', 'BKASH', 'NAGAD'],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    senderNumber: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Transform output
paymentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;

