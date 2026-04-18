import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const stockHistorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    delta: { type: Number, required: true },
    reason: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stockBefore: { type: Number },
    stockAfter: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export type StockHistoryDocument = InferSchemaType<typeof stockHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};
export const StockHistory = mongoose.model('StockHistory', stockHistorySchema);
