import mongoose from 'mongoose';

const solverSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  contact: String,
  comments: [{
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const Solver = mongoose.model('Solver', solverSchema); 