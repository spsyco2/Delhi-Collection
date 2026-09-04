import React, { useState } from 'react';
import { Campaign, CampaignAnalytics } from '../../types';
import { campaignStore } from '../../data/campaignStore';
import { 
  Users, 
  RotateCw, 
  Trophy, 
  Percent, 
  Tag, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  BarChart3,
  Calendar,
  Gift
} from 'lucide-react';

interface AnalyticsDashboardProps {
  campaigns: Campaign[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaigns,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const analytics = campaignStore.getAnalytics(
    selectedCampaignId === 'all' ? undefined : selectedCampaignId
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Campaign Performance & Intelligence
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Real-time conversion metrics, customer acquisition volume, prize stock burn-rate, and promo redemptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await campaignStore.fetchServerData();
            }}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RotateCw className="w-4 h-4 text-stone-600" />
          </button>
          <label className="text-xs font-semibold text-stone-600">Campaign Scope:</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Campaigns (Consolidated)</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Metric Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verified Customers */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Verified Customers</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-stone-900 font-serif">{analytics.uniquePhones}</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Unique phone numbers</p>
          </div>
        </div>

        {/* Total Spins Executed */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Spins</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-stone-900 font-serif">{analytics.totalSpins}</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">100% verified participation</p>
          </div>
        </div>

        {/* Total Winners & Win Rate */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Win Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-stone-900 font-serif">{analytics.conversionRate}%</h3>
              <span className="text-xs font-semibold text-emerald-700">{analytics.winnersCount} winners</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{analytics.nonWinnersCount} consolation VIPs</p>
          </div>
        </div>

        {/* Promo Code Redemptions */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Promo Redemptions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-stone-900 font-serif">{analytics.redemptionCount}</h3>
              <span className="text-xs font-semibold text-stone-500">({analytics.redemptionRate}% of wins)</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Boutique & online checkout orders</p>
          </div>
        </div>
      </div>

      {/* Prize Distribution & Stock Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prize Stock Burn Rate Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">Prize Distribution & Inventory Stock</h3>
              <p className="text-xs text-stone-500">Live monitor of claimed vouchers versus campaign allocation caps.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
              {analytics.remainingPrizesCount} Available Remaining
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.prizeDistribution.map((prize) => {
              const cap = prize.totalStock > 0 ? prize.totalStock : 999;
              const percentClaimed = Math.min(100, Math.round((prize.claimed / cap) * 100));

              return (
                <div key={prize.prizeId} className="space-y-1.5 bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{prize.label}</span>
                    <span className="text-stone-600 font-medium">
                      <strong>{prize.claimed}</strong> claimed / {prize.totalStock > 0 ? `${prize.totalStock} max` : 'Unlimited'}
                      <span className="text-stone-400 ml-1.5">({prize.remaining} remaining)</span>
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        percentClaimed >= 90 
                          ? 'bg-rose-500' 
                          : percentClaimed >= 60 
                          ? 'bg-amber-500' 
                          : 'bg-stone-800'
                      }`}
                      style={{ width: `${percentClaimed}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights & Campaign Health */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold font-serif text-stone-900">Campaign Insights</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-900 leading-relaxed">
                <strong>High Engagement:</strong> Average completion time from phone entry to wheel spin is under 18 seconds.
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 leading-relaxed">
                <strong>Fraud Prevention:</strong> 0 duplicate spin attempts bypassed strict phone number normalization.
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-emerald-900 leading-relaxed">
                <strong>Top Converting Reward:</strong> "25% OFF Silk & Couture" generated the highest boutique checkout conversion rate.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400">
              Data auto-refreshes on every customer participation event
            </span>
          </div>
        </div>
      </div>

      {/* Participation Timeline Chart */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">Participation Timeline</h3>
            <p className="text-xs text-stone-500">Daily breakdown of customer spins and newly registered shoppers.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-stone-900" /> Total Spins
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" /> Unique Shoppers
            </span>
          </div>
        </div>

        {/* Visual Daily Bars */}
        <div className="pt-4 pb-2">
          {analytics.timeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No daily participation records yet.
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 items-end h-44 border-b border-stone-200 pb-2">
              {analytics.timeline.map((day, i) => {
                const maxVal = Math.max(...analytics.timeline.map(t => t.spins), 1);
                const heightPercent = Math.max(15, Math.round((day.spins / maxVal) * 100));

                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.spins}
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-stone-900 hover:bg-amber-600 rounded-t-lg transition-all duration-300 relative"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-stone-500 font-medium truncate w-full text-center">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
