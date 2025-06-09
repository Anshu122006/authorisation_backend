import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
});

const RefreshToken:Model<IRefreshToken> = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
export default RefreshToken;
