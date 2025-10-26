// Verb Service - Fetches verbs from backend, caches in-memory, seeds from offline list if needed
import { IgboVerb, VerbDifficulty, VerbFrequency, VerbType, VerbDTO } from '@/models/verb';
import { offlineVerbs } from '@/data/igboVerbs';
import { getItem, setItem } from '@/lib/storage';

const BASE_URL = process.env.VERBS_ENDPOINT || process.env.EXPO_PUBLIC_VERBS_ENDPOINT || '';
const VERBS_ENDPOINT = BASE_URL ? `${BASE_URL.replace(/\/$/, '')}/delta-igbo/verbs/all` : '';
const VERBS_CACHE_KEY_V2 = 'VERBS_CACHE_V2';
const VERBS_CACHE_KEY_V1 = 'VERBS_CACHE_V1';

function mapDtoToVerb(dto: VerbDTO): IgboVerb {
  return {
    id: String(dto.id),
    igbo: dto.igbo,
    english: dto.english,
    freqRank: dto.freqRank ?? undefined,
  };
}

class VerbService {
  private isInitialized = false;
  private cache: IgboVerb[] = [];

  private migrateV1ToV2 = (arr: any[]): IgboVerb[] => {
    return arr.map((v: any) => {
      // If already aligned, return as-is
      if (v && typeof v === 'object' && 'igbo' in v && 'english' in v) {
        return { ...v, id: String(v.id ?? v.igbo) } as IgboVerb;
      }
      // Legacy shape with infinitive/meaning
      return {
        id: String(v.id ?? v.infinitive ?? ''),
        igbo: v.infinitive ?? '',
        english: v.meaning ?? '',
        // carry over optional legacy fields
        type: v.type,
        difficulty: v.difficulty,
        frequency: v.frequency,
        rootForm: v.rootForm,
        prefix: v.prefix,
        suffix: v.suffix,
        conjugations: v.conjugations,
        examples: v.examples,
      } as IgboVerb;
    });
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 1) Load from a persistent cache (V2), or migrate from V1 if present
    try {
      const cachedV2 = await getItem(VERBS_CACHE_KEY_V2);
      if (cachedV2) {
        const parsed = JSON.parse(cachedV2) as IgboVerb[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache = parsed;
          console.log(`Verb service loaded ${parsed.length} verbs from V2 cache`);
        }
      } else {
        const cachedV1 = await getItem(VERBS_CACHE_KEY_V1);
        if (cachedV1) {
          const parsedV1 = JSON.parse(cachedV1) as any[];
          if (Array.isArray(parsedV1) && parsedV1.length > 0) {
            const migrated = this.migrateV1ToV2(parsedV1);
            this.cache = migrated;
            await setItem(VERBS_CACHE_KEY_V2, JSON.stringify(migrated));
            console.log(`Migrated ${migrated.length} verbs from V1 to V2 cache`);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse verbs cache, ignoring:', e);
    }

    // 2) Try to fetch from API (refresh cache)
    if (VERBS_ENDPOINT) {
      try {
        const res = await fetch(VERBS_ENDPOINT);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VerbDTO[];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDtoToVerb);
          this.cache = mapped;
          await setItem(VERBS_CACHE_KEY_V2, JSON.stringify(mapped));
          console.log(`Verb service initialized from endpoint with ${mapped.length} verbs (cached V2)`);
        }
      } catch (error) {
        console.warn('Fetching verbs from endpoint failed. Using cache/offline if available:', error);
      }
    }

    // 3) Fallback seed if nothing available
    if (this.cache.length === 0) {
      this.cache = offlineVerbs.slice(0, 10);
      await setItem(VERBS_CACHE_KEY_V2, JSON.stringify(this.cache));
      console.log(`Verb service initialized with offline seed (${this.cache.length} verbs)`);
    }

    this.isInitialized = true;
  }

  async getAllVerbs(): Promise<IgboVerb[]> {
    await this.initialize();
    return this.cache;
  }

  async getVerbById(id: string): Promise<IgboVerb | null> {
    await this.initialize();
    return this.cache.find(v => String(v.id) === String(id)) || null;
  }

  async searchVerbs(searchTerm: string): Promise<IgboVerb[]> {
    await this.initialize();
    const q = searchTerm.toLowerCase();
    return this.cache.filter(v =>
      (v.igbo ?? '').toLowerCase().includes(q) || (v.english ?? '').toLowerCase().includes(q)
    );
  }

  async getVerbsByFilter(filters: {
    type?: VerbType;
    frequency?: VerbFrequency;
    difficulty?: VerbDifficulty;
  }): Promise<IgboVerb[]> {
    await this.initialize();
    return this.cache.filter(verb => {
      if (filters.type && verb.type !== filters.type) return false;
      if (filters.frequency && verb.frequency !== filters.frequency) return false;
      if (filters.difficulty && verb.difficulty !== filters.difficulty) return false;
      return true;
    });
  }

  async getRandomVerb(): Promise<IgboVerb> {
    const verbs = await this.getAllVerbs();
    const idx = Math.floor(Math.random() * verbs.length);
    return verbs[idx];
  }
}

export const verbService = new VerbService();

export const {
  getAllVerbs,
  getVerbById,
  searchVerbs,
  getVerbsByFilter,
  getRandomVerb,
} = verbService;