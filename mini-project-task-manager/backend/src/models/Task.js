const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
  description: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, enum: ['Engineering', 'Design', 'Marketing', 'Personal', 'General'], default: 'General' },
  dueDate: { type: Date, default: null },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
