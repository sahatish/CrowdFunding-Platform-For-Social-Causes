import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, User, LogOut, LayoutDashboard, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'organizer') return '/organizer';
    return '/donor';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-brand-600 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
                <Heart className="h-6 font-bold" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-transparent">
                HopeFund
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className={`text-sm font-medium transition-colors ${
                isActive('/campaigns') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Explore Causes
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-full p-1"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:inline">{user.name}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-50 animate-soft-pulse">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-brand-600"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
                >
                  Start Raising
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-500 hover:text-slate-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-base font-medium ${
              isActive('/') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-base font-medium ${
              isActive('/campaigns') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Explore Causes
          </Link>

          {isAuthenticated ? (
            <div className="border-t border-slate-100 pt-2 mt-2">
              <div className="px-3 py-2 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-xl text-base font-medium text-white bg-brand-600 hover:bg-brand-700"
              >
                Start Raising
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
