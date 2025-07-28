import { useState, useRef, useEffect } from 'react';
import { Send, Image, User, Bot } from 'lucide-react';


export default function Chat({ messages, onSendMessage, loading }) {
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    onSendMessage(inputMessage.trim(), attachments);
    setInputMessage('');
    setAttachments([]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => [...prev, {
            name: file.name,
            data: e.target.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h2 className="chat-header-title">Chat</h2>
        <p className="chat-header-description">Describe the component you want to create</p>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-no-messages">
            <Bot className="bot-icon" />
            <p className="chat-no-messages-title">Start a conversation</p>
            <p className="chat-no-messages-description">Describe the React component you'd like to create and I'll generate it for you.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message-container ${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            {message.role === 'assistant' && (
              <div className="chat-message-avatar assistant">
                <Bot className="icon" />
              </div>
            )}
            
            <div className={`chat-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>
              <p className="chat-bubble-content">{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="chat-message-attachments">
                  {message.attachments.map((attachment, i) => (
                    <img
                      key={i}
                      src={attachment.data || attachment}
                      alt={attachment.name || `Attachment ${i + 1}`}
                      className="chat-message-attachments-image" // Added a specific class for the image
                    />
                  ))}
                </div>
              )}
              <p className="chat-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="chat-message-avatar user">
                <User className="icon" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message-container assistant">
            <div className="chat-message-avatar assistant">
              <Bot className="icon" />
            </div>
            <div className="chat-bubble assistant">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((attachment, index) => (
              <div key={index} className="attachment-item">
                <img
                  src={attachment.data}
                  alt={attachment.name}
                  className="attachment-item-image" // Added a specific class for the image
                />
                <button
                  onClick={() => removeAttachment(index)}
                  className="remove-attachment-button"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="file-input"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="image-upload-button"
          >
            <Image className="icon" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your component..."
            disabled={loading}
            className="message-input"
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="send-button"
          >
            <Send className="icon" />
          </button>
        </form>
      </div>
    </div>
  );
}