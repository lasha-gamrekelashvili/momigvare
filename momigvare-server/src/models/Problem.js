import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: String,
  budget: Number,
  description: String,
  contact: String,
  comments: [{
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const Problem = mongoose.model('Problem', problemSchema); 