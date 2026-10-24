import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, AlertCircle } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'medical', name: 'Medical' },
    { id: 'education', name: 'Education' },
    { id: 'disaster', name: 'Disaster Relief' },
    { id: 'animal', name: 'Animal Welfare' },
    { id: 'environment', name: 'Environment' },
    { id: 'community', name: 'Community' },
    { id: 'ngo', name: 'NGO Activities' }
  ];

  // Offline mock backup
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
      organizerId: { name: 'Hospital Trust' },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
      organizerId: { name: 'Shine Foundation NGO' },
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
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
      organizerId: { name: 'EduCore Foundation' },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'mock4',
      title: 'Stray Dogs Shelter & Vet Care Clinic Rescue',
      description: 'Funding the expansion of our rescue shelter to provide medical treatment, rabies vaccines, and nutritious feed for over 120 stray dogs.',
      category: 'animal',
      goalAmount: 8000,
      raisedAmount: 5200,
      coverImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60',
      location: 'Paris, FR',
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizerId: { name: 'Rescue Paws Association' },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        // Build query string
        let url = `/api/campaigns?status=active`;
        if (selectedCategory && selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        const res = await axios.get(url);
        if (res.data.success && res.data.campaigns.length > 0) {
          setCampaigns(res.data.campaigns);
        } else {
          setCampaigns(mockCampaigns);
        }
      } catch (err) {
        console.log('Error fetching campaigns, using offline mock data');
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchTerm, selectedCategory]);

  // Sort Campaigns Client-side for seamless interactivity
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'goal-high') {
      return b.goalAmount - a.goalAmount;
    }
    if (sortBy === 'goal-low') {
      return a.goalAmount - b.goalAmount;
    }
    if (sortBy === 'raised-high') {
      return b.raisedAmount - a.raisedAmount;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Explore Campaigns</h1>
        <p className="text-slate-500">Every donation, no matter how small, helps make the world a better place.</p>
      </div>

      {/* Filter Options bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search campaigns by title, keyword, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm"
          />
        </div>

        {/* Category select */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="raised-high">Most Funded</option>
            <option value="goal-high">Highest Goal</option>
            <option value="goal-low">Lowest Goal</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : sortedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCampaigns.map((camp) => (
            <CampaignCard key={camp._id} campaign={camp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">No campaigns found</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">
            Try adjusting your search criteria or category filter options to discover other social fundraising causes.
          </p>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
