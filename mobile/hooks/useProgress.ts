import { useState, useEffect } from 'react';
import { ProgressStatistics } from '@/hooks/models/hooksInterfaces';
import { getItem, setItem } from '@/lib/storage';

const STATISTICS_STORAGE_KEY = 'igbo_verb_statistics';

/**
 * Returns the default statistics object for a new user or new day.
 * 
 * @returns {ProgressStatistics} The default statistics.
 */
const getDefaultStatistics = (): ProgressStatistics => ({
  dailyGoalProgress: 0,
  lastVisitDate: new Date().toDateString(),
});

/**
 * Hook to manage user progress and daily goals.
 * Focuses on tracking the number of verbs practiced today and ensuring persistence.
 *
 * @returns {Object} An object containing statistics, loading state, and update function.
 * @returns {ProgressStatistics} returns.statistics - The current progress statistics.
 * @returns {boolean} returns.isLoading - Whether the progress data is currently loading.
 * @returns {Function} returns.updateProgress - Function to increment the daily goal counter.
 */
export const useProgress = () => {
  const [statistics, setStatistics] = useState<ProgressStatistics>(
    getDefaultStatistics(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  /**
   * Loads statistics from storage and handles daily reset.
   * If the last visit was on a different day, the daily goal progress is reset to 0.
   * 
   * @returns {Promise<void>}
   */
  const loadProgress = async () => {
    try {
      const savedStatistics = await getItem(STATISTICS_STORAGE_KEY);
      const today = new Date().toDateString();

      if (savedStatistics) {
        const stats = JSON.parse(savedStatistics) as ProgressStatistics;
        
        if (stats.lastVisitDate !== today) {
          // New day, reset daily progress
          const resetStats: ProgressStatistics = {
            dailyGoalProgress: 0,
            lastVisitDate: today,
          };
          setStatistics(resetStats);
          await setItem(STATISTICS_STORAGE_KEY, JSON.stringify(resetStats));
        } else {
          setStatistics(stats);
        }
      } else {
        // No saved statistics, initialize with defaults
        const initialStats = getDefaultStatistics();
        setStatistics(initialStats);
        await setItem(STATISTICS_STORAGE_KEY, JSON.stringify(initialStats));
      }
    } catch {
      // Fail gracefully and use default state
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Increments the daily goal progress counter and persists the change.
   * 
   * @returns {Promise<void>}
   */
  const updateProgress = async () => {
    try {
      const updatedStatistics: ProgressStatistics = {
        dailyGoalProgress: statistics.dailyGoalProgress + 1,
        lastVisitDate: new Date().toDateString(),
      };

      setStatistics(updatedStatistics);
      await setItem(
        STATISTICS_STORAGE_KEY,
        JSON.stringify(updatedStatistics),
      );
    } catch {
      // Fail gracefully
    }
  };

  return {
    statistics,
    updateProgress,
    isLoading,
  };
};
