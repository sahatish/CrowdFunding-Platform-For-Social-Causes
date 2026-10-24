import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Calendar, Heart } from 'lucide-react';

const CampaignCard = ({ campaign, showAdminActions = false }) => {
  const {
    _id,
    title,
    description,
    category,
    goalAmount,
    raisedAmount,
    coverImage,
    organizerId,
    status,
    deadline,
    location
  } = campaign;

  const percentage = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'medical':
        return 'bg-red-50 text-red-700 border border-red-100';
      case 'education':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'disaster':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'animal':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'environment':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'community':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* Cover Image & Category */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60';
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getCategoryStyles(category)}`}>
            {category}
          </span>
          {status !== 'active' && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
              status === 'pending' ? 'bg-orange-500' : status === 'rejected' ? 'bg-red-500' : 'bg-emerald-600'
            }`}>
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors mb-2">
          {title}
        </h3>

        {/* Snippet Description */}
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {description}
        </p>

        {/* Progress Section */}
        <div className="space-y-2 mt-auto mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-brand-600">{percentage}% Raised</span>
            <span className="text-slate-400">${raisedAmount.toLocaleString()} of ${goalAmount.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Meta Stats Info */}
        <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
              {organizerId?.name ? organizerId.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[100px]">
              By {organizerId?.name || 'Organizer'}
            </span>
          </div>

          <Link
            to={`/campaigns/${_id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            <span>View Cause</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
