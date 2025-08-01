import { useState, useEffect } from 'react';

export interface VerbProgress {
  verbId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticed: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  color: string;
}

export interface ProgressStatistics {
  totalPracticed: number;
  accuracyRate: number;
  currentStreak: number;
  totalStudyTime: number; // in seconds
  tenseProgress: {
    present: number;
    past: number;
    future: number;
    subjunctive: number;
  };
  recentAchievements: Achievement[];
  weeklyProgress: {
    day: string;
    practiced: number;
  }[];
  dailyGoalProgress: number;
}

const PROGRESS_STORAGE_KEY = 'igbo_verb_progress';
const STATISTICS_STORAGE_KEY = 'igbo_verb_statistics';

const mockAchievements: Achievement[] = [
  {
    title: 'First Steps',
    description: 'Completed your first verb practice',
    date: '2 days ago',
    color: '#3b82f6',
  },
  {
    title: 'Streak Master',
    description: 'Practiced for 5 days in a row',
    date: '1 day ago',
    color: '#10b981',
  },
  {
    title: 'Present Perfect',
    description: 'Mastered present tense conjugations',
    date: 'Today',
    color: '#f59e0b',
  },
];

const mockWeeklyProgress = [
  { day: 'Mon', practiced: 8 },
  { day: 'Tue', practiced: 12 },
  { day: 'Wed', practiced: 5 },
  { day: 'Thu', practiced: 15 },
  { day: 'Fri', practiced: 10 },
  { day: 'Sat', practiced: 7 },
  { day: 'Sun', practiced: 9 },
];

export const useProgress = () => {
  const [progress, setProgress] = useState<VerbProgress[]>([]);
  const [statistics, setStatistics] = useState<ProgressStatistics>({
    totalPracticed: 45,
    accuracyRate: 0.82,
    currentStreak: 7,
    totalStudyTime: 3240, // 54 minutes
    tenseProgress: {
      present: 0.85,
      past: 0.67,
      future: 0.43,
      subjunctive: 0.21,
    },
    recentAchievements: mockAchievements,
    weeklyProgress: mockWeeklyProgress,
    dailyGoalProgress: 6,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      const savedStatistics = await AsyncStorage.getItem(STATISTICS_STORAGE_KEY);
      
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      
      if (savedStatistics) {
        setStatistics(JSON.parse(savedStatistics));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
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
      const totalAttempts = updatedProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
      const totalCorrect = updatedProgress.reduce((sum, p) => sum + p.correctAttempts, 0);
      const newAccuracyRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
      
      const updatedStatistics: ProgressStatistics = {
        ...statistics,
        totalPracticed: updatedProgress.length,
        accuracyRate: newAccuracyRate,
        dailyGoalProgress: Math.min(statistics.dailyGoalProgress + 1, 10),
      };
      
      setStatistics(updatedStatistics);
      await AsyncStorage.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(updatedStatistics));
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getVerbProgress = (verbId: string): VerbProgress | undefined => {
    return progress.find(p => p.verbId === verbId);
  };

  const resetProgress = async () => {
    try {
      setProgress([]);
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