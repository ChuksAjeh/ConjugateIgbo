// Verb Service - Fetches verbs from backend, caches in-memory, seeds from offline list if needed
import { IgboVerb, VerbDifficulty, VerbFrequency, VerbType, VerbDTO } from '@/models/verb';
import type { Dialect } from '@/lib/conjugateVerbs';
import { offlineVerbs } from '@/data/igboVerbs';
import { getItem, setItem } from '@/lib/storage';

const BASE_URL = process.env.VERBS_ENDPOINT || process.env.EXPO_PUBLIC_VERBS_ENDPOINT || '';
const BASE = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';
const VERBS_CACHE_KEY_V2 = 'VERBS_CACHE_V2';
const VERBS_CACHE_KEY_V1 = 'VERBS_CACHE_V1';

const DIALECT_SLUG: Record<Dialect, string> = {
  delta: 'delta-igbo',
  central: 'central-igbo',
  anambra: 'anambra-igbo',
  imo: 'imo-igbo',
  abia: 'abia-igbo',
};

function cacheKeyForDialect(d: Dialect) {
  return `${VERBS_CACHE_KEY_V2}_${d}`;
}

function mapDtoToVerb(dto: VerbDTO): IgboVerb {
  return {
    id: String(dto.id),
    igbo: dto.igbo,
    english: dto.english,
    freqRank: dto.freqRank ?? undefined,
  };
}

class VerbService {
  private cacheByDialect: Partial<Record<Dialect, IgboVerb[]>> = {};

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

  private async ensureLoaded(dialect: Dialect): Promise<{ dialectUsed: Dialect }> {
    const key = cacheKeyForDialect(dialect);

    // 1) Try cache for this dialect
    try {
      if (!this.cacheByDialect[dialect]) {
        const cached = await getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached) as IgboVerb[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cacheByDialect[dialect] = parsed;
            console.log(`Verb service loaded ${parsed.length} ${dialect} verbs from cache`);
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to parse verbs cache for ${dialect}, ignoring:`, e);
    }

    // 2) Try to fetch from API for this dialect
    if (BASE && !this.cacheByDialect[dialect]) {
      const endpoint = `${BASE}/${DIALECT_SLUG[dialect]}/verbs/all`;
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VerbDTO[];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDtoToVerb);
          this.cacheByDialect[dialect] = mapped;
          await setItem(key, JSON.stringify(mapped));
          console.log(`Verb service initialized from endpoint with ${mapped.length} ${dialect} verbs (cached)`);
        }
      } catch (error) {
        console.warn(`Fetching verbs from endpoint failed for ${dialect}.`, error);
      }
    }

    // 3) Fallbacks
    // If requested dialect still empty and it's not delta, try delta
    if (!this.cacheByDialect[dialect] || this.cacheByDialect[dialect]!.length === 0) {
      if (dialect !== 'delta') {
        await this.ensureLoaded('delta');
        if (this.cacheByDialect['delta'] && this.cacheByDialect['delta']!.length > 0) {
          return { dialectUsed: 'delta' };
        }
      }
      // As a last resort, seed delta from offline
      if (!this.cacheByDialect['delta'] || this.cacheByDialect['delta']!.length === 0) {
        this.cacheByDialect['delta'] = offlineVerbs.slice(0, 10);
        await setItem(cacheKeyForDialect('delta'), JSON.stringify(this.cacheByDialect['delta']));
        console.log(`Verb service initialized delta with offline seed (${this.cacheByDialect['delta']!.length} verbs)`);
        return { dialectUsed: 'delta' };
      }
    }

    return { dialectUsed: dialect };
  }

  async getAllVerbsForDialect(dialect: Dialect): Promise<{ verbs: IgboVerb[]; fellBackToDelta: boolean }> {
    const { dialectUsed } = await this.ensureLoaded(dialect);
    const used = dialectUsed === 'delta' && dialect !== 'delta';
    const verbs = this.cacheByDialect[dialectUsed] || [];
    return { verbs, fellBackToDelta: used };
  }

  async getRandomVerbForDialect(dialect: Dialect): Promise<{ verb: IgboVerb; fellBackToDelta: boolean }> {
    const { verbs, fellBackToDelta } = await this.getAllVerbsForDialect(dialect);
    const idx = Math.floor(Math.random() * Math.max(1, verbs.length));
    return { verb: verbs[idx], fellBackToDelta };
  }

  // Backward-compat methods (default to delta)
  async getAllVerbs(): Promise<IgboVerb[]> {
    const { verbs } = await this.getAllVerbsForDialect('delta');
    return verbs;
  }
  async getRandomVerb(): Promise<IgboVerb> {
    const { verb } = await this.getRandomVerbForDialect('delta');
    return verb;
  }
}

export const verbService = new VerbService();