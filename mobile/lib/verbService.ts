// Verb Service - Fetches verbs from backend, caches in-memory, seeds from offline list if needed
import { IgboVerb, VerbDifficulty, VerbFrequency, VerbType } from '@/models/verb';
import { offlineVerbs } from '@/data/igboVerbs';
import { getItem, setItem } from '@/lib/storage';

const VERBS_ENDPOINT = process.env.VERBS_ENDPOINT || process.env.EXPO_PUBLIC_VERBS_ENDPOINT || '';
const VERBS_CACHE_KEY = 'VERBS_CACHE_V1';

class VerbService {
  private isInitialized = false;
  private cache: IgboVerb[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 1) Load from persistent cache if available
    try {
      const cached = await getItem(VERBS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as IgboVerb[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache = parsed;
          console.log(`Verb service loaded ${parsed.length} verbs from cache`);
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
        const data = (await res.json()) as IgboVerb[];
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          await setItem(VERBS_CACHE_KEY, JSON.stringify(data));
          console.log(`Verb service initialized from endpoint with ${data.length} verbs (cached)`);
        }
      } catch (error) {
        console.warn('Fetching verbs from endpoint failed. Using cache/offline if available:', error);
      }
    }

    // 3) Fallback seed if nothing available
    if (this.cache.length === 0) {
      this.cache = offlineVerbs.slice(0, 10);
      await setItem(VERBS_CACHE_KEY, JSON.stringify(this.cache));
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
    return this.cache.find(v => v.id === id) || null;
  }

  async searchVerbs(searchTerm: string): Promise<IgboVerb[]> {
    await this.initialize();
    const q = searchTerm.toLowerCase();
    return this.cache.filter(v =>
      v.infinitive.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
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