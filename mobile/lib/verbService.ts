// Verb Service - Handles verb data with fallback to local data
import { IgboVerb } from '@/data/igboVerbs';
import { igboVerbs } from '@/data/igboVerbs';
import { verbDatabase } from './database';

class VerbService {
  private useDatabase = false; // Toggle this when database is ready
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.useDatabase) {
        await verbDatabase.connect();
        console.log('Verb service initialized with database');
      } else {
        console.log('Verb service initialized with local data');
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Database connection failed, falling back to local data:', error);
      this.useDatabase = false;
      this.isInitialized = true;
    }
  }

  async getAllVerbs(): Promise<IgboVerb[]> {
    await this.initialize();

    if (this.useDatabase) {
      try {
        return await verbDatabase.getAllVerbs();
      } catch (error) {
        console.warn('Database query failed, using local data:', error);
        return igboVerbs;
      }
    }

    return igboVerbs;
  }

  async getVerbById(id: string): Promise<IgboVerb | null> {
    await this.initialize();

    if (this.useDatabase) {
      try {
        return await verbDatabase.getVerbById(id);
      } catch (error) {
        console.warn('Database query failed, using local data:', error);
        return igboVerbs.find(verb => verb.id === id) || null;
      }
    }

    return igboVerbs.find(verb => verb.id === id) || null;
  }

  async searchVerbs(searchTerm: string): Promise<IgboVerb[]> {
    await this.initialize();

    if (this.useDatabase) {
      try {
        return await verbDatabase.searchVerbs(searchTerm);
      } catch (error) {
        console.warn('Database query failed, using local data:', error);
        return this.searchLocalVerbs(searchTerm);
      }
    }

    return this.searchLocalVerbs(searchTerm);
  }

  async getVerbsByFilter(filters: {
    type?: 'regular' | 'irregular';
    frequency?: 'high' | 'medium' | 'low';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<IgboVerb[]> {
    await this.initialize();

    if (this.useDatabase) {
      try {
        return await verbDatabase.getVerbsByFilter(filters);
      } catch (error) {
        console.warn('Database query failed, using local data:', error);
        return this.filterLocalVerbs(filters);
      }
    }

    return this.filterLocalVerbs(filters);
  }

  async getRandomVerb(): Promise<IgboVerb> {
    const verbs = await this.getAllVerbs();
    const randomIndex = Math.floor(Math.random() * verbs.length);
    return verbs[randomIndex];
  }

  // Local data fallback methods
  private searchLocalVerbs(searchTerm: string): IgboVerb[] {
    const lowercaseQuery = searchTerm.toLowerCase();
    return igboVerbs.filter(verb => 
      verb.infinitive.toLowerCase().includes(lowercaseQuery) ||
      verb.meaning.toLowerCase().includes(lowercaseQuery)
    );
  }

  private filterLocalVerbs(filters: {
    type?: 'regular' | 'irregular';
    frequency?: 'high' | 'medium' | 'low';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }): IgboVerb[] {
    return igboVerbs.filter(verb => {
      if (filters.type && verb.type !== filters.type) return false;
      if (filters.frequency && verb.frequency !== filters.frequency) return false;
      if (filters.difficulty && verb.difficulty !== filters.difficulty) return false;
      return true;
    });
  }

  // Enable database mode (call this when database is ready)
  enableDatabase(): void {
    this.useDatabase = true;
    this.isInitialized = false; // Force re-initialization
  }

  // Disable database mode (fallback to local data)
  disableDatabase(): void {
    this.useDatabase = false;
  }
}

// Singleton instance
export const verbService = new VerbService();

// Convenience exports
export const {
  getAllVerbs,
  getVerbById,
  searchVerbs,
  getVerbsByFilter,
  getRandomVerb,
} = verbService;