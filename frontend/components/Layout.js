import { useState } from 'react';
import { User, Plus, Trash2, LogOut, Menu, X } from 'lucide-react';


export default function Layout({ 
  children, 
  sessions, 
  currentSession, 
  onSessionSelect, 
  onNewSession, 
  onDeleteSession,
  onLogout 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      {sidebarOpen && (
        <div className="mobile-overlay">
          <div className="overlay-background" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Component Generator</h1>
            <button onClick={() => setSidebarOpen(false)} className="sidebar-close-button">
              <X className="icon-small" />
            </button>
          </div>

          <div className="new-session">
            <button onClick={onNewSession} className="new-session-button">
              <Plus className="icon-tiny" />
              New Session
            </button>
          </div>

          <div className="sessions-list">
            <div className="sessions-inner">
              <h3 className="sessions-title">Recent Sessions</h3>
              <div className="session-items">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`session-item ${
                      currentSession?._id === session._id ? 'active' : ''
                    }`}
                    onClick={() => onSessionSelect(session._id)}
                  >
                    <div className="session-info">
                      <p className="session-name">{session.title}</p>
                      <p className="session-date">{new Date(session.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session._id);
                      }}
                      className="delete-button"
                    >
                      <Trash2 className="icon-tiny" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="logout-wrapper">
            <button onClick={onLogout} className="logout-button">
              <LogOut className="icon-tiny" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-button">
            <Menu className="icon-small" />
          </button>
          <h1 className="mobile-title">{currentSession?.title || 'Component Generator'}</h1>
        </div>

        {children}
      </div>
    </div>
  );
}
