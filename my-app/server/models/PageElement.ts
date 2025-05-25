import mongoose, { Document, Schema, models } from 'mongoose';

export interface IPageElement extends Document {
  pageIdentifier: string; // e.g., "homepage", "contact_us"
  elementType: string; // e.g., "HeroBanner", "ProductCarousel", "TextBlock"
  order: number; // To determine sequence of elements on a page
  config: mongoose.Schema.Types.Mixed; // Flexible configuration for the element
  // Example config for HeroBanner: { title: String, subtitle: String, imageUrl: String, buttonText: String, buttonLink: String }
  // Example config for ProductCarousel: { title: String, productIds: [ObjectId] }
  createdAt: Date;
  updatedAt: Date;
}

const PageElementSchema = new Schema<IPageElement>({
  pageIdentifier: { type: String, required: true, index: true },
  elementType: { type: String, required: true },
  order: { type: Number, default: 0 },
  config: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default models.PageElement || mongoose.model<IPageElement>('PageElement', PageElementSchema);
