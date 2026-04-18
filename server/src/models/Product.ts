import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    images: [{ type: String }],
    cost: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    combos: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    addOns: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

productSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'product_text_index' }
);
productSchema.index({ title: 1 });

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Product = mongoose.model('Product', productSchema);
