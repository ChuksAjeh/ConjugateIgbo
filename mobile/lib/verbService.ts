// Verb Service - Fetches verbs from backend, caches in-memory, seeds from offline list if needed
import * as Sentry from '@sentry/react-native';
import { IgboVerb, VerbDTO } from '@/models/verb';
import type { Dialect } from '@/models/verb';
import { offlineVerbs } from '@/data/igboVerbs';
import { getItem, setItem } from '@/lib/storage';
import Constants from 'expo-constants';

const BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ??
  Constants.manifest?.extra?.EXPO_PUBLIC_API_URL ??
  '';
const BASE = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';
const VERBS_CACHE_KEY_V2 = 'VERBS_CACHE_V2';
/**
 * Formats a dialect enum into its corresponding slug used in API endpoints.
 * @type {Record<Dialect, string>}
 */
const DIALECT_SLUG: Record<Dialect, string> = {
  delta: 'delta-igbo',
  central: 'central-igbo',
  anambra: 'anambra-igbo',
  imo: 'imo-igbo',
  abia: 'abia-igbo',
};

/**
 * Generates a unique cache key for a specific dialect.
 * @param {Dialect} d - The dialect.
 * @returns {string} - The cache key.
 */
function cacheKeyForDialect(d: Dialect) {
  return `${VERBS_CACHE_KEY_V2}_${d}`;
}

/**
 * Maps a Verb Data Transfer Object (DTO) to the internal IgboVerb model.
 * @param {VerbDTO} dto - The DTO from the API.
 * @returns {IgboVerb} - The mapped verb object.
 */
function mapDtoToVerb(dto: VerbDTO): IgboVerb {
  return {
    id: String(dto.id),
    igbo: dto.igbo,
    english: dto.english,
    freqRank: dto.freqRank ?? undefined,
  };
}

/**
 * Verb Service - Fetches verbs from backend, caches in-memory, and seeds from offline list if needed.
 */
class VerbService {
  /**
   * In-memory cache of verbs grouped by dialect.
   * @private
   */
  private cacheByDialect: Partial<Record<Dialect, IgboVerb[]>> = {};

  /**
   * Tracks which dialects have already been preloaded to avoid duplicate work.
   * @private
   */
  private hasPreloaded: Partial<Record<Dialect, boolean>> = {};

  /**
   * Tracks whether a background API fetch is in progress for a dialect.
   * @private
   */
  private isFetchingInBackground: Partial<Record<Dialect, boolean>> = {};

  /**
   * Constructor - immediately seeds delta with offline verbs for instant access.
   */
  constructor() {
    // Immediately seed delta dialect with offline verbs for instant availability
    this.cacheByDialect['delta'] = [...offlineVerbs];
    Sentry.logger.info(
      `[verbService] Initialized with ${offlineVerbs.length} offline verbs for delta`,
      { tags: { feature: 'verb-service' } },
    );
  }

  /**
   * Migrates legacy V1 verb data structure to V2.
   * @param {any[]} arr - Array of verbs (legacy or current).
   * @param {Dialect} dialect - The dialect for which migration is occurring.
   * @returns {IgboVerb[]} - Array of migrated verbs.
   * @private
   */
  private migrateV1ToV2 = (arr: any[], dialect: Dialect): IgboVerb[] => {
    let migratedCount = 0;
    const migrated = arr.map((v: any) => {
      // If already aligned, return as-is
      if (v && typeof v === 'object' && 'igbo' in v && 'english' in v) {
        return { ...v, id: String(v.id ?? v.igbo) } as IgboVerb;
      }
      // Legacy shape with infinitive/meaning
      migratedCount++;
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

    if (migratedCount > 0) {
      Sentry.logger.info(
        `[verbService] Migrated ${migratedCount} legacy verbs to V2 for ${dialect}`,
        {
          tags: { feature: 'verb-service' },
        },
      );
    }

    return migrated;
  };

  /**
   * Attempts to load verbs from local storage cache.
   * @param {Dialect} dialect - The dialect to load.
   * @private
   */
  private async loadFromCache(dialect: Dialect): Promise<void> {
    if (this.cacheByDialect[dialect]) return;

    const key = cacheKeyForDialect(dialect);
    try {
      const cached = await getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = this.migrateV1ToV2(parsed, dialect);
          this.cacheByDialect[dialect] = mapped;
          Sentry.logger.info(
            `[verbService] Verb service loaded ${mapped.length} ${dialect} verbs from cache`,
            {
              tags: { feature: 'verb-service' },
            },
          );
        }
      }
    } catch (e: any) {
      Sentry.captureException(e, {
        tags: { feature: 'verb-service' },
        extra: { context: `Failed to load/parse verbs cache for ${dialect}` },
      });
    }
  }

  /**
   * Attempts to fetch verbs from the API for the given dialect.
   * @param {Dialect} dialect - The dialect to fetch.
   * @private
   */
  private async fetchFromAPI(dialect: Dialect): Promise<void> {
    if (!BASE) {
      Sentry.logger.warn(
        `[verbService] BASE_URL missing, skipping API fetch for ${dialect}`,
        {
          tags: { feature: 'verb-service' },
        },
      );
      return;
    }

    const key = cacheKeyForDialect(dialect);
    const endpoint = `${BASE}/${DIALECT_SLUG[dialect]}/verbs/all`;
    Sentry.logger.info(
      `[verbService] Fetching verbs from endpoint: ${endpoint}`,
      {
        tags: { feature: 'verb-service' },
      },
    );

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as VerbDTO[];
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDtoToVerb);
        this.cacheByDialect[dialect] = mapped;
        Sentry.logger.info(
          `[verbService] Final verb count for ${dialect}: ${mapped.length}`,
          { tags: { feature: 'verb-service' } },
        );
        try {
          await setItem(key, JSON.stringify(mapped));
        } catch (storageError: any) {
          Sentry.captureException(storageError, {
            tags: { feature: 'verb-service' },
            extra: { context: `Failed to save ${dialect} verbs to cache` },
          });
        }
        Sentry.logger.info(
          `[verbService] Verb service initialized from endpoint with ${mapped.length} ${dialect} verbs (cached)`,
          {
            tags: { feature: 'verb-service' },
          },
        );
      } else {
        Sentry.logger.warn(
          `[verbService] API returned empty or invalid data for ${dialect}`,
          {
            tags: { feature: 'verb-service' },
            extra: { data },
          },
        );
      }
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'verb-service' },
        extra: {
          context: `Fetching verbs from endpoint failed for ${dialect}`,
        },
      });
    }
  }

  /**
   * Handles fallbacks if the requested dialect has no verbs.
   * @param {Dialect} dialect - The dialect that failed to load.
   * @returns {Promise<{ dialectUsed: Dialect }>} - The dialect that was actually used (may be 'delta').
   * @private
   */
  private async handleFallbacks(
    dialect: Dialect,
  ): Promise<{ dialectUsed: Dialect }> {
    if (
      !this.cacheByDialect[dialect] ||
      this.cacheByDialect[dialect]!.length === 0
    ) {
      if (dialect !== 'delta') {
        Sentry.logger.info(
          `[verbService] No verbs for ${dialect}, attempting fallback to delta`,
          {
            tags: { feature: 'verb-service' },
          },
        );
        await this.ensureLoaded('delta');
        if (
          this.cacheByDialect['delta'] &&
          this.cacheByDialect['delta']!.length > 0
        ) {
          return { dialectUsed: 'delta' };
        }
      }

      // As a last resort, seed delta from offline
      if (
        !this.cacheByDialect['delta'] ||
        this.cacheByDialect['delta']!.length === 0
      ) {
        this.cacheByDialect['delta'] = offlineVerbs.slice(0, 10);
        try {
          await setItem(
            cacheKeyForDialect('delta'),
            JSON.stringify(this.cacheByDialect['delta']),
          );
        } catch (storageError: any) {
          Sentry.captureException(storageError, {
            tags: { feature: 'verb-service' },
            extra: { context: 'Failed to save offline seed to cache' },
          });
        }
        Sentry.logger.info(
          `[verbService] Verb service initialized delta with offline seed (${
            this.cacheByDialect['delta']!.length
          } verbs)`,
          {
            tags: { feature: 'verb-service' },
          },
        );
        return { dialectUsed: 'delta' };
      }
    }

    return { dialectUsed: dialect };
  }

  /**
   * Orchestrates loading of verbs for a given dialect.
   * Prioritizes immediate availability: offline -> cache -> API (background).
   * @param {Dialect} dialect - The dialect to ensure is loaded.
   * @returns {Promise<{ dialectUsed: Dialect }>} - Information on which dialect was loaded.
   * @private
   */
  private async ensureLoaded(
    dialect: Dialect,
  ): Promise<{ dialectUsed: Dialect }> {
    // If we already have verbs for this dialect in memory, return immediately
    if (this.cacheByDialect[dialect] && this.cacheByDialect[dialect]!.length > 0) {
      // Trigger background API fetch to refresh data (non-blocking)
      this.fetchInBackground(dialect);
      return { dialectUsed: dialect };
    }

    // Try loading from persistent cache
    await this.loadFromCache(dialect);
    
    // If cache loaded successfully, return immediately and fetch API in background
    if (this.cacheByDialect[dialect] && this.cacheByDialect[dialect]!.length > 0) {
      this.fetchInBackground(dialect);
      return { dialectUsed: dialect };
    }

    // No cache available - try API (blocking since we have no data)
    await this.fetchFromAPI(dialect);

    // Handle fallbacks if still no data
    return this.handleFallbacks(dialect);
  }

  /**
   * Fetches verbs from API in the background without blocking.
   * Updates the cache when complete.
   * @param {Dialect} dialect - The dialect to fetch.
   * @private
   */
  private fetchInBackground(dialect: Dialect): void {
    // Avoid duplicate background fetches
    if (this.isFetchingInBackground[dialect]) return;
    
    this.isFetchingInBackground[dialect] = true;
    
    // Fire and forget - don't await
    this.fetchFromAPI(dialect)
      .catch((error) => {
        Sentry.captureException(error, {
          tags: { feature: 'verb-service', phase: 'background-fetch' },
          extra: { dialect },
        });
      })
      .finally(() => {
        this.isFetchingInBackground[dialect] = false;
      });
  }

  /**
   * Preload verbs for a dialect at app startup.
   * This warms cache + storage so screens don’t render empty.
   * @param {Dialect} dialect - The dialect to preload.
   */
  async preload(dialect: Dialect): Promise<void> {
    if (this.hasPreloaded[dialect]) {
      return;
    }

    this.hasPreloaded[dialect] = true;

    try {
      await this.ensureLoaded(dialect);
      Sentry.logger.info(`[verbService] Preloaded verbs for ${dialect}`, {
        tags: { feature: 'verb-service' },
      });
    } catch (error) {
      // Allow retry on next preload attempt if something went wrong
      this.hasPreloaded[dialect] = false;

      Sentry.captureException(error, {
        tags: { feature: 'verb-service', phase: 'preload' },
        extra: { dialect },
      });
    }
  }

  /**
   * Retrieves all verbs for a specific dialect.
   * Falls back to 'delta' if requested dialect is unavailable.
   * @param {Dialect} dialect - The requested dialect.
   * @returns {Promise<{ verbs: IgboVerb[]; fellBackToDelta: boolean }>} - Object containing verbs and fallback status.
   */
  async getAllVerbsForDialect(
    dialect: Dialect,
    limit?: number,
  ): Promise<{ verbs: IgboVerb[]; fellBackToDelta: boolean }> {
    const { dialectUsed } = await this.ensureLoaded(dialect);
    const used = dialectUsed === 'delta' && dialect !== 'delta';
    let verbs = [...(this.cacheByDialect[dialectUsed] || [])];

    if (limit) {
      // Filter by freqRank if available, otherwise just slice
      const filtered = verbs.filter(
        (v) =>
          v.freqRank !== undefined && v.freqRank !== null && v.freqRank <= limit,
      );
      if (filtered.length > 0) {
        verbs = filtered;
      } else {
        verbs = verbs.slice(0, limit);
      }
    }

    if (verbs.length === 0) {
      Sentry.captureMessage(
        `[verbService] No verbs available for dialect: ${dialect}`,
        {
          level: 'error',
          tags: { feature: 'verb-service' },
        },
      );
    }

    return { verbs, fellBackToDelta: used };
  }

  /**
   * Retrieves a random verb for a specific dialect.
   * @param {Dialect} dialect - The requested dialect.
   * @returns {Promise<{ verb: IgboVerb; fellBackToDelta: boolean }>} - Object containing the random verb and fallback status.
   */
  async getRandomVerbForDialect(
    dialect: Dialect,
    limit?: number,
  ): Promise<{ verb: IgboVerb; fellBackToDelta: boolean }> {
    const { verbs, fellBackToDelta } =
      await this.getAllVerbsForDialect(dialect, limit);

    if (verbs.length === 0) {
      Sentry.captureMessage(
        `[verbService] Cannot get random verb: verb list is empty for ${dialect}`,
        {
          level: 'error',
          tags: { feature: 'verb-service' },
        },
      );
    }

    const idx = Math.floor(Math.random() * Math.max(1, verbs.length));
    return { verb: verbs[idx], fellBackToDelta };
  }

  /**
   * Backward-compatible method to get all verbs (defaults to 'delta').
   * @deprecated Use getAllVerbsForDialect instead if dialect-specific verbs are needed.
   * @returns {Promise<IgboVerb[]>} - Array of verbs.
   */
  async getAllVerbs(): Promise<IgboVerb[]> {
    const { verbs } = await this.getAllVerbsForDialect('delta');
    return verbs;
  }

  /**
   * Backward-compatible method to get a random verb (defaults to 'delta').
   * @deprecated Use getRandomVerbForDialect instead if dialect-specific verbs are needed.
   * @returns {Promise<IgboVerb>} - A random verb.
   */
  async getRandomVerb(): Promise<IgboVerb> {
    const { verb } = await this.getRandomVerbForDialect('delta');
    return verb;
  }
}

export const verbService = new VerbService();
