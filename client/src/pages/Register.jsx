import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, email, password, role, phone);
    setLoading(false);

    if (res?.success) {
      setTimeout(() => {
        if (res.role === 'admin') {
          navigate('/admin');
        } else if (res.role === 'organizer') {
          navigate('/organizer');
        } else {
          navigate('/donor');
        }
      }, 300);
    } else {
      setError(res?.message || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-brand-100 p-3 rounded-2xl text-brand-600">
            <Heart className="h-8 w-8 fill-brand-100" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500">Join HopeFund to support or launch social campaigns.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name / Org Name"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">I want to be a</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="donor">Donor (Support causes)</option>
                <option value="organizer">Organizer (Raise funds)</option>
                <option value="admin">Admin (Verify/Manage)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 font-bold text-white rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all text-sm flex justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
