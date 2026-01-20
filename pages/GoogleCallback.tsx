import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuthCodeFromUrl, 
  getAuthErrorFromUrl, 
  getRedirectOrigin, 
  clearRedirectOrigin 
} from '../utils/googleAuthRedirect';
import { googleLoginWithCode, saveToken } from '../utils/authApi';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memproses login...');

  const callbackProcessed = React.useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution in Strict Mode
      if (callbackProcessed.current) return;
      callbackProcessed.current = true;

      // Check for errors from Google
      const error = getAuthErrorFromUrl();
      if (error) {
        setStatus('error');
        setMessage(`Login dibatalkan atau gagal: ${error}`);
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      // Get authorization code
      const code = getAuthCodeFromUrl();
      if (!code) {
        setStatus('error');
        setMessage('Kode otorisasi tidak ditemukan');
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      // Clear URL to prevent re-use
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // Exchange code for token
        setMessage('Mengautentikasi dengan Google...');
        const response = await googleLoginWithCode(code);

        if (response.data?.token) {
          saveToken(response.data.token);
          setStatus('success');
          setMessage('Login berhasil! Mengalihkan...');

          // Get original redirect location
          const origin = getRedirectOrigin();
          clearRedirectOrigin();
          
          // Default to dashboard if origin is home or login page
          const target = (origin === '/' || origin === '' || !origin) ? '/dashboard' : origin;

          // Redirect to target
          window.location.href = target;
        } else {
          throw new Error('Token tidak ditemukan dalam response');
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Login gagal');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Loading Spinner */}
          {status === 'loading' && (
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Success Icon */}
          {status === 'success' && (
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Error Icon */}
          {status === 'error' && (
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          {/* Google Logo */}
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M24 12.27c0-.85-.07-1.68-.21-2.48H12v4.69h6.74a5.75 5.75 0 01-2.49 3.77v3.12h4.03c2.36-2.17 3.72-5.37 3.72-8.9z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-4.03-3.12c-1.11.74-2.54 1.18-3.91 1.18-3.01 0-5.56-2.04-6.47-4.78H1.36v3.2A11.99 11.99 0 0012 24z" />
              <path fill="#FBBC05" d="M5.53 14.38a7.22 7.22 0 010-4.61v-3.2H1.36a11.99 11.99 0 000 11.01l4.17-3.2z" />
              <path fill="#4285F4" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44A11.97 11.97 0 0012 0C7.32 0 3.32 2.69 1.36 6.58l4.17 3.2c.91-2.74 3.46-4.78 6.47-4.78z" />
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {status === 'loading' && 'Google Sign-In'}
            {status === 'success' && 'Login Berhasil!'}
            {status === 'error' && 'Login Gagal'}
          </h2>
          <p className="text-slate-600 font-medium">{message}</p>

          {/* Manual redirect button for errors */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              Kembali ke Beranda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
