import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerPath extends Document {
  title: string;
  description: string;
  skills: string[];
  salary: string;
  exp: string;
  category: string;
  location: string;
  image: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  salary: { type: String },
  exp: { type: String },
  category: { type: String, index: true },
  location: { type: String },
  image: { type: String },
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

schema.index({ title: 'text', description: 'text' });

export const CareerPath = mongoose.model<ICareerPath>('CareerPath', schema);
