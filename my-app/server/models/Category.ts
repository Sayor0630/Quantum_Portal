import mongoose, { Document, Schema, models, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentCategory?: Types.ObjectId; // Optional for top-level categories
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

// Pre-save middleware to generate slug from name if not provided or changed
CategorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export default models.Category || mongoose.model<ICategory>('Category', CategorySchema);
