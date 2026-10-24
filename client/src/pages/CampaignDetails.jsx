import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Heart,
  Share2,
  FileText,
  AlertTriangle,
  X,
  CreditCard,
  MessageCircle,
  TrendingUp,
  Clock,
  Bookmark
} from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('story'); // story, updates, donors
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [createdDonation, setCreatedDonation] = useState(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Mock data fallbacks for standalone running
  const mockCampaign = {
    _id: id,
    title: 'Emergency Heart Surgery for 5-Year-Old Liam',
    description: 'Liam was diagnosed with a congenital heart defect. He needs a complex surgical intervention to repair the aorta within the next month. The medical expenses are beyond his family\'s reach. Your donations will directly pay the hospital bills.\n\nAll hospital certificates, surgery schedules, and identification papers are attached and verified by our auditing team.',
    category: 'medical',
    goalAmount: 45000,
    raisedAmount: 32000,
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    documents: ['medical_report_liam.pdf', 'hospital_invoice.pdf'],
    location: 'New York, NY',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    organizerId: {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@hospitaltrust.org',
      phone: '+1 555-019-2834',
      isVerified: true
    },
    updates: [
      {
        title: 'Surgery Date Scheduled',
        content: 'Thanks to the support, Liam\'s surgery has been officially scheduled for next Monday. Please keep him in your prayers.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Initial hospital deposit completed',
        content: 'We paid the initial deposit of $15,000 using the first batch of funds. Thank you, everyone!',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  };

  const mockDonations = [
    { _id: 'd1', donorName: 'Alice Vance', amount: 500, message: 'Stay strong Liam, we are praying for you!', donatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { _id: 'd2', donorName: 'Anonymous', amount: 100, message: '', donatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    { _id: 'd3', donorName: 'David Miller', amount: 250, message: 'Hope this helps Liam get better soon.', donatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
  ];

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/campaigns/${id}`);
        if (res.data.success) {
          setCampaign(res.data.campaign);
        } else {
          setCampaign(mockCampaign);
        }
      } catch (err) {
        setCampaign(mockCampaign);
      }

      try {
        const res = await axios.get(`/api/donations?campaignId=${id}`);
        if (res.data.success && res.data.donations.length > 0) {
          setDonations(res.data.donations);
        } else {
          setDonations(mockDonations);
        }
      } catch (err) {
        setDonations(mockDonations);
      }
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/auth/bookmarks');
          if (res.data.success) {
            const isSaved = res.data.bookmarks.some(b => b._id === id || b === id);
            setIsBookmarked(isSaved);
          }
        } catch (err) {
          console.error('Error fetching bookmarks:', err);
        }
      }
      setLoading(false);
    };

    fetchCampaignDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Campaign not found</h2>
        <Link to="/campaigns" className="text-brand-600 font-semibold hover:underline">
          Go back to campaigns
        </Link>
      </div>
    );
  }

  const percentage = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  const handleDonate = async (e) => {
    e.preventDefault();
    setDonationLoading(true);
    try {
      const payload = {
        campaignId: campaign._id,
        amount: Number(donationAmount),
        message: donationMessage,
        anonymous: isAnonymous,
        paymentMethod,
        donorName: isAnonymous ? 'Anonymous' : (donorName || user?.name || 'Guest Donor')
      };

      const res = await axios.post('/api/donations', payload);
      if (res.data.success) {
        // Success actions
        setCampaign(prev => ({
          ...prev,
          raisedAmount: prev.raisedAmount + Number(donationAmount)
        }));
        setCreatedDonation(res.data.donation);
        setDonations(prev => [res.data.donation, ...prev]);
        setDonationSuccess(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Donation simulation failed. Please try again.');
    } finally {
      setDonationLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await axios.post(`/api/auth/bookmarks/${campaign._id}`);
      if (res.data.success) {
        setIsBookmarked(prev => !prev);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const res = await axios.post('/api/admin/reports', {
        campaignId: campaign._id,
        reason: reportReason
      });
      if (res.data.success) {
        setReportSuccess(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Report submission failed. Log in first.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link to="/campaigns" className="hover:text-brand-600">Campaigns</Link> &gt; <span className="text-slate-800 font-semibold capitalize">{campaign.category}</span>
      </nav>

      {/* Main Campaign Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left main details block */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Title */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl font-extrabold text-slate-905 text-slate-900 leading-tight sm:text-4xl flex-1">
                {campaign.title}
              </h1>
              {isAuthenticated && (
                <button
                  onClick={handleToggleBookmark}
                  className={`p-3 rounded-2xl border transition-all ${
                    isBookmarked
                      ? 'bg-brand-50 border-brand-200 text-brand-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Cause'}
                >
                  <Bookmark className={`h-5.5 w-5.5 ${isBookmarked ? 'fill-brand-600' : ''}`} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500">
              <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-brand-100">
                {campaign.category}
              </span>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{campaign.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Cover Media Image */}
          <div className="h-96 w-full rounded-3xl overflow-hidden shadow-sm bg-slate-100">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 flex space-x-8">
            {['story', 'updates', 'donors'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab} {tab === 'updates' && `(${campaign.updates.length})`} {tab === 'donors' && `(${donations.length})`}
              </button>
            ))}
          </div>

          {/* Active Tab Panels */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[250px]">
            {activeTab === 'story' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-slate-800">The Story / Cause Details</h3>
                <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                  {campaign.description}
                </p>

                {/* Verification Documents if any */}
                {campaign.documents && campaign.documents.length > 0 && (
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <FileText className="h-4.5 w-4.5 text-brand-600" />
                      Verification Documents Provided
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {campaign.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <span className="font-medium text-slate-600 truncate">{doc}</span>
                          <span className="text-[10px] font-bold text-brand-600 uppercase">Verified</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-slate-800">Campaign Updates & Logs</h3>
                {campaign.updates && campaign.updates.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 pl-6 ml-2 space-y-8">
                    {campaign.updates.map((up, idx) => (
                      <div key={idx} className="relative space-y-2">
                        <div className="absolute -left-[31px] bg-brand-600 h-4 w-4 rounded-full border-4 border-white shadow-sm" />
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-sm">{up.title}</h4>
                          <span className="text-xs text-slate-400">{new Date(up.date || up.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{up.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No updates posted yet by the organizer.</p>
                )}
              </div>
            )}

            {activeTab === 'donors' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-slate-800">Supportive Messages & Contributions</h3>
                {donations.length > 0 ? (
                  <div className="space-y-4">
                    {donations.map((don) => (
                      <div key={don._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-sm">
                        <div className="bg-brand-100 text-brand-700 h-8 w-8 rounded-full flex items-center justify-center font-bold">
                          {don.donorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{don.donorName}</span>
                            <span className="font-extrabold text-brand-600 text-sm">${don.amount}</span>
                          </div>
                          {don.message && <p className="text-slate-600 text-xs mt-1 italic">"{don.message}"</p>}
                          <div className="text-[10px] text-slate-400">{new Date(don.donatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Be the first to donate and support this social cause!</p>
                )}
              </div>
            )}
          </div>

          {/* Report Button Trigger */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center text-xs font-semibold text-red-500 hover:text-red-600 space-x-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Report this campaign as fraudulent</span>
            </button>
          </div>
        </div>

        {/* Right side floating summary donation card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl space-y-6 sticky top-24">
            {/* Progress metrics */}
            <div className="space-y-3">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-slate-900">${campaign.raisedAmount.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">raised of ${campaign.goalAmount.toLocaleString()} goal</span>
              </div>

              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{daysLeft} days left</span>
                </div>
                <div>{percentage}% funded</div>
              </div>
            </div>

            {/* Campaign status actions */}
            {campaign.status === 'active' ? (
              <button
                onClick={() => setDonationModalOpen(true)}
                className="w-full py-4 px-6 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all text-center flex justify-center items-center gap-2 group"
              >
                <Heart className="h-5 w-5 fill-white group-hover:scale-110 transition-transform" />
                Donate Now
              </button>
            ) : (
              <div className="w-full py-4 text-center text-slate-400 bg-slate-100 rounded-2xl font-bold uppercase">
                Campaign {campaign.status}
              </div>
            )}

            {/* Verification & Safety guarantee details */}
            <div className="border-t border-slate-100 pt-5 space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="bg-brand-50 text-brand-700 p-1.5 rounded-lg">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">HopeFund Guarantee</h4>
                  <p className="text-slate-500 mt-0.5">Your donation is 100% protected. If fraud is found, funds are reimbursed.</p>
                </div>
              </div>

              {/* Organizer details info box */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Campaign Organizer</p>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {campaign.organizerId?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 flex items-center gap-1">
                      {campaign.organizerId?.name}
                      {campaign.organizerId?.isVerified && <ShieldCheck className="h-4 w-4 text-brand-600 fill-brand-100" />}
                    </h5>
                    <p className="text-[10px] text-slate-400">{campaign.organizerId?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DONATION DIALOG MODAL */}
      {donationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="h-5.5 w-5.5 text-brand-600 fill-brand-100" />
                Support Social Cause
              </h3>
              <button onClick={() => { setDonationModalOpen(false); setDonationSuccess(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Donation Success State */}
            {donationSuccess ? (
              <div className="text-center py-8 space-y-6">
                <div className="mx-auto h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-extrabold text-slate-950">Donation Complete!</h4>
                  <p className="text-slate-500 text-sm">Thank you for your generous contribution of ${donationAmount}.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
                  <p className="text-slate-500"><strong>Receipt ID:</strong> {createdDonation?._id}</p>
                  <p className="text-slate-500"><strong>Transaction ID:</strong> {createdDonation?.paymentId}</p>
                  <p className="text-slate-500"><strong>Payment Status:</strong> Successful (completed)</p>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`/api/donations/receipt/${createdDonation?._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-white text-sm"
                  >
                    View & Print Receipt
                  </a>
                  <button
                    onClick={() => { setDonationModalOpen(false); setDonationSuccess(false); }}
                    className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Donation Input Form */
              <form onSubmit={handleDonate} className="space-y-4">
                {/* Donation Amount Preset Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Donation Amount ($)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setDonationAmount(val)}
                        className={`py-2 rounded-xl text-sm font-semibold border ${
                          donationAmount === val
                            ? 'bg-brand-50 border-brand-500 text-brand-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Other Custom Amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm mt-2 font-bold text-slate-800"
                  />
                </div>

                {/* Name */}
                {!isAuthenticated && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Your Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                      disabled={isAnonymous}
                    />
                  </div>
                )}

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Supportive Message</label>
                  <textarea
                    placeholder="Leave words of encouragement..."
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    rows="2"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <label htmlFor="anonymous" className="text-xs font-medium text-slate-600">
                    Donate anonymously (hide name from contributors feed)
                  </label>
                </div>

                {/* Payment Gateway Toggle */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="text-xs font-bold text-slate-600 uppercase">Simulated Payment Gateway</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${
                        paymentMethod === 'stripe' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <CreditCard className="h-4.5 w-4.5" />
                      Stripe
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold ${
                        paymentMethod === 'razorpay' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <TrendingUp className="h-4.5 w-4.5" />
                      Razorpay
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={donationLoading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center text-sm"
                >
                  {donationLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `Complete Simulated Donation of $${donationAmount}`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REPORT DIALOG MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Report Campaign
              </h3>
              <button onClick={() => { setReportModalOpen(false); setReportSuccess(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto h-12 w-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-slate-900">Report Submitted</h4>
                <p className="text-slate-500 text-xs">Admins will investigate this cause based on your details. Thank you.</p>
                <button
                  onClick={() => { setReportModalOpen(false); setReportSuccess(false); }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Reason for report</label>
                  <textarea
                    required
                    minLength="10"
                    placeholder="Detail exactly why you believe this campaign is fake or deceptive..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows="4"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center"
                >
                  {reportLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
