import { useState, useEffect } from 'react';

export interface VerbProgress {
  verbId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticed: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}


export interface ProgressStatistics {
  totalPracticed: number;
  currentStreak: number;
  totalStudyTime: number; // in hours
  tenseProgress: {
    present: number;
    past: number;
    future: number;
    subjunctive: number;
  };
  weeklyProgress: {
    day: string;
    practiced: number;
  }[];
  dailyGoalProgress: number;
  lastVisitDate: string;
}

const PROGRESS_STORAGE_KEY = 'igbo_verb_progress';
const STATISTICS_STORAGE_KEY = 'igbo_verb_statistics';


const mockWeeklyProgress = [
  { day: 'Mon', practiced: 8 },
  { day: 'Tue', practiced: 12 },
  { day: 'Wed', practiced: 5 },
  { day: 'Thu', practiced: 15 },
  { day: 'Fri', practiced: 10 },
  { day: 'Sat', practiced: 7 },
  { day: 'Sun', practiced: 9 },
];

const getDefaultStatistics = (): ProgressStatistics => ({
  totalPracticed: 0,
  currentStreak: 0,
  totalStudyTime: 0,
  tenseProgress: {
    present: 0,
    past: 0,
    future: 0,
    subjunctive: 0,
  },
  weeklyProgress: mockWeeklyProgress,
  dailyGoalProgress: 0,
  lastVisitDate: new Date().toDateString(),
});
export const useProgress = () => {
  const [progress, setProgress] = useState<VerbProgress[]>([]);
  const [statistics, setStatistics] = useState<ProgressStatistics>(getDefaultStatistics());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    updateStreak();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      const savedStatistics = await AsyncStorage.getItem(STATISTICS_STORAGE_KEY);
      
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      
      if (savedStatistics) {
        setStatistics({ ...getDefaultStatistics(), ...JSON.parse(savedStatistics) });
      } else {
        setStatistics(getDefaultStatistics());
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const today = new Date().toDateString();
      const savedStatistics = await AsyncStorage.getItem(STATISTICS_STORAGE_KEY);
      
      if (savedStatistics) {
        const stats = JSON.parse(savedStatistics);
        const lastVisit = stats.lastVisitDate;
        
        if (lastVisit !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = stats.currentStreak || 0;
          
          if (lastVisit === yesterday.toDateString()) {
            // Consecutive day
            newStreak += 1;
          } else if (lastVisit !== today) {
            // Streak broken
            newStreak = 1;
          }
          
          const updatedStats = {
            ...stats,
            currentStreak: newStreak,
            lastVisitDate: today,
          };
          
          setStatistics(updatedStats);
          await AsyncStorage.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(updatedStats));
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };
  const updateProgress = async (verbId: string, isCorrect: boolean) => {
    try {
      const existingProgress = progress.find(p => p.verbId === verbId);
      
      let updatedProgress: VerbProgress[];
      
      if (existingProgress) {
        updatedProgress = progress.map(p => 
          p.verbId === verbId 
            ? {
                ...p,
                totalAttempts: p.totalAttempts + 1,
                correctAttempts: p.correctAttempts + (isCorrect ? 1 : 0),
                lastPracticed: new Date().toISOString(),
              }
            : p
        );
      } else {
        const newProgress: VerbProgress = {
          verbId,
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          lastPracticed: new Date().toISOString(),
          difficulty: 'beginner',
        };
        updatedProgress = [...progress, newProgress];
      }
      
      setProgress(updatedProgress);
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedProgress));
      
      // Update statistics
      const totalPracticed = updatedProgress.length;
      
      const updatedStatistics: ProgressStatistics = {
        ...statistics,
        totalPracticed,
        totalStudyTime: statistics.totalStudyTime + 0.02, // Add ~1 minute per verb
        dailyGoalProgress: Math.min(statistics.dailyGoalProgress + 1, 10),
      };
      
      setStatistics(updatedStatistics);
      await AsyncStorage.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(updatedStatistics));
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const resetDailyProgress = async () => {
    try {
      const updatedStatistics = {
        ...statistics,
        dailyGoalProgress: 0,
      };
      
      setStatistics(updatedStatistics);
      await AsyncStorage.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(updatedStatistics));
    } catch (error) {
      console.error('Error resetting daily progress:', error);
    }
  };
  const getVerbProgress = (verbId: string): VerbProgress | undefined => {
    return progress.find(p => p.verbId === verbId);
  };

  const resetProgress = async () => {
    try {
      setProgress([]);
      setStatistics(getDefaultStatistics());
      await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
      await AsyncStorage.removeItem(STATISTICS_STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  return {
    progress,
    statistics,
    updateProgress,
    resetDailyProgress,
    getVerbProgress,
    resetProgress,
    isLoading,
  };
};

// Mock AsyncStorage for web compatibility
const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
};