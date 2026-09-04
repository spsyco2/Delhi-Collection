const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { Campaign, ParticipantRecord, CampaignStatus } from '../../types';
import { campaignStore } from '../../data/campaignStore';
import { CampaignList } from './CampaignList';
import { CampaignWizard } from './CampaignWizard';
import { ParticipantsTable } from './ParticipantsTable';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { BrandSettingsAdmin } from './BrandSettingsAdmin';
import { CustomerCampaignView } from '../campaign/CustomerCampaignView';
import { 
  Sparkles, Layers, Users, BarChart3, Smartphone, Plus, RotateCcw, 
  Eye, ExternalLink, ChevronRight, ShieldAlert, ArrowLeft, Columns, 
  Maximize2, Settings, Menu, X, Monitor, UserCog
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => campaignStore.getCampaigns());
  const [participants, setParticipants] = useState<ParticipantRecord[]>(() => campaignStore.getParticipants());
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'campaigns' | 'participants' | 'analytics' | 'customer_preview' | 'wizard' | 'brand'>('campaigns');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedPreviewCampaignId, setSelectedPreviewCampaignId] = useState<string>(() => {
    const list = campaignStore.getCampaigns();
    return list.find(c => c.status === 'active')?.id || list[0]?.id || '';
  });
  const [simulatorDevice, setSimulatorDevice] = useState<'iphone' | 'ipad' | 'full'>('iphone');

  useEffect(() => {
    const unsubscribe = campaignStore.subscribe(() => {
      setCampaigns([...campaignStore.getCampaigns()]);
      setParticipants([...campaignStore.getParticipants()]);
    });
    return unsubscribe;
  }, []);

  const selectedPreviewCampaign = campaigns.find(c => c.id === selectedPreviewCampaignId) || campaigns[0];

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setActiveTab('wizard');
    setMobileMenuOpen(false);
  };
  const handleEditCampaign = (camp: Campaign) => {
    setEditingCampaign(camp);
    setActiveTab('wizard');
  };
  const handleDuplicate = (id: string) => {
    const newCamp = campaignStore.duplicateCampaign(id);
    if (newCamp) {
      setCampaigns([...campaignStore.getCampaigns()]);
    }
  };
  const handleDelete = (id: string) => {
    campaignStore.deleteCampaign(id);
    setCampaigns([...campaignStore.getCampaigns()]);
  };
  const handleToggleStatus = (id: string, newStatus: CampaignStatus) => {
    campaignStore.updateCampaignStatus(id, newStatus);
    setCampaigns([...campaignStore.getCampaigns()]);
  };
  const handlePreviewCustomer = (camp: Campaign) => {
    setSelectedPreviewCampaignId(camp.id);
    setActiveTab('customer_preview');
  };
  const handleSaveWizard = (savedCampaign: Campaign) => {
    campaignStore.saveCampaign(savedCampaign);
    setCampaigns([...campaignStore.getCampaigns()]);
    setSelectedPreviewCampaignId(savedCampaign.id);
    setActiveTab('campaigns');
  };

  const navItems = [
    { id: 'campaigns', label: \`Campaigns (\${campaigns.length})\`, icon: Layers },
    { id: 'participants', label: \`Participants (\${participants.length})\`, icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customer_preview', label: 'Customer Experience', icon: Smartphone },
    { id: 'brand', label: 'Admin Account Settings', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row selection:bg-amber-900 selection:text-amber-50">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-stone-200 flex items-center justify-between p-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-black text-sm shadow-md">
            DC
          </div>
          <span className="font-serif font-bold text-lg text-stone-900">Delhi Collection</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={\`\${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-72 bg-white border-r border-stone-200 flex-shrink-0 flex flex-col fixed md:sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen z-40 shadow-xl md:shadow-none transition-all\`}>
        
        <div className="hidden md:flex p-6 border-b border-stone-100 items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl shadow-md">
            DC
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-stone-900 leading-tight">Delhi Collection</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all \${
                  isActive 
                    ? 'bg-stone-900 text-amber-400 shadow-md translate-x-1' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }\`}
              >
                <Icon className={\`w-5 h-5 \${isActive ? 'text-amber-400' : 'text-stone-400'}\`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-100">
           <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
             <div className="flex items-center gap-2 mb-2">
               <ShieldAlert className="w-4 h-4 text-amber-700" />
               <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Demo Mode</span>
             </div>
             <p className="text-[11px] text-amber-800 mb-3">You are logged in as super admin for Delhi Collection.</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* WIZARD MODE */}
            {activeTab === 'wizard' && (
              <CampaignWizard
                initialCampaign={editingCampaign}
                onSave={handleSaveWizard}
                onCancel={() => setActiveTab('campaigns')}
              />
            )}

            {/* CAMPAIGNS LIST */}
            {activeTab === 'campaigns' && (
              <CampaignList
                campaigns={campaigns}
                onSelectCampaign={(c) => {
                  setSelectedPreviewCampaignId(c.id);
                  setActiveTab('customer_preview');
                }}
                onEditCampaign={handleEditCampaign}
                onCreateCampaign={handleCreateNew}
                onDuplicateCampaign={handleDuplicate}
                onDeleteCampaign={handleDelete}
                onToggleStatus={handleToggleStatus}
                onPreviewCustomerView={handlePreviewCustomer}
              />
            )}

            {/* PARTICIPANTS & REDEMPTIONS AUDIT */}
            {activeTab === 'participants' && (
              <ParticipantsTable
                participants={participants}
                campaigns={campaigns}
                onToggleRedemption={(id) => campaignStore.toggleParticipantRedemption(id)}
              />
            )}
            
            {/* BRAND SETTINGS */}
            {activeTab === 'brand' && (
              <BrandSettingsAdmin />
            )}

            {/* ANALYTICS DASHBOARD */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard campaigns={campaigns} />
            )}

            {/* DEDICATED CUSTOMER EXPERIENCE VIEW */}
            {activeTab === 'customer_preview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('campaigns')}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-lg font-bold font-serif text-stone-900">
                        Customer Experience Simulator
                      </h3>
                      <p className="text-xs text-stone-500">
                        Testing live mobile flow with identity validation, spin mechanics, and prizes.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-600">Testing:</span>
                      <select
                        value={selectedPreviewCampaignId}
                        onChange={(e) => setSelectedPreviewCampaignId(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.status.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setSimulatorDevice('iphone')}
                        className={\`p-1.5 rounded-lg transition-colors \${
                          simulatorDevice === 'iphone' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'
                        }\`}
                        title="iPhone View"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatorDevice('full')}
                        className={\`p-1.5 rounded-lg transition-colors \${
                          simulatorDevice === 'full' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'
                        }\`}
                        title="Desktop/Responsive View"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device Frame Sandbox */}
                <div className="flex justify-center p-4 sm:p-8 bg-stone-200/50 rounded-3xl border border-stone-300/80">
                  <div className={\`transition-all duration-300 \${
                    simulatorDevice === 'iphone'
                      ? 'w-[390px] max-w-full rounded-[48px] shadow-2xl border-[12px] border-stone-900 overflow-hidden bg-white min-h-[700px] relative'
                      : simulatorDevice === 'ipad'
                      ? 'w-[640px] max-w-full rounded-[36px] shadow-2xl border-[12px] border-stone-800 overflow-hidden bg-white min-h-[700px] relative'
                      : 'w-full max-w-4xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden bg-white min-h-[600px]'
                  }\`}>
                    {simulatorDevice === 'iphone' && (
                      <div className="w-28 h-6 bg-stone-900 rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-30" />
                    )}
                    {selectedPreviewCampaign ? (
                      <div className="h-full w-full overflow-y-auto">
                        <CustomerCampaignView
                          campaign={selectedPreviewCampaign}
                          onCampaignUpdated={() => {
                            setCampaigns([...campaignStore.getCampaigns()]);
                            setParticipants([...campaignStore.getParticipants()]);
                          }}
                          isEmbedPreview={false}
                        />
                      </div>
                    ) : (
                      <div className="p-12 text-center text-stone-400 h-full flex items-center justify-center">
                        <p>No campaign selected for preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};
`;

fs.writeFileSync('src/components/admin/AdminLayout.tsx', code);
