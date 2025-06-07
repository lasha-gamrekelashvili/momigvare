import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  type: { type: String, enum: ['problem', 'offer'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number },
  location: { type: String },
  contactInfo: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['open', 'solved'], default: 'open' }
});

export const Post = mongoose.model('Post', postSchema);
