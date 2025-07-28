import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Chat from '../components/Chat';
import ComponentPreview from '../components/ComponentPreview';
import CodeViewer from '../components/CodeViewer';
import { sessionsAPI, generateAPI, getToken, removeToken } from '../utils/api';
import toast from 'react-hot-toast';

export default function Playground() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [generatedCode, setGeneratedCode] = useState({ jsx: '', css: '', typescript: false });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadSessions();
  }, [router]);

  const loadSessions = async () => {
    try {
      const response = await sessionsAPI.getAll();
      setSessions(response.data);

      if (response.data.length > 0) {
        loadSession(response.data[0]._id);
      } else {
        createNewSession();
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const response = await sessionsAPI.getById(sessionId);
      const session = response.data;

      setCurrentSession(session);
      setChatHistory(session.chatHistory || []);
      setGeneratedCode(session.generatedCode || { jsx: '', css: '', typescript: false });
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
    }
  };

  const createNewSession = async (title = 'New Component') => {
    try {
      const response = await sessionsAPI.create({ title });
      const newSession = response.data;

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setChatHistory([]);
      setGeneratedCode({ jsx: '', css: '', typescript: false });

      toast.success('New session created');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
    }
  };

  const saveSession = async (updates = {}) => {
    if (!currentSession) return;

    try {
      const sessionData = {
        chatHistory,
        generatedCode,
        ...updates
      };

      await sessionsAPI.update(currentSession._id, sessionData);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleSendMessage = async (message, attachments = []) => {
    if (!currentSession || generating) return;

    setGenerating(true);

    try {
      const response = await generateAPI.generateComponent(currentSession._id, {
        prompt: message,
        attachments
      });

      setChatHistory(response.data.chatHistory);
      setGeneratedCode(response.data.generatedCode);

      setTimeout(() => saveSession(), 1000);
    } catch (error) {
      console.error('Failed to generate component:', error);
      toast.error('Failed to generate component');
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await sessionsAPI.delete(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));

      if (currentSession?._id === sessionId) {
        if (sessions.length > 1) {
          const remainingSessions = sessions.filter(s => s._id !== sessionId);
          loadSession(remainingSessions[0]._id);
        } else {
          createNewSession();
        }
      }

      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Layout
      sessions={sessions}
      currentSession={currentSession}
      onSessionSelect={loadSession}
      onNewSession={createNewSession}
      onDeleteSession={handleDeleteSession}
      onLogout={handleLogout}
    >
      <div className="playground-wrapper">
        <div className="chat-panel">
          <Chat
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            loading={generating}
          />
        </div>

        <div className="main-panel">
          <div className="preview-section">
            <ComponentPreview 
              jsx={generatedCode.jsx}
              css={generatedCode.css}
              typescript={generatedCode.typescript}
            />
          </div>

          <div className="code-section">
            <CodeViewer
              jsx={generatedCode.jsx}
              css={generatedCode.css}
              typescript={generatedCode.typescript}
              onCodeChange={(newCode) => {
                setGeneratedCode(newCode);
                saveSession();
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
