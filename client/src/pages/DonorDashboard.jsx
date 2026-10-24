import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  CreditCard,
  Award,
  Printer,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  LogOut,
  BarChart2,
  User,
  Coffee,
  CheckSquare,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DonorDashboard = () => {
  const { user, logout, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, donations, bookmarks, profile
  const [donations, setDonations] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Editor Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Mock fallbacks
  const mockDonations = [
    {
      _id: 'd_m1',
      amount: 150,
      paymentId: 'ch_8a2d9f1c3',
      donatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      campaignId: {
        _id: 'mock1',
        title: 'Emergency Heart Surgery for 5-Year-Old Liam',
        category: 'medical'
      }
    },
    {
      _id: 'd_m2',
      amount: 50,
      paymentId: 'ch_4v7s3w8x2',
      donatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      campaignId: {
        _id: 'mock3',
        title: 'Underprivileged Children STEM Education Kits',
        category: 'education'
      }
    }
  ];

  const mockBookmarks = [
    {
      _id: 'mock1',
      title: 'Emergency Heart Surgery for 5-Year-Old Liam',
      category: 'medical',
      goalAmount: 45000,
      raisedAmount: 32000,
      coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60',
      location: 'New York, NY',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizerId: { name: 'Hospital Trust' }
    }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Fetch donations
      const res = await axios.get(`/api/donations?donorId=${user.id || user._id}`);
      if (res.data.success && res.data.donations.length > 0) {
        setDonations(res.data.donations);
      } else {
        setDonations(mockDonations);
      }

      // Fetch bookmarks
      const bookmarkRes = await axios.get('/api/auth/bookmarks');
      if (bookmarkRes.data.success) {
        setBookmarks(bookmarkRes.data.bookmarks);
      } else {
        setBookmarks(mockBookmarks);
      }
    } catch (err) {
      console.log('Error fetching donations, using offline mock data');
      setDonations(mockDonations);
      setBookmarks(mockBookmarks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post('/api/campaigns/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfileImage(res.data.fileUrl);
      }
    } catch (err) {
      alert('Upload failed. Fallback to server directories.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await axios.put('/api/auth/profile', {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        profileImage
      });
      if (res.data.success) {
        alert('Profile details updated successfully!');
        reloadUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500">Loading donor statistics...</p>
      </div>
    );
  }

  const totalDonated = donations.reduce((sum, item) => sum + item.amount, 0);

  // Impact calculations
  const mealsProvided = Math.floor(totalDonated / 10);
  const healthCheckups = Math.floor(totalDonated / 100);
  const educationYears = Math.floor(totalDonated / 500);

  // Sidebar Menu Items
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart2 },
    { id: 'donations', name: 'My Donations', icon: CreditCard },
    { id: 'bookmarks', name: 'Saved Causes', icon: Bookmark },
    { id: 'profile', name: 'Profile Settings', icon: User }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-6 border-b border-slate-800">
            <div className="bg-brand-500 p-1.5 rounded-lg text-white">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wider uppercase">Donor Panel</h2>
              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT PANEL */}
      <main className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
                </div>
                <p className="text-slate-300 text-sm max-w-md">Thank you for making a social impact. View your donation receipts and transactions below.</p>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Donated</p>
                  <p className="text-xl font-extrabold text-brand-400 mt-1">${totalDonated}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Donations</p>
                  <p className="text-xl font-extrabold text-brand-400 mt-1">{donations.length}</p>
                </div>
              </div>
            </div>

            {/* Impact Calculator widgets */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Your Social Contribution Impact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-2xl text-slate-800">{mealsProvided}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nutritious Meals Funded</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-2xl text-slate-800">{healthCheckups}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Medical Kits Sponsored</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-2xl text-slate-800">{educationYears}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">School Years Funded</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center text-center p-8 space-y-3">
                <Award className="h-12 w-12 text-brand-500 mx-auto" />
                <h4 className="font-bold text-slate-850 text-sm">Empowering Causes</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your contributions go directly towards medical surgeries, rural school supplies, or stray animal shelters. Every cent changes lives.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Recent Contributions</h3>
                <div className="space-y-3 text-xs">
                  {donations.slice(0, 3).map((don) => (
                    <div key={don._id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-semibold text-slate-700 truncate max-w-[180px]">{don.campaignId?.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(don.donatedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-brand-600">${don.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DONATIONS HISTORIES TAB */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Donation History & Tax Receipts</h2>
              <p className="text-slate-400 text-xs mt-0.5">Click Print to generate your custom tax deduction receipt letters.</p>
            </div>

            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold text-left uppercase">
                      <th className="py-3 px-4">Cause Description</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Receipts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                    {donations.map((don) => (
                      <tr key={don._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <Link to={`/campaigns/${don.campaignId?._id}`} className="hover:underline text-slate-850 font-bold flex items-center gap-1 text-sm">
                            {don.campaignId?.title}
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </Link>
                          <span className="inline-block mt-0.5 text-[9px] uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                            {don.campaignId?.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-brand-600 text-sm">${don.amount}</td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">{don.paymentId}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(don.donatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <a
                            href={`/api/donations/receipt/${don._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-100 transition-colors"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print / PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10">No past donations found. Start exploring causes to make your first donation!</p>
            )}
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Saved Causes</h2>
              <p className="text-slate-400 text-xs mt-0.5">Quick access to social causes you want to follow and support.</p>
            </div>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookmarks.map((camp) => {
                  const percentage = Math.min(Math.round((camp.raisedAmount / camp.goalAmount) * 100), 100);
                  return (
                    <div key={camp._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{camp.title}</h3>
                        <p className="text-[10px] text-brand-600 font-bold uppercase mt-1">{camp.category} | Location: {camp.location}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                          <span>{percentage}% Raised</span>
                          <span>${camp.raisedAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-600" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>

                      <Link
                        to={`/campaigns/${camp._id}`}
                        className="py-2 text-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                      >
                        View Campaign
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
                <Bookmark className="h-10 w-10 text-brand-500 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">No Saved Campaigns</h3>
                <p className="text-slate-400 text-xs">Bookmark campaigns from their details page to follow their progress here.</p>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Profile Details</h2>
              <p className="text-slate-400 text-xs mt-0.5">Manage your display configurations and avatar image.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Profile image picker */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-600 text-xl shadow-inner">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profileName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Change Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="block text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Display Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorDashboard;
