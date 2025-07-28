const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    type: String, // URLs or base64 data for images
    name: String
  }]
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Component'
  },
  description: {
    type: String,
    default: ''
  },
  chatHistory: [messageSchema],
  generatedCode: {
    jsx: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    typescript: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    lastModified: {
      type: Date,
      default: Date.now
    },
    componentType: {
      type: String,
      default: 'component'
    },
    framework: {
      type: String,
      default: 'react'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Session', sessionSchema);