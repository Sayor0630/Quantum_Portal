import mongoose, { Document, Schema, models } from 'mongoose';

export interface ICustomAttributeDefinition extends Document {
  name: string; // e.g., "Color", "Size", "Material"
  possibleValues: string[]; // e.g., ["Red", "Blue"], ["S", "M", "L"], ["Cotton", "Polyester"]
  createdAt: Date;
  updatedAt: Date;
}

const CustomAttributeDefinitionSchema = new Schema<ICustomAttributeDefinition>({
  name: { type: String, required: true, unique: true, trim: true },
  possibleValues: [{ type: String, trim: true }],
}, { timestamps: true });

export default models.CustomAttributeDefinition || mongoose.model<ICustomAttributeDefinition>('CustomAttributeDefinition', CustomAttributeDefinitionSchema);
