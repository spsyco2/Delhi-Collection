import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CAMPAIGNS, INITIAL_PARTICIPANTS } from './src/data/initialData';
import { DEFAULT_LOGO_URL, DEFAULT_BACKGROUND_URL } from './src/assets/defaultAssets';
import { Campaign, BrandSettings, ParticipantRecord } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'app_storage.json');

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
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

interface AppStorage {
  campaigns: Campaign[];
  brandSettings: BrandSettings;
  participants: ParticipantRecord[];
  updatedAt: string;
}

// In-memory cache + file persistence helper
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let storageCache: AppStorage = {
  campaigns: INITIAL_CAMPAIGNS,
  brandSettings: DEFAULT_BRAND_SETTINGS,
  participants: INITIAL_PARTICIPANTS,
  updatedAt: new Date().toISOString(),
};

function saveStorage(data: Partial<AppStorage>): AppStorage {
  ensureDataDir();
  storageCache = {
    ...storageCache,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storageCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing storage file:', err);
  }
  return storageCache;
}

function loadStorage(): AppStorage {
  ensureDataDir();
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const loaded: AppStorage = {
        campaigns: Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0 ? parsed.campaigns : INITIAL_CAMPAIGNS,
        brandSettings: parsed.brandSettings ? { ...DEFAULT_BRAND_SETTINGS, ...parsed.brandSettings } : DEFAULT_BRAND_SETTINGS,
        participants: Array.isArray(parsed.participants) ? parsed.participants : INITIAL_PARTICIPANTS,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      storageCache = loaded;
      return loaded;
    } catch (err) {
      console.error('Error reading storage file, falling back to defaults:', err);
    }
  }

  const initial: AppStorage = {
    campaigns: INITIAL_CAMPAIGNS,
    brandSettings: DEFAULT_BRAND_SETTINGS,
    participants: INITIAL_PARTICIPANTS,
    updatedAt: new Date().toISOString(),
  };
  storageCache = initial;
  saveStorage(initial);
  return initial;
}

storageCache = loadStorage();

async function startServer() {
  const app = express();

  // Parse JSON payloads with generous limit for custom background images/base64 uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- REST API ENDPOINTS ---

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Unified Sync (GET /api/sync, POST /api/sync)
  app.get('/api/sync', (req, res) => {
    res.json({
      success: true,
      campaigns: storageCache.campaigns,
      brandSettings: storageCache.brandSettings,
      participants: storageCache.participants,
      updatedAt: storageCache.updatedAt,
    });
  });

  app.post('/api/sync', (req, res) => {
    const { campaigns, brandSettings, participants } = req.body || {};
    const updates: Partial<AppStorage> = {};

    if (Array.isArray(campaigns)) {
      // Merge campaigns while protecting live spin counts and claimed prize counters
      const mergedCampaigns = campaigns.map((incomingCamp) => {
        const existing = storageCache.campaigns.find((c) => c.id === incomingCamp.id);
        if (!existing) return incomingCamp;

        const totalSpins = Math.max(incomingCamp.totalSpins || 0, existing.totalSpins || 0);
        const totalParticipants = Math.max(incomingCamp.totalParticipants || 0, existing.totalParticipants || 0);

        const mergedPrizes = (incomingCamp.prizes || []).map((p) => {
          const existingPrize = existing.prizes?.find((ep) => ep.id === p.id);
          const claimedCount = Math.max(p.claimedCount || 0, existingPrize?.claimedCount || 0);
          return { ...p, claimedCount };
        });

        return {
          ...incomingCamp,
          totalSpins,
          totalParticipants,
          prizes: mergedPrizes,
        };
      });
      updates.campaigns = mergedCampaigns;
    }

    if (brandSettings && typeof brandSettings === 'object') {
      updates.brandSettings = {
        ...DEFAULT_BRAND_SETTINGS,
        ...storageCache.brandSettings,
        ...brandSettings,
      };
    }

    if (Array.isArray(participants)) {
      // Safe non-destructive participant merging: keep all existing + merge incoming by ID
      const map = new Map<string, ParticipantRecord>();
      // First populate existing server participants
      storageCache.participants.forEach((p) => {
        if (p && p.id) map.set(p.id, p);
      });
      // Merge incoming
      participants.forEach((p) => {
        if (p && p.id) {
          const existing = map.get(p.id);
          if (existing) {
            map.set(p.id, { ...existing, ...p });
          } else {
            map.set(p.id, p);
          }
        }
      });
      const mergedList = Array.from(map.values()).sort(
        (a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime()
      );
      updates.participants = mergedList;
    }

    const updated = saveStorage(updates);
    res.json({
      success: true,
      updatedAt: updated.updatedAt,
      campaignsCount: updated.campaigns.length,
      participantsCount: updated.participants.length,
    });
  });

  // Dedicated atomic spin recording endpoint
  app.post('/api/spin', (req, res) => {
    const { record, campaignId, prizeId } = req.body || {};
    const participant: ParticipantRecord = record || req.body;

    if (!participant || !participant.id || !participant.phoneNumber) {
      res.status(400).json({ success: false, error: 'Invalid participant record payload' });
      return;
    }

    // 1. Append or update participant
    const existingParticipants = [...storageCache.participants];
    const existingIndex = existingParticipants.findIndex((p) => p.id === participant.id);
    if (existingIndex >= 0) {
      existingParticipants[existingIndex] = { ...existingParticipants[existingIndex], ...participant };
    } else {
      existingParticipants.unshift(participant);
    }

    // 2. Increment campaign and prize counters
    const targetCampaignId = campaignId || participant.campaignId;
    const targetPrizeId = prizeId || participant.prizeId;
    const campaigns = [...storageCache.campaigns];
    const camp = campaigns.find((c) => c.id === targetCampaignId);

    if (camp) {
      camp.totalSpins = (camp.totalSpins || 0) + 1;
      const isFirstSpinForPhone = !storageCache.participants.some(
        (p) => p.id !== participant.id && p.campaignId === targetCampaignId && p.phoneNumber === participant.phoneNumber
      );
      if (isFirstSpinForPhone) {
        camp.totalParticipants = (camp.totalParticipants || 0) + 1;
      }
      if (targetPrizeId && Array.isArray(camp.prizes)) {
        const prize = camp.prizes.find((p) => p.id === targetPrizeId);
        if (prize) {
          prize.claimedCount = (prize.claimedCount || 0) + 1;
        }
      }
      camp.updatedAt = new Date().toISOString();
    }

    const updated = saveStorage({
      participants: existingParticipants,
      campaigns,
    });

    res.json({
      success: true,
      participant,
      totalParticipants: updated.participants.length,
      campaign: camp,
    });
  });

  // 2. Campaigns Endpoints
  app.get('/api/campaigns', (req, res) => {
    res.json(storageCache.campaigns);
  });

  app.post('/api/campaigns', (req, res) => {
    const incoming = req.body;
    if (Array.isArray(incoming)) {
      saveStorage({ campaigns: incoming });
      res.json({ success: true, count: incoming.length });
    } else if (incoming && typeof incoming === 'object' && incoming.id) {
      // Single campaign update/insert
      const campaigns = [...storageCache.campaigns];
      const index = campaigns.findIndex((c) => c.id === incoming.id);
      if (index >= 0) {
        campaigns[index] = { ...incoming, updatedAt: new Date().toISOString() };
      } else {
        campaigns.unshift({ ...incoming, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      saveStorage({ campaigns });
      res.json({ success: true, campaign: incoming });
    } else {
      res.status(400).json({ error: 'Invalid campaign data payload' });
    }
  });

  app.get('/api/campaigns/:id', (req, res) => {
    const id = req.params.id;
    const campaign = storageCache.campaigns.find((c) => c.id === id || c.slug === id);
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    res.json(campaign);
  });

  app.delete('/api/campaigns/:id', (req, res) => {
    const id = req.params.id;
    const campaigns = storageCache.campaigns.filter((c) => c.id !== id);
    saveStorage({ campaigns });
    res.json({ success: true, id });
  });

  // 3. Brand Settings Endpoints
  app.get('/api/brand-settings', (req, res) => {
    res.json(storageCache.brandSettings);
  });

  app.post('/api/brand-settings', (req, res) => {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      res.status(400).json({ error: 'Invalid brand settings payload' });
      return;
    }
    const merged = {
      ...DEFAULT_BRAND_SETTINGS,
      ...storageCache.brandSettings,
      ...newSettings,
    };
    saveStorage({ brandSettings: merged });
    res.json({ success: true, brandSettings: merged });
  });

  // 4. Participants Endpoints
  app.get('/api/participants', (req, res) => {
    const campaignId = req.query.campaignId as string | undefined;
    if (campaignId) {
      const filtered = storageCache.participants.filter((p) => p.campaignId === campaignId);
      res.json(filtered);
    } else {
      res.json(storageCache.participants);
    }
  });

  app.post('/api/participants', (req, res) => {
    const incoming = req.body;
    if (Array.isArray(incoming)) {
      saveStorage({ participants: incoming });
      res.json({ success: true, count: incoming.length });
    } else if (incoming && typeof incoming === 'object' && incoming.id) {
      const participants = [incoming, ...storageCache.participants.filter((p) => p.id !== incoming.id)];
      saveStorage({ participants });
      res.json({ success: true, participant: incoming });
    } else {
      res.status(400).json({ error: 'Invalid participant data payload' });
    }
  });

  // 5. Toggle participant redemption
  app.post('/api/participants/:id/toggle-redemption', (req, res) => {
    const id = req.params.id;
    const participants = [...storageCache.participants];
    const p = participants.find((item) => item.id === id);
    if (p) {
      p.isRedeemed = !p.isRedeemed;
      p.redeemedAt = p.isRedeemed ? new Date().toISOString() : undefined;
      saveStorage({ participants });
      res.json({ success: true, participant: p });
    } else {
      res.status(404).json({ error: 'Participant not found' });
    }
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Delhi Collection Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
