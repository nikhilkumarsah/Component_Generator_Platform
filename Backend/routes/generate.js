const express = require('express');
const axios = require('axios');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const generateComponent = async (prompt, chatHistory = []) => {
  const systemPrompt = `You are an expert React component generator. Generate clean, modern, and functional React components based on user requirements.

Rules:
1. Always return valid JSX/TSX code
2. Include necessary CSS styles
3. Use modern React patterns (hooks, functional components)
4. Make components responsive and accessible
5. Include proper prop types and TypeScript when requested
6. Return ONLY the code, no explanations unless specifically asked

Format your response as:
\`\`\`jsx
// Component code here
\`\`\`

\`\`\`css
/* CSS styles here */
\`\`\``;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: prompt }
  ];

  try {
    const response = await axios.post(OPENROUTER_URL, {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Component Generator'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate component');
  }
};

// Generate component
router.post('/:sessionId', auth, async (req, res) => {
  try {
    const { prompt, attachments } = req.body;
    const { sessionId } = req.params;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get session
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add user message to chat history
    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      attachments: attachments || []
    };

    // Generate component
    const generatedContent = await generateComponent(prompt, session.chatHistory);

    // Parse generated content
    const jsxMatch = generatedContent.match(/```(?:jsx|tsx|javascript|typescript)\n([\s\S]*?)\n```/);
    const cssMatch = generatedContent.match(/```css\n([\s\S]*?)\n```/);

    const jsx = jsxMatch ? jsxMatch[1] : generatedContent;
    const css = cssMatch ? cssMatch[1] : '';

    // Add assistant message to chat history
    const assistantMessage = {
      role: 'assistant',
      content: generatedContent,
      timestamp: new Date()
    };

    // Update session
    session.chatHistory.push(userMessage, assistantMessage);
    session.generatedCode = {
      jsx: jsx,
      css: css,
      typescript: prompt.includes('typescript') || prompt.includes('tsx')
    };
    session.metadata.lastModified = new Date();

    await session.save();

    res.json({
      message: generatedContent,
      generatedCode: session.generatedCode,
      chatHistory: session.chatHistory
    });
  } catch (error) {
    console.error('Generate component error:', error);
    res.status(500).json({ error: 'Failed to generate component' });
  }
});

module.exports = router;