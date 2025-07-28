const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      userId: req.user._id,
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .select('title description metadata createdAt updatedAt');
    
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific session
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new session
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    const session = new Session({
      userId: req.user._id,
      title: title || 'New Component',
      description: description || '',
      chatHistory: [],
      generatedCode: {
        jsx: '',
        css: '',
        typescript: false
      }
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update session
router.put('/:sessionId', auth, async (req, res) => {
  try {
    const { title, description, chatHistory, generatedCode } = req.body;

    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user._id,
        isActive: true
      },
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(chatHistory && { chatHistory }),
          ...(generatedCode && { generatedCode }),
          'metadata.lastModified': new Date()
        }
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete session
router.delete('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user._id
      },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;