import { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ComponentPreview({ jsx, css, typescript }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (jsx) {
      renderComponent();
    }
  }, [jsx, css]);

  const renderComponent = async () => {
    setLoading(true);
    setError(null);
    try {
      const htmlContent = generatePreviewHTML(jsx, css);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlContent;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHTML = (jsxCode, cssCode) => {
    const transformedCode = transformJSX(jsxCode);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Component Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f9fafb;
    }
    #root {
      width: 100%;
      height: 100%;
    }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    ${transformedCode}
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component));
    } catch (error) {
      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">' +
        '<h3>Error rendering component:</h3>' + '<pre>' + error.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
  };

  const transformJSX = (code) => {
    let transformed = code;
    transformed = transformed.replace(/export\s+default\s+function\s+\w+/g, 'function Component');
    transformed = transformed.replace(/export\s+default\s+\w+/g, '');
    transformed = transformed.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    if (!transformed.includes('function Component')) {
      const match = transformed.match(/const\s+(\w+)\s*=\s*\(.*?\)\s*=>\s*{/);
      if (match) {
        transformed = transformed.replace(match[0], 'const Component = ' + match[0].substring(match[1].length + 6));
      } else {
        transformed = `function Component() {\n${transformed}\n}`;
      }
    }
    return transformed;
  };

  const handleRefresh = () => renderComponent();

  return (
    <div className="component-preview-container">
      <div className="component-preview-header">
        <h2>Preview</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`refresh-button ${loading ? 'spinning' : ''}`}
        >
          <RefreshCw className="icon" />
        </button>
      </div>

      <div className="component-preview-content">
        {!jsx && (
          <div className="no-component">
            <div className="no-component-box">
              <svg className="no-component-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="no-component-title">No component yet</p>
            <p className="no-component-desc">Start chatting to generate your first component</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <div>
                <h3 className="error-title">Preview Error</h3>
                <pre className="error-text">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {jsx && !error && (
          <iframe
            ref={iframeRef}
            className="component-preview-iframe"
            title="Component Preview"
            sandbox="allow-scripts"
          />
        )}

        {loading && (
          <div className="component-preview-loader">
            <div className="loader-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}
