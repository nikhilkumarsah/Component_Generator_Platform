import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authAPI, setToken } from '../utils/api';
import toast from 'react-hot-toast';


export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setToken(response.data.token);
      toast.success('Login successful!');
      router.push('/playground');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="text-center">
          <h2 className="login-title">Sign in to your account</h2>
          <p className="login-subtext">
            Or{' '}
            <Link href="/signup" className="link">
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="login-form-wrapper">
        <div className="login-form-box">
          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}