import React, { useState, useRef } from 'react';
import { Campaign, CampaignStatus } from '../../types';
import { campaignStore } from '../../data/campaignStore';
import { downloadJsonFile, readJsonFile } from '../../utils/fileUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Gift,
  ArrowUpRight,
  Sliders,
  Download,
  Upload,
  FileJson,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onEditCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onToggleStatus: (campaignId: string, newStatus: CampaignStatus) => void;
  onPreviewCustomerView: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onSelectCampaign,
  onEditCampaign,
  onCreateCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onToggleStatus,
  onPreviewCustomerView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importJsonText, setImportJsonText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportAll = () => {
    const jsonStr = campaignStore.exportCampaignsJson();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(`delhi_collection_campaigns_backup_${dateStr}.json`, jsonStr);
    showToast(`Exported ${campaigns.length} campaigns successfully!`);
  };

  const handleExportSingle = (e: React.MouseEvent, camp: Campaign) => {
    e.stopPropagation();
    const jsonStr = campaignStore.exportSingleCampaignJson(camp.id);
    if (jsonStr) {
      const slugName = camp.slug || camp.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      downloadJsonFile(`campaign_${slugName}.json`, jsonStr);
      showToast(`Exported campaign "${camp.name}"!`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError(null);
    try {
      const text = await readJsonFile(file);
      setImportJsonText(text);
    } catch (err: any) {
      setImportError('Failed to read file: ' + err.message);
    }
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      setImportError('Please select a JSON file or paste JSON code to import.');
      return;
    }
    setImportError(null);
    const result = campaignStore.importCampaignsJson(importJsonText, importMode);
    if (result.success) {
      setImportSuccess(`Successfully imported and restored ${result.count} campaigns!`);
      showToast(`Restored ${result.count} campaigns!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccess(null);
        setImportJsonText('');
        setImportFile(null);
      }, 1200);
    } else {
      setImportError(result.error || 'Import failed. Check JSON format.');
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            Scheduled
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Pause className="w-3 h-3 text-amber-500" />
            Paused
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <Sliders className="w-3 h-3 text-stone-400" />
            Draft
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Concluded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Promotional Campaigns
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Create, configure, export, import, and monitor interactive promotions for Delhi Collection.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export All Campaigns Button */}
          <button
            type="button"
            id="export-campaigns-button"
            onClick={handleExportAll}
            title="Export all campaigns as a JSON backup file"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs sm:text-sm transition-all active:scale-95 cursor-pointer border border-stone-300"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export Campaigns</span>
          </button>

          {/* Import Campaign Button */}
          <button
            type="button"
            id="import-campaigns-button"
            onClick={() => {
              setImportError(null);
              setImportSuccess(null);
              setImportJsonText('');
              setImportFile(null);
              setShowImportModal(true);
            }}
            title="Import campaigns from a JSON file"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs sm:text-sm transition-all active:scale-95 cursor-pointer border border-stone-300"
          >
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Import Campaign</span>
          </button>

          {/* Create New Campaign Button */}
          <button
            type="button"
            id="create-campaign-main-button"
            onClick={onCreateCampaign}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create New Campaign</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'active', 'scheduled', 'paused', 'draft', 'ended'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {status === 'all' ? 'All Campaigns' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300">
          <Gift className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-stone-800">No campaigns found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, import an existing campaign backup, or create a brand new campaign.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg border border-stone-300"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Campaign
            </button>
            <button
              type="button"
              onClick={onCreateCampaign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => {
            const startDate = new Date(camp.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const endDate = new Date(camp.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const totalWinners = camp.prizes.reduce((sum, p) => p.isWinning ? sum + p.claimedCount : sum, 0);

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Optional Card Top Visual Preview (Banner or Custom Background) */}
                {(camp.design?.bannerImageUrl || camp.design?.backgroundImageUrl) && (
                  <div className="w-full h-24 bg-stone-900 relative overflow-hidden border-b border-stone-100">
                    <img
                      src={camp.design.bannerImageUrl || camp.design.backgroundImageUrl}
                      alt={camp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />
                    {camp.design.backgroundImageUrl && (
                      <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-amber-300 font-medium border border-white/10">
                        Custom Atmosphere
                      </span>
                    )}
                  </div>
                )}

                {/* Card Header & Content */}
                <div className="p-5 pb-4 border-b border-stone-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold font-serif border border-amber-200">
                        {camp.type === 'spin_wheel' ? '🎡' : '🎁'}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                        {camp.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleExportSingle(e, camp)}
                        title={`Export "${camp.name}" as JSON`}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {getStatusBadge(camp.status)}
                    </div>
                  </div>

                  <h3 
                    onClick={() => onSelectCampaign(camp)}
                    className="text-base font-bold font-serif text-stone-900 hover:text-amber-700 cursor-pointer transition-colors line-clamp-1"
                  >
                    {camp.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                {/* Metrics row */}
                <div className="px-5 py-3.5 bg-stone-50/70 grid grid-cols-3 gap-2 text-center border-b border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Spins</span>
                    <span className="text-sm font-bold text-stone-900">{camp.totalSpins || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Participants</span>
                    <span className="text-sm font-bold text-stone-900">{camp.totalParticipants || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Winners</span>
                    <span className="text-sm font-bold text-amber-700">{totalWinners}</span>
                  </div>
                </div>

                {/* Footer details & actions */}
                <div className="p-5 pt-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{startDate} – {endDate}</span>
                    </div>
                    <span className="font-medium text-stone-600">
                      {camp.prizes.length} rewards
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPreviewCustomerView(camp)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      <span>Customer View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditCampaign(camp)}
                      title="Edit Campaign"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {camp.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(camp.id, 'paused')}
                        title="Pause Campaign"
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(camp.id, 'active')}
                        title="Activate Campaign"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDuplicateCampaign(camp.id)}
                      title="Duplicate Campaign"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${camp.name}"?`)) {
                          onDeleteCampaign(camp.id);
                        }
                      }}
                      title="Delete Campaign"
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IMPORT CAMPAIGN MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">Import Campaign</h3>
                  <p className="text-xs text-stone-500">Restore campaigns from a JSON backup file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* File selection dropzone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Select Backup JSON File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-stone-50 hover:bg-amber-50/40"
                >
                  <FileJson className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  {importFile ? (
                    <div>
                      <p className="text-xs font-bold text-stone-800">{importFile.name}</p>
                      <p className="text-[11px] text-stone-500">{(importFile.size / 1024).toFixed(1)} KB • Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-stone-700">Click to browse your computer for a <span className="font-semibold text-stone-900">.json</span> file</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Supports single campaign or full campaign array exports</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Paste JSON fallback */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Or Paste JSON Code
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  rows={4}
                  placeholder='{"version": "1.0", "campaigns": [...]}'
                  className="w-full p-3 font-mono text-[11px] bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Import Mode: Merge or Replace */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="block text-xs font-semibold text-stone-700 mb-2">Import Option:</span>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-stone-800 font-medium">Merge (Add & Update existing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-stone-800 font-medium">Replace All</span>
                  </label>
                </div>
              </div>

              {/* Error & Success Messages */}
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-import-campaign-button"
                onClick={handleExecuteImport}
                disabled={!importJsonText.trim()}
                className="px-5 py-2 text-xs font-semibold bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>Restore & Import</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

