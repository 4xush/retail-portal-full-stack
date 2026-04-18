import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const discountCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { versionKey: false }
);

export type DiscountCodeDocument = InferSchemaType<typeof discountCodeSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema);
