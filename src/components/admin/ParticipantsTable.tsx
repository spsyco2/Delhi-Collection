import React, { useState } from 'react';
import { ParticipantRecord, Campaign } from '../../types';
import { campaignStore } from '../../data/campaignStore';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Gift, 
  Sparkles, 
  Phone, 
  User, 
  Calendar,
  Check,
  X,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';

interface ParticipantsTableProps {
  participants: ParticipantRecord[];
  campaigns: Campaign[];
  onToggleRedemption: (participantId: string) => void;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  campaigns,
  onToggleRedemption,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [winnerFilter, setWinnerFilter] = useState<'all' | 'winners' | 'non_winners'>('all');
  const [redemptionFilter, setRedemptionFilter] = useState<'all' | 'redeemed' | 'pending'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await campaignStore.fetchServerData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filtered = participants.filter(p => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.promoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prizeLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampaign = campaignFilter === 'all' || p.campaignId === campaignFilter;
    
    const matchesWinner = 
      winnerFilter === 'all' ? true : 
      winnerFilter === 'winners' ? p.isWinner : !p.isWinner;

    const matchesRedemption = 
      redemptionFilter === 'all' ? true :
      redemptionFilter === 'redeemed' ? p.isRedeemed : !p.isRedeemed;

    return matchesSearch && matchesCampaign && matchesWinner && matchesRedemption;
  });

  const exportCSV = () => {
    const headers = ['Customer Name', 'Phone Number', 'Campaign', 'Participation Date', 'Spin #', 'Prize Won', 'Promo Code', 'Is Winner', 'Redeemed', 'Redeemed At'];
    const rows = filtered.map(p => [
      `"${p.customerName}"`,
      `"${p.phoneNumber}"`,
      `"${p.campaignName}"`,
      `"${new Date(p.participatedAt).toLocaleString()}"`,
      p.spinNumber,
      `"${p.prizeLabel}"`,
      `"${p.promoCode}"`,
      p.isWinner ? 'YES' : 'NO',
      p.isRedeemed ? 'YES' : 'NO',
      p.redeemedAt ? `"${new Date(p.redeemedAt).toLocaleString()}"` : '""',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campaign_participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Customer Participation & Redemptions
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Real-time audit log of customer identities, verified spins, issued promo vouchers, and boutique redemption status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Sync latest customer entries from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or promo code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Campaign Filter */}
          <div>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status quick toggle */}
          <div className="flex items-center gap-2">
            <select
              value={winnerFilter}
              onChange={(e) => setWinnerFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="all">All Results</option>
              <option value="winners">🏆 Winners Only</option>
              <option value="non_winners">🤝 Non-Winners</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-xs">
          <span className="text-[11px] font-semibold text-stone-400">Redemption Filter:</span>
          {['all', 'redeemed', 'pending'].map((rf) => (
            <button
              key={rf}
              type="button"
              onClick={() => setRedemptionFilter(rf as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                redemptionFilter === rf
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {rf === 'all' ? 'All' : rf === 'redeemed' ? 'Redeemed' : 'Pending Redemption'}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Prize / Result</th>
                <th className="py-3 px-4">Promo Code</th>
                <th className="py-3 px-4">Redemption Status</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No participant records match the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const date = new Date(p.participatedAt);
                  const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[11px] font-serif">
                            {p.customerName.charAt(0)}
                          </div>
                          <span>{p.customerName}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-stone-600 font-medium">
                        {p.phoneNumber}
                      </td>

                      {/* Campaign */}
                      <td className="py-3.5 px-4 text-stone-700 max-w-[180px] truncate" title={p.campaignName}>
                        {p.campaignName}
                      </td>

                      {/* Prize */}
                      <td className="py-3.5 px-4">
                        {p.isWinner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200/70">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>{p.prizeLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 font-medium">
                            <span>No Prize (VIP Entry)</span>
                          </span>
                        )}
                      </td>

                      {/* Promo Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {p.promoCode ? (
                          <span className="px-2 py-1 bg-stone-100 rounded-md border border-stone-200 text-xs">
                            {p.promoCode}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      {/* Redemption Status */}
                      <td className="py-3.5 px-4">
                        {p.isWinner ? (
                          p.isRedeemed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Redeemed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )
                        ) : (
                          <span className="text-stone-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Action (Toggle redemption) */}
                      <td className="py-3.5 px-4 text-right">
                        {p.isWinner && (
                          <button
                            type="button"
                            onClick={() => onToggleRedemption(p.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              p.isRedeemed
                                ? 'bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.isRedeemed ? 'Unmark' : 'Mark Redeemed'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
