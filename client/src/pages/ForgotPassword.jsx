import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage('Password reset link has been dispatched to your email address.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center space-y-3">
          <div className="inline-flex bg-brand-100 p-3 rounded-2xl text-brand-600">
            <Heart className="h-8 w-8 fill-brand-100" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="text-sm text-slate-500">Provide your registered email to request a reset link.</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 font-bold text-white rounded-xl shadow-lg transition-all text-sm flex justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
