import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Heart,
  Shield,
  Award,
  Users,
  Search,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Landmark,
  Sparkles,
  Star,
  DollarSign
} from 'lucide-react';
import CampaignCard from '../components/CampaignCard';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState({});

  const categories = [
    { id: 'all', name: 'All Causes' },
    { id: 'medical', name: 'Medical' },
    { id: 'education', name: 'Education' },
    { id: 'disaster', name: 'Disaster Relief' },
    { id: 'animal', name: 'Animal Welfare' },
    { id: 'environment', name: 'Environment' },
    { id: 'community', name: 'Community' }
  ];

  const faqs = [
    {
      q: 'How does HopeFund verify campaign authenticity?',
      a: 'We require all campaign organizers to submit official documents (e.g., hospital certificates, NGO registration licenses, municipal approvals) during creation. Our administration team manually reviews each request before approval.'
    },
    {
      q: 'What are the platform fees on HopeFund?',
      a: 'HopeFund charges 0% platform fees! We believe all donated funds should go directly to the cause. Only standard, unavoidable third-party card processing fees (simulated) apply.'
    },
    {
      q: 'Can donors get tax deduction receipts?',
      a: 'Yes! Donors can print official tax-exemption receipts directly from their dashboard history log after donating successfully.'
    },
    {
      q: 'How are campaign payouts processed?',
      a: 'Organizers initiate withdrawal requests through their dashboard, specifying bank credentials. Our admin team verifies bank links and releases funds directly to the entity (hospital, school, or charity) to guarantee trust.'
    }
  ];

  const mockCampaigns = [
    {
      _id: 'mock1',
      title: 'Emergency Heart Surgery for 5-Year-Old Liam',
      description: 'Liam was diagnosed with a congenital heart defect and needs open-heart surgery urgently. The family is unable to afford the massive surgical costs.',
      category: 'medical',
      goalAmount: 45000,
      raisedAmount: 32000,
      coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60',
      location: 'New York, NY',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizerId: { name: 'Hospital Trust' }
    },
    {
      _id: 'mock2',
      title: 'Post-Flood Rebuilding Initiative for Village Schools',
      description: 'Recent severe flooding ruined school structures, desks, and textbooks. Join us to help rebuild primary schools for over 350 rural students.',
      category: 'disaster',
      goalAmount: 30000,
      raisedAmount: 18500,
      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      location: 'Mumbai, IN',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizerId: { name: 'Shine Foundation NGO' }
    },
    {
      _id: 'mock3',
      title: 'Underprivileged Children STEM Education Kits',
      description: 'Empowering children in local communities with modern STEM learning tools, robotics sets, and computing tutorials for future job opportunities.',
      category: 'education',
      goalAmount: 15000,
      raisedAmount: 12400,
      coverImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=60',
      location: 'London, UK',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizerId: { name: 'EduCore Foundation' }
    }
  ];

  const recentActivity = [
    { name: 'Sarah Vance', amount: 150, cause: 'Emergency Heart Surgery for Liam', time: '2 mins ago' },
    { name: 'David K.', amount: 50, cause: 'Post-Flood Rebuilding', time: '10 mins ago' },
    { name: 'Anonymous Donor', amount: 500, cause: 'Wetlands Wildlife Habitat', time: '45 mins ago' },
    { name: 'EduHelp Club', amount: 200, cause: 'Underprivileged Children STEM Kits', time: '1 hour ago' }
  ];

  const testimonials = [
    {
      quote: 'We managed to raise Emily\'s treatment goal in just 10 days. The zero platform fee made sure we had enough for the hospital bills.',
      author: 'Dr. Sarah Jenkins',
      role: 'Campaign Organizer'
    },
    {
      quote: 'The tax receipt system works seamlessly. I love seeing project milestone updates posted directly by the school principal.',
      author: 'Alice Vance',
      role: 'Regular Supporter'
    }
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/campaigns?status=active');
        if (res.data.success && res.data.campaigns.length > 0) {
          setCampaigns(res.data.campaigns);
        } else {
          setCampaigns(mockCampaigns);
        }
      } catch (err) {
        console.log('Using offline mock campaigns data');
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const filteredCampaigns = campaigns
    .filter(c => selectedCategory === 'all' || c.category === selectedCategory)
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[48px] shadow-2xl">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Hero Area */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-brand-500/10 text-brand-400 border border-brand-500/25 tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> 100% Audited, Secure & Transparent
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Empowering Crowdfunding <br />
              <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                for Genuine Social Causes
              </span>
            </h1>

            <p className="text-lg text-slate-350 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed text-slate-350">
              Raise capital online for medical emergencies, quality education, disaster relief, and animal welfare. Direct payouts, 0% platform fee, and audit-certified security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/campaigns"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-extrabold rounded-2xl text-slate-900 bg-white hover:bg-slate-100 shadow-xl shadow-white/5 transition-all transform hover:-translate-y-0.5"
              >
                Support a Cause
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-extrabold rounded-2xl text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-650/20 transition-all transform hover:-translate-y-0.5"
              >
                Create Campaign
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-700/50 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">$2.4M+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Funds Raised</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">12,500+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Active Supporters</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">1,200+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Verified Actions</p>
              </div>
            </div>
          </div>

          {/* Right Floating glass preview Card */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 max-w-[420px] mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-[30px]" />
              
              <div className="h-48 w-full rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80"
                  alt="Cause Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-brand-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Featured medical
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-base text-white">Emergency Heart Surgery for 5-Year-Old Liam</h4>
                <p className="text-xs text-slate-400 line-clamp-2">Liam needs a complex open-heart surgery within the month to repair a defect. The medical bills are beyond reach.</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>71% Raised</span>
                    <span>$32,000 of $45,000</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '71%' }} />
                  </div>
                </div>

                <Link
                  to="/campaigns/mock1"
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold transition-all text-center block"
                >
                  View Details & Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Causes Explorer Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 border-b border-slate-100 pb-6">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active Fundraising Campaigns</h2>
            <p className="text-slate-500 text-sm">Select categories or search keywords to find verified campaigns.</p>
          </div>

          {/* Search bar inside Home feed */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-semibold"
            />
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          </div>
        </div>

        {/* Category Pill selectors */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Campaigns list display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-150" />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
            <Search className="h-10 w-10 text-brand-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Matching Causes</h3>
            <p className="text-slate-400 text-xs">Try searching other keywords or browsing general categories.</p>
          </div>
        )}
      </section>

      {/* Recent Supporter Activities (Live donation ticker mockup) */}
      <section className="bg-slate-900 py-8 overflow-hidden text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-white shrink-0">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            <p className="font-bold text-xs uppercase tracking-wider">Live Donation Feed</p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-center overflow-x-auto py-2">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center space-x-3 shrink-0">
                <Heart className="h-4 w-4 text-red-500 fill-red-500 shrink-0" />
                <div className="text-[11px] leading-snug">
                  <p className="font-bold text-white">{act.name} donated <span className="text-brand-400">${act.amount}</span></p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{act.cause}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured workflow how it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">The Trust Cycle: How It Works</h2>
          <p className="text-slate-500 text-sm">We protect every dollar using dual-layered verification processes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector lines (mockup) */}
          <div className="absolute hidden md:block top-16 left-20 right-20 h-0.5 bg-slate-100 -z-10" />

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-650 flex items-center justify-center mx-auto font-bold border border-brand-100">1</div>
            <h3 className="font-bold text-sm text-slate-850">Create Campaign</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Organizers publish full cause descriptions and verification documents.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold border border-blue-100">2</div>
            <h3 className="font-bold text-sm text-slate-850">Security Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">HopeFund Admins manually verify hospital files or NGO credentials.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto font-bold border border-purple-100">3</div>
            <h3 className="font-bold text-sm text-slate-850">Direct Donation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Generous donors support campaigns using simulated payment checkout flows.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto font-bold border border-emerald-100">4</div>
            <h3 className="font-bold text-sm text-slate-850">Secure Disbursement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Admin releases approved withdrawal funds directly to certified bank links.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100 py-16 rounded-[48px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Supporter Testimonials</h2>
            <p className="text-slate-500 text-sm">Hear from our fundraisers and generous donor community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-650 text-sm font-semibold italic">"{t.quote}"</p>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{t.author}</span>
                  <span className="text-slate-450 uppercase text-[10px] tracking-wide bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Find answers regarding audits, transactions, and platforms rules.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen[idx];
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 py-4.5 text-left text-xs font-bold text-slate-800 uppercase tracking-wide hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-slate-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-500 text-xs leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
