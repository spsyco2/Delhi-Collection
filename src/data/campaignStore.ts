import { Campaign, ParticipantRecord, EligibilityResult, PrizeOption, CampaignAnalytics, CampaignStatus } from '../types';
import { INITIAL_CAMPAIGNS, INITIAL_PARTICIPANTS } from './initialData';
import { BrandSettings } from '../types';
import { DEFAULT_LOGO_URL, DEFAULT_BACKGROUND_URL } from '../assets/defaultAssets';

const CAMPAIGNS_STORAGE_KEY = 'maison_campaigns_v3';
const BRAND_SETTINGS_STORAGE_KEY = 'maison_brand_settings_v3';
const PARTICIPANTS_STORAGE_KEY = 'maison_participants_v3';

// Helper to normalize phone numbers for strict duplicate check
export function normalizePhoneNumber(phone: string): string {
  // strip spaces, dashes, parentheses, dots
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return cleaned;
}

export class CampaignStore {
  private static instance: CampaignStore;
  private listeners: (() => void)[] = [];

  private constructor() {
    this.initializeAndMigrate();
  }

  private initializeAndMigrate() {
    try {
      // 1. Load cached campaigns if any exist
      let existingCampaigns: Campaign[] | null = null;
      const keysToProbe = [
        CAMPAIGNS_STORAGE_KEY,
        'maison_campaigns_v3',
        'maison_campaigns_v2',
        'maison_campaigns_v1',
        'dc_campaigns'
      ];

      for (const k of keysToProbe) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              existingCampaigns = parsed;
              break;
            }
          } catch {
            // continue
          }
        }
      }

      if (existingCampaigns && existingCampaigns.length > 0) {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(existingCampaigns));
      } else if (!localStorage.getItem(CAMPAIGNS_STORAGE_KEY)) {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(INITIAL_CAMPAIGNS));
      }

      // 2. Load cached participants
      let existingParticipants: ParticipantRecord[] | null = null;
      const participantKeys = [
        PARTICIPANTS_STORAGE_KEY,
        'maison_participants_v3',
        'maison_participants_v2',
        'maison_participants_v1'
      ];
      for (const pk of participantKeys) {
        const raw = localStorage.getItem(pk);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              existingParticipants = parsed;
              break;
            }
          } catch {
            // continue
          }
        }
      }
      if (existingParticipants) {
        localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(existingParticipants));
      } else if (!localStorage.getItem(PARTICIPANTS_STORAGE_KEY)) {
        localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
      }

      // 3. Load cached brand settings
      const brandRaw = localStorage.getItem(BRAND_SETTINGS_STORAGE_KEY) || 
                       localStorage.getItem('maison_brand_settings_v2') || 
                       localStorage.getItem('maison_brand_settings_v1');
      if (brandRaw) {
        try {
          const parsed = JSON.parse(brandRaw);
          const merged: BrandSettings = {
            ...this.getDefaultBrandSettings(),
            ...parsed,
          };
          localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      } else if (!localStorage.getItem(BRAND_SETTINGS_STORAGE_KEY)) {
        localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(this.getDefaultBrandSettings()));
      }
    } catch (e) {
      console.warn('Failed to initialize or migrate local storage campaign data', e);
    }

    if (typeof window !== 'undefined') {
      // Immediate server fetch on initialization
      this.fetchServerData();

      window.addEventListener('focus', () => {
        this.fetchServerData();
      });
      // Frequent background check to stay in near real-time sync for participants & admin
      setInterval(() => {
        this.fetchServerData();
      }, 5000);
    }
  }

  public async fetchServerData(): Promise<void> {
    try {
      const response = await fetch('/api/sync');
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.success) {
        let changed = false;

        if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(data.campaigns));
          changed = true;
        }

        if (data.brandSettings && typeof data.brandSettings === 'object') {
          const merged = {
            ...this.getDefaultBrandSettings(),
            ...data.brandSettings,
          };
          localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          changed = true;
        }

        if (Array.isArray(data.participants)) {
          // Merge local and server participants by ID to ensure no spins are ever lost
          const localParticipants = this.getParticipants();
          const pMap = new Map<string, ParticipantRecord>();
          
          // First add server records
          data.participants.forEach((p: ParticipantRecord) => {
            if (p && p.id) pMap.set(p.id, p);
          });
          
          // Next merge local records (in case any were created offline / between polls)
          localParticipants.forEach((p: ParticipantRecord) => {
            if (p && p.id && !pMap.has(p.id)) {
              pMap.set(p.id, p);
              // Push unsynced local spin to server
              this.syncToServer({ participants: Array.from(pMap.values()) });
            }
          });

          const mergedParticipants = Array.from(pMap.values()).sort(
            (a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime()
          );

          localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(mergedParticipants));
          changed = true;
        }

        if (changed) {
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Could not sync from server:', err);
    }
  }

  public async syncToServer(payload: {
    campaigns?: Campaign[];
    brandSettings?: BrandSettings;
    participants?: ParticipantRecord[];
  }): Promise<void> {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Could not sync to server:', err);
    }
  }

  public static getInstance(): CampaignStore {
    if (!CampaignStore.instance) {
      CampaignStore.instance = new CampaignStore();
    }
    return CampaignStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getCampaigns(): Campaign[] {
    try {
      const data = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  }

  public getCampaignById(id: string): Campaign | undefined {
    return this.getCampaigns().find(c => c.id === id || c.slug === id);
  }

  public getParticipants(campaignId?: string): ParticipantRecord[] {
    try {
      const data = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
      const list: ParticipantRecord[] = data ? JSON.parse(data) : INITIAL_PARTICIPANTS;
      if (campaignId) {
        return list.filter(p => p.campaignId === campaignId);
      }
      return list;
    } catch {
      return INITIAL_PARTICIPANTS;
    }
  }

  public getDefaultBrandSettings(): BrandSettings {
    return {
      brandName: 'Delhi Collection',
      tagline: "Men's Wear | Streetwear | Trending Fashion",
      logoUrl: DEFAULT_LOGO_URL,
      backgroundImageUrl: DEFAULT_BACKGROUND_URL,
      backgroundColor: '#861730',
      primaryColor: '#861730',
      accentColor: '#FDD145',
      whatsappNumber: '919310581186',
      whatsappUrl: 'https://wa.me/919310581186?text=Hi%20Delhi%20Collection,%20I%20need%20to%20look%20classic%20and%20suggest%20me%20best%20outfit%20trending%20now?',
      instagramUrl: 'https://www.instagram.com/delhi_collection_1/',
      facebookUrl: 'https://www.facebook.com/uniqueItems05/',
      googleMapsUrl: 'https://maps.app.goo.gl/2XtiDe9uBGQP8WGo8',
      youtubeUrl: '',
      storeUrl: 'https://maps.app.goo.gl/2XtiDe9uBGQP8WGo8',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      overlayColor: '#861730',
      overlayOpacity: 75,
      blur: 0,
      brightness: 100,
    };
  }

  public getBrandSettings(): BrandSettings {
    const defaultSettings = this.getDefaultBrandSettings();

    try {
      const data = localStorage.getItem(BRAND_SETTINGS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...defaultSettings,
          ...parsed,
          logoUrl: parsed.logoUrl || defaultSettings.logoUrl,
          backgroundImageUrl: parsed.backgroundImageUrl || defaultSettings.backgroundImageUrl,
          overlayColor: parsed.overlayColor || defaultSettings.overlayColor,
          overlayOpacity: parsed.overlayOpacity !== undefined ? parsed.overlayOpacity : defaultSettings.overlayOpacity,
        };
      }
      return defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  public saveBrandSettings(settings: BrandSettings): void {
    localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    this.notify();
    this.syncToServer({ brandSettings: settings });
  }

  public saveCampaigns(campaigns: Campaign[]) {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    this.notify();
    this.syncToServer({ campaigns });
  }

  public saveParticipants(participants: ParticipantRecord[]) {
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
    this.notify();
    this.syncToServer({ participants });
  }

  public resetToDefaults() {
    this.saveCampaigns(INITIAL_CAMPAIGNS);
    this.saveParticipants(INITIAL_PARTICIPANTS);
    this.saveBrandSettings(this.getDefaultBrandSettings());
  }

  // --- EXPORT & IMPORT UTILITIES ---

  /**
   * Export all or selected campaigns as a formatted JSON string
   */
  public exportCampaignsJson(campaignIds?: string[]): string {
    const all = this.getCampaigns();
    const toExport = campaignIds && campaignIds.length > 0
      ? all.filter(c => campaignIds.includes(c.id))
      : all;

    const payload = {
      version: '1.0',
      exportType: 'campaigns',
      exportedAt: new Date().toISOString(),
      brand: this.getBrandSettings().brandName,
      campaigns: toExport,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export a single campaign by ID as formatted JSON
   */
  public exportSingleCampaignJson(campaignId: string): string | null {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) return null;

    const payload = {
      version: '1.0',
      exportType: 'single_campaign',
      exportedAt: new Date().toISOString(),
      campaign,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export full system backup (campaigns, brand settings, and participants)
   */
  public exportFullBackupJson(): string {
    const payload = {
      version: '1.0',
      exportType: 'full_backup',
      exportedAt: new Date().toISOString(),
      brandSettings: this.getBrandSettings(),
      campaigns: this.getCampaigns(),
      participants: this.getParticipants(),
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Import campaigns from JSON string with validation
   */
  public importCampaignsJson(
    jsonStr: string,
    mode: 'merge' | 'replace' = 'merge'
  ): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      let incomingCampaigns: Campaign[] = [];

      if (Array.isArray(parsed)) {
        incomingCampaigns = parsed;
      } else if (parsed && parsed.campaigns && Array.isArray(parsed.campaigns)) {
        incomingCampaigns = parsed.campaigns;
      } else if (parsed && parsed.campaign && typeof parsed.campaign === 'object') {
        incomingCampaigns = [parsed.campaign];
      } else if (parsed && parsed.id && parsed.name && parsed.prizes) {
        // Raw single campaign object
        incomingCampaigns = [parsed];
      } else {
        return {
          success: false,
          count: 0,
          error: 'Invalid campaign backup format. Expected a list or campaign object.',
        };
      }

      if (incomingCampaigns.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'No campaigns found in the imported file.',
        };
      }

      // Basic schema check
      const validCampaigns = incomingCampaigns.filter(c => c && c.id && c.name && Array.isArray(c.prizes));

      if (validCampaigns.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'No valid campaigns found with required structure (name, prizes).',
        };
      }

      const existing = this.getCampaigns();
      let updatedList: Campaign[];

      if (mode === 'replace') {
        updatedList = validCampaigns;
      } else {
        // Merge: update existing by ID, add new ones
        const map = new Map<string, Campaign>();
        existing.forEach(c => map.set(c.id, c));
        validCampaigns.forEach(c => map.set(c.id, c));
        updatedList = Array.from(map.values());
      }

      this.saveCampaigns(updatedList);
      return {
        success: true,
        count: validCampaigns.length,
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        error: e?.message || 'Failed to parse JSON file.',
      };
    }
  }

  /**
   * Import full backup (campaigns + brand settings + participants)
   */
  public importFullBackupJson(jsonStr: string): { success: boolean; message: string; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: '', error: 'Invalid backup file format.' };
      }

      let importedItems: string[] = [];

      if (parsed.brandSettings && typeof parsed.brandSettings === 'object') {
        this.saveBrandSettings({
          ...this.getDefaultBrandSettings(),
          ...parsed.brandSettings,
        });
        importedItems.push('Brand Settings');
      }

      if (Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0) {
        this.saveCampaigns(parsed.campaigns);
        importedItems.push(`${parsed.campaigns.length} Campaigns`);
      }

      if (Array.isArray(parsed.participants)) {
        this.saveParticipants(parsed.participants);
        importedItems.push(`${parsed.participants.length} Participants`);
      }

      if (importedItems.length === 0) {
        // Try fallback to campaign import
        const campRes = this.importCampaignsJson(jsonStr, 'merge');
        if (campRes.success) {
          return { success: true, message: `Restored ${campRes.count} campaigns.` };
        }
        return { success: false, message: '', error: 'No valid backup sections detected in JSON.' };
      }

      return {
        success: true,
        message: `Successfully restored: ${importedItems.join(', ')}.`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: '',
        error: e?.message || 'Invalid JSON format in backup file.',
      };
    }
  }

  public saveCampaign(campaign: Campaign): Campaign {
    const campaigns = this.getCampaigns();
    const existingIndex = campaigns.findIndex(c => c.id === campaign.id);
    
    if (existingIndex >= 0) {
      campaigns[existingIndex] = {
        ...campaign,
        updatedAt: new Date().toISOString(),
      };
    } else {
      campaigns.unshift({
        ...campaign,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.saveCampaigns(campaigns);
    return campaign;
  }

  public updateCampaignStatus(id: string, status: CampaignStatus): void {
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      campaign.status = status;
      campaign.updatedAt = new Date().toISOString();
      this.saveCampaigns(campaigns);
    }
  }

  public duplicateCampaign(id: string): Campaign | undefined {
    const campaign = this.getCampaignById(id);
    if (!campaign) return undefined;

    const newId = 'camp-' + Date.now().toString(36);
    const newCampaign: Campaign = {
      ...JSON.parse(JSON.stringify(campaign)),
      id: newId,
      name: `${campaign.name} (Copy)`,
      slug: `${campaign.slug}-copy-${Date.now().toString(36).slice(-4)}`,
      status: 'draft',
      totalSpins: 0,
      totalParticipants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // reset claimed counts on prizes
    newCampaign.prizes.forEach(p => {
      p.claimedCount = 0;
    });

    const campaigns = this.getCampaigns();
    campaigns.unshift(newCampaign);
    this.saveCampaigns(campaigns);
    return newCampaign;
  }

  public deleteCampaign(id: string): void {
    const campaigns = this.getCampaigns().filter(c => c.id !== id);
    this.saveCampaigns(campaigns);
  }

  public toggleParticipantRedemption(participantId: string): void {
    const participants = this.getParticipants();
    const p = participants.find(item => item.id === participantId);
    if (p) {
      p.isRedeemed = !p.isRedeemed;
      p.redeemedAt = p.isRedeemed ? new Date().toISOString() : undefined;
      this.saveParticipants(participants);
      
      // Also post to specific redemption toggle endpoint
      try {
        fetch(`/api/participants/${encodeURIComponent(participantId)}/toggle-redemption`, {
          method: 'POST',
        }).catch(() => {});
      } catch {}
    }
  }

  // Strict Eligibility Check
  public checkEligibility(campaignId: string, phoneNumber: string, name?: string): EligibilityResult {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) {
      return {
        isEligible: false,
        reason: 'Campaign not found or has been removed.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: 'ended',
      };
    }

    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    // Check status
    if (campaign.status === 'draft') {
      return {
        isEligible: false,
        reason: 'This campaign is currently in draft preview and not open for public entry.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: campaign.status,
      };
    }

    if (campaign.status === 'paused') {
      return {
        isEligible: false,
        reason: 'This campaign is temporarily paused by the brand team. Please check back shortly.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: campaign.status,
      };
    }

    if (campaign.status === 'ended' || now > endDate) {
      return {
        isEligible: false,
        reason: 'This campaign has concluded on ' + endDate.toLocaleDateString() + '.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: 'ended',
      };
    }

    if (now < startDate) {
      return {
        isEligible: false,
        reason: 'This campaign starts on ' + startDate.toLocaleDateString() + ' at ' + startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: 'scheduled',
      };
    }

    // Check overall campaign spin / participant cap
    if (campaign.rules.maxTotalSpins > 0 && campaign.totalSpins >= campaign.rules.maxTotalSpins) {
      return {
        isEligible: false,
        reason: 'The campaign has reached its maximum total participation limit. All rewards have been unlocked.',
        spinsRemaining: 0,
        totalSpinsAllowed: 0,
        campaignStatus: campaign.status,
      };
    }

    // Check user phone number history
    const normPhone = normalizePhoneNumber(phoneNumber);
    if (!normPhone || normPhone.length < 6) {
      return {
        isEligible: false,
        reason: 'Please enter a valid phone number to verify eligibility.',
        spinsRemaining: 0,
        totalSpinsAllowed: campaign.rules.maxParticipationsPerPhone || 1,
        campaignStatus: campaign.status,
      };
    }

    const allParticipants = this.getParticipants(campaign.id);
    const userRecords = allParticipants.filter(p => normalizePhoneNumber(p.phoneNumber) === normPhone);
    const maxAllowed = campaign.rules.maxParticipationsPerPhone || 1;
    let actualMaxAllowed = maxAllowed;

    if (userRecords.length > 0) {
      // userRecords are sorted newest first because we use unshift when saving
      const latestRecord = userRecords[0];
      const latestPrize = campaign.prizes.find(p => p.id === latestRecord.prizeId);
      
      // Try Again Rule: Only the first Try Again grants an extra spin.
      // So if the user has reached their limit, but their last spin was Try Again, they get 1 more.
      if ((latestPrize?.actionType === 'try_again' || !latestRecord.isWinner) && userRecords.length === maxAllowed) {
        actualMaxAllowed = maxAllowed + 1;
      }
    }

    const spinsRemaining = Math.max(0, actualMaxAllowed - userRecords.length);

    if (userRecords.length >= actualMaxAllowed) {
      return {
        isEligible: false,
        reason: `This phone number (${phoneNumber}) has already reached its participation limit in this campaign.`,
        spinsRemaining: 0,
        totalSpinsAllowed: actualMaxAllowed,
        previousParticipations: userRecords,
        campaignStatus: campaign.status,
      };
    }

    return {
      isEligible: true,
      spinsRemaining,
      totalSpinsAllowed: actualMaxAllowed,
      previousParticipations: userRecords,
      campaignStatus: campaign.status,
    };
  }

  // Execute Spin and Record Result
  public executeSpin(
    campaignId: string,
    customerName: string,
    phoneNumber: string
  ): {
    success: boolean;
    prize?: PrizeOption;
    prizeIndex?: number;
    record?: ParticipantRecord;
    error?: string;
  } {
    const eligibility = this.checkEligibility(campaignId, phoneNumber, customerName);
    if (!eligibility.isEligible) {
      return {
        success: false,
        error: eligibility.reason,
      };
    }

    const campaign = this.getCampaignById(campaignId);
    if (!campaign || !campaign.prizes || campaign.prizes.length === 0) {
      return {
        success: false,
        error: 'Campaign prize configuration is unavailable.',
      };
    }

    // Filter available prizes (check stock if finite)
    const availablePrizes = campaign.prizes.map((p, index) => ({
      prize: p,
      index,
      inStock: p.totalStock <= 0 || p.claimedCount < p.totalStock,
      weight: p.probability > 0 ? p.probability : 1,
    }));

    // If a prize is out of stock, zero its weight or fallback
    const eligiblePool = availablePrizes.filter(item => item.inStock);

    if (eligiblePool.length === 0) {
      return {
        success: false,
        error: 'All prizes for this campaign have been claimed.',
      };
    }

    // Weighted random selection
    const totalWeight = eligiblePool.reduce((sum, item) => sum + item.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedItem = eligiblePool[0];

    for (const item of eligiblePool) {
      if (randomVal < item.weight) {
        selectedItem = item;
        break;
      }
      randomVal -= item.weight;
    }

    const wonPrize = selectedItem.prize;
    const prizeIndex = selectedItem.index;

    // Create participant record
    const recordId = 'part-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const newRecord: ParticipantRecord = {
      id: recordId,
      campaignId: campaign.id,
      campaignName: campaign.name,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      participatedAt: new Date().toISOString(),
      spinNumber: (eligibility.previousParticipations?.length || 0) + 1,
      prizeId: wonPrize.id,
      prizeLabel: wonPrize.label,
      promoCode: wonPrize.promoCode || 'DELHIVIP',
      isWinner: wonPrize.isWinning,
      discountValue: wonPrize.discountValue,
      isRedeemed: false,
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'Web',
    };

    // Update campaign counters
    const campaigns = this.getCampaigns();
    const campToUpdate = campaigns.find(c => c.id === campaign.id);
    if (campToUpdate) {
      campToUpdate.totalSpins = (campToUpdate.totalSpins || 0) + 1;
      const existingUserParticipant = this.getParticipants(campaign.id).some(
        p => normalizePhoneNumber(p.phoneNumber) === normalizePhoneNumber(phoneNumber)
      );
      if (!existingUserParticipant) {
        campToUpdate.totalParticipants = (campToUpdate.totalParticipants || 0) + 1;
      }
      const targetPrize = campToUpdate.prizes.find(p => p.id === wonPrize.id);
      if (targetPrize) {
        targetPrize.claimedCount = (targetPrize.claimedCount || 0) + 1;
      }
      campToUpdate.updatedAt = new Date().toISOString();
      this.saveCampaigns(campaigns);
    }

    // Save participant locally
    const participants = this.getParticipants();
    participants.unshift(newRecord);
    this.saveParticipants(participants);

    // Call atomic spin server endpoint for immediate guaranteed persistence
    try {
      fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record: newRecord,
          campaignId: campaign.id,
          prizeId: wonPrize.id,
        }),
      }).catch((err) => console.warn('Background spin save error:', err));
    } catch (err) {
      console.warn('Could not post spin:', err);
    }

    return {
      success: true,
      prize: wonPrize,
      prizeIndex,
      record: newRecord,
    };
  }

  // Calculate detailed analytics for a campaign or all campaigns
  public getAnalytics(campaignId?: string): CampaignAnalytics {
    const participants = this.getParticipants(campaignId);
    const campaign = campaignId ? this.getCampaignById(campaignId) : undefined;
    const campaigns = campaign ? [campaign] : this.getCampaigns();

    const totalSpins = participants.length;
    const uniquePhonesSet = new Set(participants.map(p => normalizePhoneNumber(p.phoneNumber)));
    const uniquePhones = uniquePhonesSet.size;
    const winners = participants.filter(p => p.isWinner);
    const winnersCount = winners.length;
    const nonWinnersCount = totalSpins - winnersCount;
    const conversionRate = totalSpins > 0 ? Math.round((winnersCount / totalSpins) * 100) : 0;
    const redemptionCount = participants.filter(p => p.isRedeemed).length;
    const redemptionRate = winnersCount > 0 ? Math.round((redemptionCount / winnersCount) * 100) : 0;

    // Remaining prizes calculation
    let remainingPrizesCount = 0;
    const prizeDistributionMap = new Map<string, { label: string; claimed: number; totalStock: number; remaining: number; percentageOfWins: number }>();

    campaigns.forEach(c => {
      c.prizes.forEach(p => {
        const remaining = p.totalStock > 0 ? Math.max(0, p.totalStock - p.claimedCount) : 999;
        if (p.isWinning && p.totalStock > 0) {
          remainingPrizesCount += remaining;
        }

        const existing = prizeDistributionMap.get(p.id) || {
          label: p.label,
          claimed: 0,
          totalStock: p.totalStock,
          remaining: 0,
          percentageOfWins: 0,
        };
        existing.claimed += p.claimedCount;
        existing.remaining = remaining;
        prizeDistributionMap.set(p.id, existing);
      });
    });

    const prizeDistribution = Array.from(prizeDistributionMap.entries()).map(([prizeId, data]) => ({
      prizeId,
      label: data.label,
      claimed: data.claimed,
      totalStock: data.totalStock,
      remaining: data.remaining,
      percentageOfWins: winnersCount > 0 ? Math.round((data.claimed / winnersCount) * 100) : 0,
    }));

    // Timeline distribution (group by Day)
    const timelineMap = new Map<string, { spins: number; phones: Set<string> }>();
    participants.forEach(p => {
      const dateStr = p.participatedAt.split('T')[0];
      const entry = timelineMap.get(dateStr) || { spins: 0, phones: new Set<string>() };
      entry.spins += 1;
      entry.phones.add(normalizePhoneNumber(p.phoneNumber));
      timelineMap.set(dateStr, entry);
    });

    const timeline = Array.from(timelineMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        spins: data.spins,
        uniqueParticipants: data.phones.size,
      }));

    return {
      totalParticipants: uniquePhones,
      totalSpins,
      uniquePhones,
      winnersCount,
      nonWinnersCount,
      conversionRate,
      redemptionCount,
      redemptionRate,
      remainingPrizesCount,
      prizeDistribution,
      timeline,
    };
  }
}

export const campaignStore = CampaignStore.getInstance();
