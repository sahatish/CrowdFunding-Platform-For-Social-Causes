import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  UserX,
  CreditCard,
  Check,
  X,
  TrendingUp,
  Award,
  BarChart3,
  LogOut,
  ChevronRight,
  Settings,
  Activity,
  Calendar,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, verification, reports, withdrawals, users, audit, config

  // Data states
  const [stats, setStats] = useState(null);
  const [campaignQueue, setCampaignQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration settings (simulated via localStorage / State)
  const [platformFee, setPlatformFee] = useState(localStorage.getItem('platform_fee') || '5');
  const [minPayout, setMinPayout] = useState(localStorage.getItem('min_payout') || '100');
  const [requireKyc, setRequireKyc] = useState(localStorage.getItem('require_kyc') === 'true');
  const [autoEmailAlerts, setAutoEmailAlerts] = useState(localStorage.getItem('auto_email_alerts') !== 'false');

  // User Profile Audit Modal
  const [auditUser, setAuditUser] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Mock fallbacks
  const mockStats = {
    totalUsers: 142,
    totalCampaigns: 48,
    pendingCampaigns: 2,
    activeCampaigns: 41,
    completedCampaigns: 5,
    totalRaised: 184500,
    totalDonationsCount: 1205,
    reportsCount: 1,
    raisedByCategory: {
      medical: 85000,
      education: 45000,
      disaster: 30000,
      animal: 12000,
      environment: 8000,
      community: 4500,
      ngo: 2000,
      other: 1000
    }
  };

  const mockQueue = [
    {
      _id: 'q1',
      title: 'Cancer Recovery Support for Emily Peterson',
      category: 'medical',
      goalAmount: 20000,
      raisedAmount: 0,
      location: 'Boston, MA',
      organizerId: { name: 'Peter Peterson', email: 'peter@family.org' },
      status: 'pending'
    },
    {
      _id: 'q2',
      title: 'Save the Wetlands Wildlife Habitat',
      category: 'environment',
      goalAmount: 12000,
      raisedAmount: 0,
      location: 'Miami, FL',
      organizerId: { name: 'Green Earth Activists', email: 'green@earth.org' },
      status: 'pending'
    }
  ];

  const mockReports = [
    {
      _id: 'r1',
      campaignId: { _id: 'mock1', title: 'Emergency Heart Surgery for 5-Year-Old Liam', status: 'active' },
      reportedBy: { name: 'Mark Vance', email: 'vance.m@mail.com' },
      reason: 'This campaign is using pictures of a child from another fundraising platform. Need verify documents.',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];

  const mockWithdrawals = [
    {
      _id: 'w1',
      campaignId: { title: 'Post-Flood Rebuilding Initiative for Village Schools' },
      organizerId: { name: 'Shine Foundation NGO', email: 'shine@foundation.org' },
      amount: 12000,
      bankDetails: {
        bankName: 'Chase Bank',
        accountNumber: '9900223311',
        ifscCode: 'CHASUS33',
        accountHolderName: 'Shine NGO Trust'
      },
      status: 'pending'
    }
  ];

  const mockUsers = [
    { _id: 'u1', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@hospitaltrust.org', role: 'organizer', isVerified: true, createdAt: new Date().toISOString() },
    { _id: 'u2', name: 'Alice Vance', email: 'alice.v@mail.com', role: 'donor', isVerified: true, createdAt: new Date().toISOString() },
    { _id: 'u3', name: 'Fake Organizer', email: 'fake@spammer.org', role: 'organizer', isVerified: false, createdAt: new Date().toISOString() }
  ];

  const mockAuditLogs = [
    { _id: 'a1', action: 'Verify Campaign', performedBy: 'Admin Team', details: 'Approved campaign "Save the Wetlands Habitat"', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { _id: 'a2', action: 'Handle Withdrawal', performedBy: 'Admin Team', details: 'Approved payout of $12,000 for Shine NGO', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
  ];

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const statsRes = await axios.get('/api/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      } else {
        setStats(mockStats);
      }

      const campRes = await axios.get('/api/campaigns?status=pending');
      if (campRes.data.success) {
        setCampaignQueue(campRes.data.campaigns);
      } else {
        setCampaignQueue(mockQueue);
      }

      const reportRes = await axios.get('/api/admin/reports');
      if (reportRes.data.success) {
        setReports(reportRes.data.reports);
      } else {
        setReports(mockReports);
      }

      const withdrawRes = await axios.get('/api/donations/withdrawals');
      if (withdrawRes.data.success) {
        const pendW = withdrawRes.data.withdrawals.filter(w => w.status === 'pending');
        setWithdrawals(pendW.length > 0 ? pendW : withdrawRes.data.withdrawals);
      } else {
        setWithdrawals(mockWithdrawals);
      }

      const usersRes = await axios.get('/api/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      } else {
        setUsersList(mockUsers);
      }

      const auditRes = await axios.get('/api/admin/audit-logs');
      if (auditRes.data.success) {
        setAuditLogs(auditRes.data.logs);
      } else {
        setAuditLogs(mockAuditLogs);
      }
    } catch (err) {
      console.log('Error loading administrative lists, mapping mock fallbacks');
      setStats(mockStats);
      setCampaignQueue(mockQueue);
      setReports(mockReports);
      setWithdrawals(mockWithdrawals);
      setUsersList(mockUsers);
      setAuditLogs(mockAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const handleVerifyCampaign = async (id, status) => {
    try {
      const res = await axios.put(`/api/admin/verify-campaign/${id}`, { status });
      if (res.data.success) {
        alert(`Campaign status updated to ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      const res = await axios.put(`/api/admin/reports/${id}`, { status });
      if (res.data.success) {
        alert(`Report marked as ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating report status.');
    }
  };

  const handleWithdrawalRequest = async (id, status) => {
    try {
      const res = await axios.put(`/api/admin/withdrawals/${id}`, { status });
      if (res.data.success) {
        alert(`Payout status updated to ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payout request.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to block/delete this user directory account?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        alert('User account deleted/blocked successfully!');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting account.');
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('platform_fee', platformFee);
    localStorage.setItem('min_payout', minPayout);
    localStorage.setItem('require_kyc', requireKyc);
    localStorage.setItem('auto_email_alerts', autoEmailAlerts);
    alert('System settings updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500">Loading admin operations panel...</p>
      </div>
    );
  }

  const activeStats = stats || mockStats;

  // Sidebar Menu items list
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3, badge: 0 },
    { id: 'verification', name: 'Verification Queue', icon: AlertTriangle, badge: campaignQueue.length },
    { id: 'reports', name: 'Report Tickets', icon: ShieldAlert, badge: reports.length },
    { id: 'withdrawals', name: 'Payout Requests', icon: CreditCard, badge: withdrawals.length },
    { id: 'users', name: 'User Directory', icon: Users, badge: 0 },
    { id: 'audit', name: 'Audit Logs', icon: Activity, badge: 0 },
    { id: 'config', name: 'Platform Settings', icon: Settings, badge: 0 }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-6 border-b border-slate-800">
            <div className="bg-brand-500 p-1.5 rounded-lg text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wider uppercase">Admin Control</h2>
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
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Analytics</h1>
              <p className="text-slate-500 text-xs">System-wide monitoring dashboard for fundraising operations.</p>
            </div>

            {/* Stats Cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Raised</p>
                  <p className="text-lg font-extrabold text-slate-800">${activeStats.totalRaised.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Campaigns</p>
                  <p className="text-lg font-extrabold text-slate-800">{activeStats.totalCampaigns}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pending verification</p>
                  <p className="text-lg font-extrabold text-slate-800">{campaignQueue.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Registered Users</p>
                  <p className="text-lg font-extrabold text-slate-800">{activeStats.totalUsers}</p>
                </div>
              </div>
            </div>

            {/* Visual breakdown progress metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-850 text-sm">Raised Funds by Category</h3>
                <div className="space-y-3">
                  {Object.entries(activeStats.raisedByCategory).map(([cat, total]) => {
                    const percent = activeStats.totalRaised > 0 ? Math.round((total / activeStats.totalRaised) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-slate-600 uppercase tracking-wider">{cat}</span>
                          <span className="text-slate-800 font-bold">${total.toLocaleString()} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center text-center p-8">
                <CheckCircle className="h-12 w-12 text-brand-500 mx-auto" />
                <h4 className="font-bold text-slate-850 text-sm">Platform Operational Trust</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Campaign validation is conducted under rigorous verification steps, verifying hospital invoices, tax records, and NGOs certifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION QUEUE PANEL */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campaign Verification Queue</h1>
              <p className="text-slate-500 text-xs">Verify credentials and documents before allowing donations.</p>
            </div>

            {campaignQueue.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {campaignQueue.map((camp) => (
                  <div key={camp._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider border border-brand-100">{camp.category}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{camp.location}</span>
                      </div>
                      <h3 className="font-bold text-slate-850 text-base">{camp.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">Organizer: <strong className="text-slate-650">{camp.organizerId?.name} ({camp.organizerId?.email})</strong></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyCampaign(camp._id, 'active')}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded-xl transition-all"
                        title="Approve Campaign"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleVerifyCampaign(camp._id, 'rejected')}
                        className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-250 text-red-700 rounded-xl transition-all"
                        title="Reject Campaign"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-105 border-slate-100 rounded-3xl space-y-2 shadow-sm">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">Verification Queue Clear</h3>
                <p className="text-slate-400 text-xs">All submitted causes have been verified or resolved.</p>
              </div>
            )}
          </div>
        )}

        {/* REPORT TICKETS PANEL */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fraudulent Report Tickets</h1>
              <p className="text-slate-500 text-xs">Review campaigns flagged by community donors.</p>
            </div>

            {reports.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {reports.map((rep) => (
                  <div key={rep._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] text-red-650 text-red-500 font-bold uppercase tracking-wider">Reported Campaign</span>
                        <h4 className="font-bold text-sm text-slate-800">{rep.campaignId?.title || 'Deleted Campaign'}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rep.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl">
                      <p className="text-xs text-red-950 font-bold uppercase tracking-wider">Report Reason Detail:</p>
                      <p className="text-xs text-slate-650 mt-1 leading-relaxed">{rep.reason}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                      <span>Flagged by: <strong>{rep.reportedBy?.name}</strong></span>
                      {rep.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveReport(rep._id, 'investigated')}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                          >
                            Mark Investigated
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10">No report flags currently open.</p>
            )}
          </div>
        )}

        {/* PAYOUT REQUESTS PANEL */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Withdrawal Payout Requests</h1>
              <p className="text-slate-500 text-xs">Verify banking details and clear processed payouts.</p>
            </div>

            {withdrawals.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {withdrawals.map((w) => (
                  <div key={w._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800">{w.campaignId?.title}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Organizer: {w.organizerId?.name}</p>
                      </div>
                      <span className="text-lg font-extrabold text-brand-600">${w.amount.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Bank Name</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{w.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Account Number</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{w.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">IFSC / Sort Code</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{w.bankDetails.ifscCode}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Account Holder</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{w.bankDetails.accountHolderName}</p>
                      </div>
                    </div>

                    {w.status === 'pending' && (
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleWithdrawalRequest(w._id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                        >
                          Approve Payout
                        </button>
                        <button
                          onClick={() => handleWithdrawalRequest(w._id, 'rejected')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10">No pending withdrawals requests.</p>
            )}
          </div>
        )}

        {/* USER DIRECTORY PANEL */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered User Directory</h1>
              <p className="text-slate-500 text-xs">Manage system-wide accounts, toggle active block flags.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase">
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-full bg-brand-50 border border-brand-100 text-[10px] text-brand-650 flex items-center justify-center font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'organizer' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            u.isVerified ? 'bg-emerald-100 text-emerald-850' : 'bg-orange-100 text-orange-850'
                          }`}>
                            {u.isVerified ? 'verified' : 'unverified'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-1">
                          <button
                            onClick={() => { setAuditUser(u); setAuditModalOpen(true); }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg inline-flex items-center"
                            title="Audit Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg inline-flex items-center"
                              title="Block Account"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM AUDIT LOGS PANEL */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Trail Logs</h1>
              <p className="text-slate-500 text-xs">Timeline log of verified campaigns, reports, and banking payouts.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log, idx) => (
                    <div key={log._id || idx} className="flex space-x-4 text-xs border-b border-slate-100 pb-3 last:border-0">
                      <div className="bg-brand-50 text-brand-650 p-2.5 rounded-xl h-fit border border-brand-100">
                        <Activity className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 font-medium">{log.details}</p>
                        <p className="text-[10px] text-slate-400">Triggered by: <strong>{log.performedBy}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-10">No recent audit log history found.</p>
              )}
            </div>
          </div>
        )}

        {/* PLATFORM CONFIGURATION PANEL */}
        {activeTab === 'config' && (
          <div className="space-y-6 max-w-xl bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Platform Configurations</h2>
              <p className="text-slate-400 text-xs mt-0.5">Customize global payment limits, fee structures, and verify rules.</p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Platform Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Min Payout ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={minPayout}
                    onChange={(e) => setMinPayout(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={requireKyc}
                    onChange={(e) => setRequireKyc(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-650 border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span>Enforce rigid KYC verification verification</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={autoEmailAlerts}
                    onChange={(e) => setAutoEmailAlerts(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-650 border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span>Send automatic notification alerts to organizers</span>
                </label>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10"
              >
                Save System Config
              </button>
            </form>
          </div>
        )}
      </main>

      {/* USER AUDIT DETAIL MODAL */}
      {auditModalOpen && auditUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">User Directory Audit Profile</h3>
              <button onClick={() => { setAuditModalOpen(false); setAuditUser(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-650">
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-full bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                  {auditUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{auditUser.name}</h4>
                  <span className="inline-block mt-0.5 text-[9px] uppercase px-2 py-0.5 bg-slate-150 rounded font-extrabold text-slate-500 bg-slate-100">
                    {auditUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p><strong>Email:</strong> <span className="font-mono">{auditUser.email}</span></p>
                <p><strong>Phone:</strong> {auditUser.phone || 'N/A'}</p>
                <p><strong>Registered On:</strong> {new Date(auditUser.createdAt).toLocaleDateString()}</p>
                <p><strong>Identity Status:</strong> {auditUser.isVerified ? 'Verified Account' : 'Pending Verification Check'}</p>
              </div>

              {/* Action logs preview */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="font-bold text-slate-800 text-[10px] uppercase">Activity Benchmark (Simulated)</p>
                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase">Campaigns Started</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{auditUser.role === 'organizer' ? '3' : '0'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase">Total Donations Made</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{auditUser.role === 'donor' ? '12' : '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
