import mongoose, { Document, Schema, models, Types } from 'mongoose';

export interface IProductAttribute {
  definition: Types.ObjectId; // Ref to CustomAttributeDefinition
  value: string; // e.g., "Red", "M", "Cotton"
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[]; // Array of Cloudinary URLs
  category?: Types.ObjectId; // Ref to Category
  tags: Types.ObjectId[]; // Array of Refs to Tag
  customAttributes: IProductAttribute[];
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductAttributeSchema = new Schema<IProductAttribute>({
  definition: { type: Schema.Types.ObjectId, ref: 'CustomAttributeDefinition', required: true },
  value: { type: String, required: true, trim: true },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, trim: true }], // URLs from Cloudinary
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  customAttributes: [ProductAttributeSchema],
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
}, { timestamps: true });

// Pre-save middleware to generate slug from name
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export default models.Product || mongoose.model<IProduct>('Product', ProductSchema);
