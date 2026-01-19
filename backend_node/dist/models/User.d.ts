import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    uid: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map