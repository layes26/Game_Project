import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    denominationId: mongoose.Types.ObjectId;
    productName: string;
    denominationAmount: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    gameUid: string;
    server?: string;
    playerId?: string;
}
export interface IOrder extends Document {
    orderNumber: string;
    userId: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    paymentMethod: 'CARD' | 'BKASH' | 'NAGAD';
    billingInfo: {
        fullName: string;
        email: string;
        phone: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Order;
//# sourceMappingURL=Order.d.ts.map