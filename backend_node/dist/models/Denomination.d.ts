import mongoose, { Document } from 'mongoose';
export interface IDenomination extends Document {
    productId: mongoose.Types.ObjectId;
    amount: number;
    price: number;
    discount?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Denomination: mongoose.Model<IDenomination, {}, {}, {}, mongoose.Document<unknown, {}, IDenomination, {}, {}> & IDenomination & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Denomination;
//# sourceMappingURL=Denomination.d.ts.map