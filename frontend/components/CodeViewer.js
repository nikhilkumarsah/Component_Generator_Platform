import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Download, Edit3, Check } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';


export default function CodeViewer({ jsx, css, typescript, onCodeChange }) {
  const [activeTab, setActiveTab] = useState('jsx');
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'jsx', label: typescript ? 'TSX' : 'JSX', content: jsx },
    { id: 'css', label: 'CSS', content: css }
  ];

  const handleCopy = async () => {
    const currentContent = tabs.find(tab => tab.id === activeTab)?.content || '';
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = async () => {
    if (!jsx && !css) return toast.error('No code to download');

    try {
      const zip = new JSZip();
      if (jsx) zip.file(typescript ? 'Component.tsx' : 'Component.jsx', jsx);
      if (css) zip.file('Component.css', css);

      zip.file('package.json', JSON.stringify({
        name: 'generated-component',
        version: '1.0.0',
        description: 'Generated React component',
        main: typescript ? 'Component.tsx' : 'Component.jsx',
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        devDependencies: typescript ? {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          typescript: '^5.0.0'
        } : {}
      }, null, 2));

      zip.file('README.md', `# Generated Component

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`${typescript ? 'tsx' : 'jsx'}
import Component from './Component';

function App() {
  return <Component />;
}
\`\`\`
`);
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'component.zip');
      toast.success('Component downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download component');
    }
  };

  const handleEdit = () => {
    const currentContent = tabs.find(tab => tab.id === activeTab)?.content || '';
    setEditableCode(currentContent);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const newCode = { jsx, css, typescript };
    newCode[activeTab] = editableCode;
    onCodeChange(newCode);
    setIsEditing(false);
    toast.success('Code updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableCode('');
  };

  const currentContent = tabs.find(tab => tab.id === activeTab)?.content || '';

  return (
    <div className="code-container">
      {/* Header */}
      <div className="code-header">
        <div className="code-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`code-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="code-actions">
          {!isEditing ? (
            <>
              <button onClick={handleEdit} disabled={!currentContent} title="Edit code" className="icon-btn">
                <Edit3 />
              </button>
              <button onClick={handleCopy} disabled={!currentContent} title="Copy code" className="icon-btn">
                {copied ? <Check className="copied" /> : <Copy />}
              </button>
              <button onClick={handleDownload} disabled={!jsx && !css} title="Download ZIP" className="icon-btn">
                <Download />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSaveEdit} className="btn-save">Save</button>
              <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Code area */}
      <div className="code-content">
        {!currentContent ? (
          <div className="code-empty">
            <div className="empty-icon">
              <svg className="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="empty-title">No {activeTab.toUpperCase()} code</p>
            <p className="empty-sub">Generate a component to see the code here</p>
          </div>
        ) : isEditing ? (
          <div className="code-edit-wrapper">
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="code-textarea"
              placeholder={`Enter ${activeTab.toUpperCase()} code...`}
            />
          </div>
        ) : (
          <div className="code-preview">
            <SyntaxHighlighter
              language={activeTab === 'jsx' ? 'jsx' : 'css'}
              style={tomorrow}
              customStyle={{ margin: 0, background: '#f8f9fa' }}
              showLineNumbers
              wrapLines
            >
              {currentContent}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
