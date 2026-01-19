import mongoose, { Document } from 'mongoose';
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
declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Payment;
//# sourceMappingURL=Payment.d.ts.map