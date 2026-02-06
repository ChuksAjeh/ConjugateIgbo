import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const FAVORITES_KEY = 'favorites_verbs';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitiallyLoadedRef = useRef(false);

  const loadFavorites = useCallback(async (isInitial = false) => {
    try {
      // Only show loading state on initial load to prevent flickering
      if (isInitial && !hasInitiallyLoadedRef.current) {
        setIsLoading(true);
      }
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'favorites' },
      });
    } finally {
      if (isInitial && !hasInitiallyLoadedRef.current) {
        setIsLoading(false);
        hasInitiallyLoadedRef.current = true;
      }
    }
  }, []);

  useEffect(() => {
    loadFavorites(true);
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (verbId: string) => {
      return favorites.includes(verbId);
    },
    [favorites],
  );

  const toggleFavorite = async (verbId: string) => {
    try {
      let newFavorites: string[];
      if (favorites.includes(verbId)) {
        newFavorites = favorites.filter((id) => id !== verbId);
      } else {
        newFavorites = [...favorites, verbId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'favorites' },
      });
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    refresh: loadFavorites,
  };
}
