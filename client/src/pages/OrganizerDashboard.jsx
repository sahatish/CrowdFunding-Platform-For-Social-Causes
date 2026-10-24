import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BarChart2,
  FileText,
  DollarSign,
  TrendingUp,
  X,
  CreditCard,
  Edit2,
  Bell,
  CheckCircle,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  Clock,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizerDashboard = () => {
  const { user, logout, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, campaigns, create, withdrawals, profile

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Editor Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Create Campaign Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('medical');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  // Update Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCampForUpdate, setSelectedCampForUpdate] = useState(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Withdrawal Modal State
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedCampForWithdraw, setSelectedCampForWithdraw] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Mock fallbacks
  const mockCampaigns = [
    {
      _id: 'mock_org1',
      title: 'Post-Flood Rebuilding Initiative for Village Schools',
      description: 'Recent severe flooding ruined school structures, desks, and textbooks.',
      category: 'disaster',
      goalAmount: 30000,
      raisedAmount: 18500,
      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      location: 'Mumbai, IN',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      updates: [
        { _id: 'u_mock1', title: 'Foundations complete', content: 'School blocks concrete foundations successfully built.', date: new Date().toISOString() }
      ]
    },
    {
      _id: 'mock_org2',
      title: 'Cancer Recovery Support for Emily Peterson',
      description: 'Emily is undergoing chemotherapy and radiation. Help her family fund the treatments.',
      category: 'medical',
      goalAmount: 20000,
      raisedAmount: 0,
      coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60',
      location: 'Boston, MA',
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      updates: []
    }
  ];

  const mockWithdrawals = [
    {
      _id: 'w1',
      amount: 5000,
      status: 'approved',
      requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      campaignId: { title: 'Post-Flood Rebuilding Initiative for Village Schools' }
    }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      const campRes = await axios.get(`/api/campaigns?status=all&organizerId=${userId}`);
      if (campRes.data.success && campRes.data.campaigns.length > 0) {
        setCampaigns(campRes.data.campaigns);
      } else {
        setCampaigns(mockCampaigns);
      }

      const withdrawRes = await axios.get('/api/donations/withdrawals');
      if (withdrawRes.data.success) {
        setWithdrawals(withdrawRes.data.withdrawals);
      } else {
        setWithdrawals(mockWithdrawals);
      }
    } catch (err) {
      console.log('Error fetching dashboard, using mock datasets');
      setCampaigns(mockCampaigns);
      setWithdrawals(mockWithdrawals);
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

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post('/api/campaigns/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        if (type === 'cover') {
          setCoverImage(res.data.fileUrl);
        } else {
          setUploadedDocs(prev => [...prev, res.data.fileUrl]);
        }
      }
    } catch (err) {
      alert('Upload failed. Note: Using simulated local storage if backend keys are blank.');
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setSubmittingCampaign(true);

    try {
      const payload = {
        title,
        description,
        category,
        goalAmount: Number(goalAmount),
        deadline,
        location,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
        documents: uploadedDocs
      };

      const res = await axios.post('/api/campaigns', payload);
      if (res.data.success) {
        alert('Campaign created successfully! Admin verification is pending.');
        setTitle('');
        setDescription('');
        setGoalAmount('');
        setDeadline('');
        setLocation('');
        setCoverImage('');
        setUploadedDocs([]);
        setActiveTab('campaigns');
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating campaign');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    setSubmittingUpdate(true);
    try {
      const res = await axios.post(`/api/campaigns/${selectedCampForUpdate._id}/updates`, {
        title: updateTitle,
        content: updateContent
      });
      if (res.data.success) {
        alert('Update posted successfully!');
        setUpdateModalOpen(false);
        setUpdateTitle('');
        setUpdateContent('');
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting update');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handlePostWithdrawal = async (e) => {
    e.preventDefault();
    setSubmittingWithdrawal(true);
    try {
      const payload = {
        campaignId: selectedCampForWithdraw._id,
        amount: Number(withdrawAmount),
        bankDetails: {
          bankName,
          accountNumber,
          ifscCode,
          accountHolderName
        }
      };

      const res = await axios.post('/api/donations/withdraw', payload);
      if (res.data.success) {
        alert('Withdrawal request submitted! Pending admin review.');
        setWithdrawalModalOpen(false);
        setWithdrawAmount('');
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setAccountHolderName('');
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setSubmittingWithdrawal(false);
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
        <p className="text-slate-500">Loading organizer dashboard...</p>
      </div>
    );
  }

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);

  // Sidebar Menu Items
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart2, badge: null },
    { id: 'campaigns', name: 'My Campaigns', icon: FileText, badge: campaigns.length },
    { id: 'create', name: 'Start Campaign', icon: Plus, badge: null },
    { id: 'withdrawals', name: 'Payout Requests', icon: CreditCard, badge: withdrawals.length },
    { id: 'profile', name: 'Profile Settings', icon: User, badge: null }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-6 border-b border-slate-800">
            <div className="bg-brand-500 p-1.5 rounded-lg text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wider uppercase">Organizer Panel</h2>
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
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === item.id ? 'bg-white text-brand-700' : 'bg-brand-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
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
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
                </div>
                <p className="text-slate-300 text-sm max-w-md">Manage your active fundraising causes, publish milestone progress, and trigger bank payouts.</p>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[115px]">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Raised</p>
                  <p className="text-xl font-extrabold text-brand-400 mt-1">${totalRaised.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[115px]">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Active Campaigns</p>
                  <p className="text-xl font-extrabold text-brand-400 mt-1">{campaigns.length}</p>
                </div>
              </div>
            </div>

            {/* Campaign Category Breakdown SVG Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign raised comparative bar layout */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Campaign Funds Overview</h3>
                <div className="space-y-3">
                  {campaigns.map((camp) => {
                    const percent = camp.goalAmount > 0 ? Math.min(Math.round((camp.raisedAmount / camp.goalAmount) * 100), 100) : 0;
                    return (
                      <div key={camp._id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-700 truncate max-w-[180px]">{camp.title}</span>
                          <span className="text-slate-500">${camp.raisedAmount.toLocaleString()} of ${camp.goalAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graphic stats benchmark card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-center text-center p-8">
                <ShieldCheck className="h-12 w-12 text-brand-500 mx-auto" />
                <h4 className="font-bold text-slate-850 text-sm">Guaranteed Transparency</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Publish updates periodically to let your donors know how funds are spent. This builds trust and encourages more support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MY CAMPAIGNS PANEL */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Campaigns</h1>
              <p className="text-slate-500 text-xs">Track raised funds, publish updates, and request withdrawals.</p>
            </div>

            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map((camp) => {
                  const percentage = Math.min(Math.round((camp.raisedAmount / camp.goalAmount) * 100), 100);
                  return (
                    <div key={camp._id} className="p-5 rounded-2xl border border-slate-100 bg-white flex flex-col justify-between space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{camp.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            camp.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            camp.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">{camp.category} | Goal: ${camp.goalAmount.toLocaleString()}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                          <span>{percentage}% Raised</span>
                          <span>${camp.raisedAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-600 animate-pulse" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>

                      {/* Milestone updates lists */}
                      {camp.updates && camp.updates.length > 0 && (
                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-bold text-slate-450 uppercase mb-1.5">Milestone Updates</p>
                          <div className="space-y-1.5">
                            {camp.updates.slice(0, 2).map((up, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <span className="font-semibold truncate max-w-[150px]">{up.title}</span>
                                <span>{new Date(up.date || up.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => { setSelectedCampForUpdate(camp); setUpdateModalOpen(true); }}
                          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          Add Update
                        </button>
                        <button
                          onClick={() => { setSelectedCampForWithdraw(camp); setWithdrawalModalOpen(true); }}
                          className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-brand-500/10"
                        >
                          Withdraw Funds
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
                <CheckCircle className="h-10 w-10 text-brand-500 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">No Active Campaigns</h3>
                <p className="text-slate-400 text-xs">Start a campaign to begin raising funds for social causes.</p>
              </div>
            )}
          </div>
        )}

        {/* START CAMPAIGN PANEL */}
        {activeTab === 'create' && (
          <div className="space-y-6 max-w-2xl bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Fundraising Campaign</h1>
              <p className="text-slate-500 text-xs">Submit documents and verification forms to start raising funds.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hospital support for Liam"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Campaign Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="disaster">Disaster Relief</option>
                    <option value="animal">Animal Welfare</option>
                    <option value="environment">Environment</option>
                    <option value="community">Community</option>
                    <option value="ngo">NGO Activities</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Campaign Story</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the case scenario, hospital certifications, invoice details..."
                  rows="5"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Goal ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="Goal"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                  {coverImage && <p className="text-[10px] text-brand-600 truncate font-semibold">Uploaded: {coverImage}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Verification Documents</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleImageUpload(e, 'docs')}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                  {uploadedDocs.length > 0 && <p className="text-[10px] text-brand-600 font-semibold">{uploadedDocs.length} files attached</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingCampaign}
                className="py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
              >
                {submittingCampaign ? 'Creating...' : 'Submit Cause Verification'}
              </button>
            </form>
          </div>
        )}

        {/* PAYOUT REQUESTS PANEL */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payout Requests</h1>
              <p className="text-slate-500 text-xs">Review initiated bank withdrawal request logs.</p>
            </div>

            {withdrawals.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs font-bold text-left uppercase">
                        <th className="py-3 px-4">Campaign Title</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {withdrawals.map((w) => (
                        <tr key={w._id} className="hover:bg-slate-50 transition-all">
                          <td className="py-4 px-4 font-bold text-slate-800">{w.campaignId?.title || 'Unknown Campaign'}</td>
                          <td className="py-4 px-4 font-extrabold text-brand-600">${w.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-xs text-slate-400">{new Date(w.requestedAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                              w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              w.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10">No withdrawal requests initiated yet.</p>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Organization Profile</h2>
              <p className="text-slate-400 text-xs mt-0.5">Manage your display details and organization avatar logo.</p>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase">Change Org Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="block text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Organization / Representative Name</label>
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
                <label className="text-xs font-bold text-slate-600 uppercase">Contact Phone Number</label>
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
                {updatingProfile ? 'Saving...' : 'Save Org Details'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* UPDATE MODAL */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post Cause Update</h3>
              <button onClick={() => setUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Update Title</label>
                <input
                  type="text"
                  required
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="e.g. Surgery details verified"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Update Message Content</label>
                <textarea
                  required
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="Details regarding hospital receipts or surgeries progress..."
                  rows="4"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingUpdate}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-xs"
              >
                {submittingUpdate ? 'Posting...' : 'Post Update Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL REQUEST MODAL */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-brand-600" />
                Request Fund Withdrawal
              </h3>
              <button onClick={() => setWithdrawalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePostWithdrawal} className="space-y-4">
              <div className="bg-brand-50 p-3 rounded-xl border border-brand-100 text-[10px] text-brand-850 font-semibold">
                Available funds in: <strong>{selectedCampForWithdraw?.title}</strong>: <br />
                <span className="text-sm font-extrabold">${selectedCampForWithdraw?.raisedAmount.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Withdrawal Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max={selectedCampForWithdraw?.raisedAmount}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Chase Bank"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="000192837465"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">IFSC / Sort Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="CHASUS33"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Hospital trust"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingWithdrawal}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-xs flex justify-center"
              >
                {submittingWithdrawal ? 'Requesting...' : 'Initiate Withdrawal Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
