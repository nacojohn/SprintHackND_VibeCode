import React, { useState } from 'react';
import { auth } from '../firebase';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
// FIX: Removed v9 modular imports. Authentication methods will be called from the `auth` object, and GoogleAuthProvider will be accessed from the `firebase` object.
import firebase from 'firebase/compat/app';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.582-3.333-11.227-7.914l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C42.012 35.816 44 30.225 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // FIX: Changed to v8 compat syntax for signInWithEmailAndPassword.
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Changed to v8 compat syntax for GoogleAuthProvider and signInWithPopup.
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
                <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
                 <h1 className="text-2xl font-bold text-gray-800">OSDR AI Agent</h1>
            </div>
          <h2 className="text-2xl font-bold text-gray-700">Welcome Back</h2>
          <p className="text-gray-500">Sign in to access the dashboard</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="relative">
             <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          
          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:bg-blue-400"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative px-2 bg-white text-sm text-gray-500">Or continue with</div>
        </div>

        <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:bg-gray-200"
        >
            <GoogleIcon />
            <span className="ml-3 font-semibold text-gray-700">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
