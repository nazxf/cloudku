import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getRedirectOrigin, 
  clearRedirectOrigin 
} from '../utils/googleAuthRedirect'; // Reusing generic redirect logic
import { githubLogin, saveToken } from '../utils/authApi';

const GithubCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memproses login GitHub...');

  const callbackProcessed = React.useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution in Strict Mode
      if (callbackProcessed.current) return;
      callbackProcessed.current = true;

      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      // Check for errors from GitHub
      if (error) {
        setStatus('error');
        setMessage(`Login dibatalkan atau gagal: ${error}`);
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

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
        setMessage('Mengautentikasi dengan GitHub...');
        const response = await githubLogin(code);

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
        console.error('GitHub callback error:', err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Loading Spinner */}
          {status === 'loading' && (
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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

          {/* GitHub Logo */}
          <div className="mb-4 flex justify-center">
             <svg height="48" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="48" data-view-component="true" className="octicon octicon-mark-github">
                <path fill="#24292f" d="M8 0c4.42 0 8 3.98 8 8 0 3.54-2.29 6.53-5.47 7.59-.4.07-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {status === 'loading' && 'GitHub Login'}
            {status === 'success' && 'Login Berhasil!'}
            {status === 'error' && 'Login Gagal'}
          </h2>
          <p className="text-slate-600 font-medium">{message}</p>

          {/* Manual redirect button for errors */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
            >
              Kembali ke Beranda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GithubCallback;
