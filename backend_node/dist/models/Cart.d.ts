import mongoose, { Document } from 'mongoose';
export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    denominationId: mongoose.Types.ObjectId;
    quantity: number;
    gameUid: string;
    server?: string;
    playerId?: string;
}
export interface ICart extends Document {
    userId: string;
    items: ICartItem[];
    updatedAt: Date;
}
declare const Cart: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, {}> & ICart & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Cart;
//# sourceMappingURL=Cart.d.ts.map