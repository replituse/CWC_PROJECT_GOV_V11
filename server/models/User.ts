import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", UserSchema);
