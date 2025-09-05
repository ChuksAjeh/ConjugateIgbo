import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialect, AspectForm, IgboVerb } from '../data/igboVerbs';

// Types
export interface UserProgress {
  verbId: string;
  dialect: Dialect;
  aspect: AspectForm;
  totalAttempts: number;
  correctAttempts: number;
  lastReviewed: Date;
  nextReview: Date;
  masteryLevel: number; // 0-5
  streak: number;
}

export interface AppSettings {
  selectedDialect: Dialect;
  typeToAnswer: boolean;
  showToneMarks: boolean;
  includeIrregulars: boolean;
  enabledAspects: AspectForm[];
  dailyGoal: number;
  isPremium: boolean;
}

export interface AppStats {
  totalPracticed: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: { day: string; count: number }[];
  aspectStrengths: { [key in AspectForm]: number };
}

// Store interface
interface AppStore {
  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Progress
  progress: UserProgress[];
  updateProgress: (verbId: string, dialect: Dialect, aspect: AspectForm, isCorrect: boolean) => void;
  getVerbProgress: (verbId: string, dialect: Dialect, aspect: AspectForm) => UserProgress | undefined;
  
  // Stats
  stats: AppStats;
  updateStats: () => void;
  
  // SRS
  getDueReviews: () => UserProgress[];
  getReviewsForToday: () => UserProgress[];
  
  // Premium
  upgradeToPremium: () => void;
  
  // Practice session
  currentSession: {
    verbId: string | null;
    dialect: Dialect;
    aspect: AspectForm;
    pronoun: string;
  };
  setCurrentSession: (session: Partial<AppStore['currentSession']>) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  selectedDialect: 'delta',
  typeToAnswer: false,
  showToneMarks: true,
  includeIrregulars: true,
  enabledAspects: ['imperfective', 'perfective'],
  dailyGoal: 20,
  isPremium: false,
};

// Default stats
const defaultStats: AppStats = {
  totalPracticed: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyProgress: [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ],
  aspectStrengths: {
    imperfective: 0,
    perfective: 0,
    progressive: 0,
    habitual: 0,
  },
};

// SRS algorithm
const calculateNextReview = (masteryLevel: number, isCorrect: boolean): Date => {
  const now = new Date();
  let daysToAdd = 0;
  
  if (isCorrect) {
    // Increase interval based on mastery level
    switch (masteryLevel) {
      case 0: daysToAdd = 1; break;
      case 1: daysToAdd = 3; break;
      case 2: daysToAdd = 7; break;
      case 3: daysToAdd = 14; break;
      case 4: daysToAdd = 30; break;
      case 5: daysToAdd = 90; break;
      default: daysToAdd = 1;
    }
  } else {
    // Reset to shorter interval if incorrect
    daysToAdd = masteryLevel > 0 ? 1 : 0.5;
  }
  
  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + daysToAdd);
  return nextReview;
};

// Create store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      // Progress
      progress: [],
      updateProgress: (verbId, dialect, aspect, isCorrect) => {
        set((state) => {
          const existingProgress = state.progress.find(
            p => p.verbId === verbId && p.dialect === dialect && p.aspect === aspect
          );
          
          if (existingProgress) {
            // Update existing progress
            const newMasteryLevel = isCorrect 
              ? Math.min(existingProgress.masteryLevel + 1, 5)
              : Math.max(existingProgress.masteryLevel - 1, 0);
            
            const newStreak = isCorrect ? existingProgress.streak + 1 : 0;
            
            const updatedProgress = {
              ...existingProgress,
              totalAttempts: existingProgress.totalAttempts + 1,
              correctAttempts: existingProgress.correctAttempts + (isCorrect ? 1 : 0),
              lastReviewed: new Date(),
              nextReview: calculateNextReview(newMasteryLevel, isCorrect),
              masteryLevel: newMasteryLevel,
              streak: newStreak,
            };
            
            return {
              progress: state.progress.map(p => 
                p.verbId === verbId && p.dialect === dialect && p.aspect === aspect
                  ? updatedProgress
                  : p
              ),
            };
          } else {
            // Create new progress entry
            const newProgress: UserProgress = {
              verbId,
              dialect,
              aspect,
              totalAttempts: 1,
              correctAttempts: isCorrect ? 1 : 0,
              lastReviewed: new Date(),
              nextReview: calculateNextReview(0, isCorrect),
              masteryLevel: isCorrect ? 1 : 0,
              streak: isCorrect ? 1 : 0,
            };
            
            return {
              progress: [...state.progress, newProgress],
            };
          }
        });
        
        // Update stats after progress update
        get().updateStats();
      },
      
      getVerbProgress: (verbId, dialect, aspect) => {
        return get().progress.find(
          p => p.verbId === verbId && p.dialect === dialect && p.aspect === aspect
        );
      },
      
      // Stats
      stats: defaultStats,
      updateStats: () => {
        set((state) => {
          const progress = state.progress;
          const totalPracticed = progress.reduce((sum, p) => sum + p.totalAttempts, 0);
          
          // Calculate current streak (consecutive days with practice)
          const today = new Date();
          let currentStreak = 0;
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const hasProgressOnDate = progress.some(p => {
              const reviewDate = new Date(p.lastReviewed);
              return reviewDate.toDateString() === checkDate.toDateString();
            });
            
            if (hasProgressOnDate) {
              currentStreak++;
            } else if (i > 0) {
              break;
            }
          }
          
          // Calculate aspect strengths
          const aspectStrengths: { [key in AspectForm]: number } = {
            imperfective: 0,
            perfective: 0,
            progressive: 0,
            habitual: 0,
          };
          
          progress.forEach(p => {
            if (p.totalAttempts > 0) {
              aspectStrengths[p.aspect] += p.correctAttempts / p.totalAttempts;
            }
          });
          
          // Normalize aspect strengths
          Object.keys(aspectStrengths).forEach(aspect => {
            const aspectProgress = progress.filter(p => p.aspect === aspect as AspectForm);
            if (aspectProgress.length > 0) {
              aspectStrengths[aspect as AspectForm] /= aspectProgress.length;
            }
          });
          
          return {
            stats: {
              ...state.stats,
              totalPracticed,
              currentStreak,
              longestStreak: Math.max(state.stats.longestStreak, currentStreak),
              aspectStrengths,
            },
          };
        });
      },
      
      // SRS
      getDueReviews: () => {
        const now = new Date();
        return get().progress.filter(p => new Date(p.nextReview) <= now);
      },
      
      getReviewsForToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        return get().progress.filter(p => {
          const reviewDate = new Date(p.lastReviewed);
          return reviewDate >= today && reviewDate < tomorrow;
        });
      },
      
      // Premium
      upgradeToPremium: () => {
        set((state) => ({
          settings: { ...state.settings, isPremium: true },
        }));
      },
      
      // Practice session
      currentSession: {
        verbId: null,
        dialect: 'delta',
        aspect: 'imperfective',
        pronoun: 'm',
      },
      setCurrentSession: (session) => {
        set((state) => ({
          currentSession: { ...state.currentSession, ...session },
        }));
      },
    }),
    {
      name: 'conjugate-igbo-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain parts of the store
      partialize: (state) => ({
        settings: state.settings,
        progress: state.progress,
        stats: state.stats,
      }),
    }
  )
);