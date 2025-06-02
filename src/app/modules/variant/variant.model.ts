import  { Schema, model, Document } from 'mongoose';

export interface IVariant extends Document {
  name: string;
  description: string;
  values: string[];
  productCount?: number;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema: Schema<IVariant> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    values: { type: [String], required: true },
    productCount: { type: Number, default: 0 },
    icon: { type: String },
    color: { type: String },
  },
  {
    timestamps: true,
  }
);

const Variant = model<IVariant>('Variant', VariantSchema);

export default Variant;
