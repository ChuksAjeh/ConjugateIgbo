/**
 * @fileoverview Hook for managing the user's saved (bookmarked) verbs.
 *
 * Verb IDs are stored as a JSON-serialised string array in AsyncStorage under
 * the key `favorites_verbs`. The hook loads the list on mount and provides
 * helpers for querying and toggling individual entries.
 *
 * ## Usage
 * ```ts
 * const { favorites, isFavorite, toggleFavorite, refresh } = useFavorites();
 *
 * // Check if a verb is bookmarked:
 * if (isFavorite(verb.id)) { ... }
 *
 * // Toggle the bookmark and persist:
 * await toggleFavorite(verb.id);
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

/** AsyncStorage key used to persist the favorites list. */
const FAVORITES_KEY = 'favorites_verbs';

/**
 * Manages the list of bookmarked verb IDs.
 *
 * The list is loaded from AsyncStorage on mount. The `isLoading` flag is only
 * `true` during the initial fetch to avoid flickering on subsequent refreshes
 * (e.g. when the Favorites screen re-focuses).
 *
 * @returns An object with:
 *   - `favorites`      — array of bookmarked verb ID strings.
 *   - `isFavorite`     — predicate returning `true` if a verb is bookmarked.
 *   - `toggleFavorite` — adds or removes a verb from the list and persists.
 *   - `isLoading`      — `true` only during the initial load.
 *   - `refresh`        — manually reload favorites from storage.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitiallyLoadedRef = useRef(false);

  /**
   * Loads the favorites list from AsyncStorage.
   *
   * @param isInitial - Pass `true` on the first call to show the loading
   *   indicator. Subsequent calls (e.g. on screen focus) skip the indicator
   *   to prevent flickering.
   */
  const loadFavorites = useCallback(async (isInitial = false) => {
    try {
      if (isInitial && !hasInitiallyLoadedRef.current) {
        setIsLoading(true);
      }
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { feature: 'favorites' } });
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

  /**
   * Returns `true` if the given verb ID is currently bookmarked.
   *
   * @param verbId - The verb's unique string ID.
   */
  const isFavorite = useCallback(
    (verbId: string) => favorites.includes(verbId),
    [favorites],
  );

  /**
   * Toggles the bookmark state for a verb and persists the updated list.
   * Adds the verb if it is not already saved; removes it otherwise.
   *
   * @param verbId - The verb's unique string ID.
   */
  const toggleFavorite = async (verbId: string) => {
    try {
      const newFavorites = favorites.includes(verbId)
        ? favorites.filter((id) => id !== verbId)
        : [...favorites, verbId];
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      Sentry.captureException(error, { tags: { feature: 'favorites' } });
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    /** Re-fetches favorites from storage (e.g. call on screen focus). */
    refresh: loadFavorites,
  };
}
