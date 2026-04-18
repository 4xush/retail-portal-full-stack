import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, min: 1 },
    snapshot: {
      title: String,
      cost: Number,
      taxPercent: Number,
      image: String,
    },
  },
  { _id: false }
);

const orderComboSchema = new Schema(
  {
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    discountPercent: { type: Number },
    label: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    combos: [orderComboSchema],
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number },
    tax: { type: Number },
    total: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Order = mongoose.model('Order', orderSchema);
