import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getToken } from '../utils/api';


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      router.push('/playground');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="inner-container">
        <div className="text-center">
          <h1 className="main-title">Component Generator Platform</h1>
          <p className="subtitle">
            Build, iterate, and export React components with AI assistance. 
            Create beautiful, functional components through natural conversation.
          </p>
          <div className="button-group">
            <Link href="/login" className="btn-primary">Get Started</Link>
            <Link href="/signup" className="btn-secondary">Sign Up</Link>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box blue">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="feature-title">AI-Powered Generation</h3>
            <p className="feature-text">
              Describe your component in natural language and watch as AI generates clean, modern React code.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box green">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="feature-title">Live Preview</h3>
            <p className="feature-text">
              See your components come to life instantly with real-time rendering and interactive previews.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box purple">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="feature-title">Export & Share</h3>
            <p className="feature-text">
              Export your components as clean, production-ready code files or share them with your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}