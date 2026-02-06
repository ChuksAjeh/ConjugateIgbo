import React, { useState, useMemo, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Volume2, X, Bookmark } from 'lucide-react-native';
import { IgboVerb, Tense, Pronoun } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { useTheme } from '@/components/ThemeProvider';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import { useFavorites } from '@/hooks/useFavorites';
import {
  pronounLabels,
  pronouns,
  tenses as tenseList,
} from '@/models/interfaces';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const {
    favorites,
    isLoading: favoritesLoading,
    refresh: refreshFavorites,
  } = useFavorites();
  const [verbs, setVerbs] = useState<IgboVerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      refreshFavorites();
    }, []),
  );

  useEffect(() => {
    const loadVerbs = async () => {
      try {
        setIsLoading(true);
        const allVerbs = await verbService.getAllVerbs();
        // Filter verbs that are in favorites
        const favoriteVerbs = allVerbs.filter((v) => favorites.includes(v.id));
        setVerbs(favoriteVerbs);
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: { feature: 'favorites', screen: 'FavoritesScreen' },
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!favoritesLoading) {
      loadVerbs();
    }
  }, [favorites, favoritesLoading]);

  const renderVerbItem = ({ item }: { item: IgboVerb }) => (
    <TouchableOpacity
      style={[styles.verbItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => setSelectedVerb(item)}
    >
      <View style={styles.verbItemContent}>
        <View style={styles.verbItemHeader}>
          <Text style={[styles.verbInfinitive, { color: theme.colors.text }]}>
            {item.igbo}
          </Text>
          <TouchableOpacity style={styles.audioButton}>
            <Volume2 size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.verbMeaning, { color: theme.colors.textSecondary }]}
        >
          &ldquo;{item.english}&rdquo;
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Favourites
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          {verbs.length} saved verbs
        </Text>
      </View>

      {isLoading || favoritesLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading favorites...
          </Text>
        </View>
      ) : verbs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bookmark size={48} color="#9ca3af" />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No favorites yet. Save some verbs while practicing!
          </Text>
        </View>
      ) : (
        <FlatList
          data={verbs}
          renderItem={renderVerbItem}
          keyExtractor={(item) => item.id}
          style={styles.verbsList}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Verb Detail Modal */}
      <Modal
        visible={selectedVerb !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: theme.colors.surface,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Verb Details
            </Text>
            <TouchableOpacity onPress={() => setSelectedVerb(null)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {selectedVerb && (
            <ScrollView style={styles.modalContent}>
              <VerbDetailContent verb={selectedVerb} theme={theme} />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Reusing VerbDetailContent from verbs.tsx logic
const VerbDetailContent = ({ verb, theme }: { verb: IgboVerb; theme: any }) => {
  const { settings } = useSettings();
  const { isProUser, isLoading } = usePurchases();

  const availableTenses: Tense[] = useMemo(() => {
    if (!isLoading && !isProUser) {
      return ['present', 'past'];
    }
    return [...(tenseList as Tense[])];
  }, [isProUser, isLoading]);

  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <View style={styles.verbDetailContainer}>
      <Text style={[styles.verbTitle, { color: theme.colors.text }]}>
        {verb.igbo}
      </Text>
      {verb.english ? (
        <Text
          style={[
            styles.verbMeaning,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginBottom: 16,
            },
          ]}
        >
          “{verb.english}”
        </Text>
      ) : null}

      {availableTenses.map((tense) => (
        <View key={tense} style={styles.tenseGroup}>
          <Text style={[styles.tenseGroupTitle, { color: theme.colors.text }]}>
            {titleCase(tense)}
          </Text>
          {pronouns.map((p: Pronoun) => {
            const value = getConjugatedForm(
              verb,
              tense,
              p,
              settings.dialect as any,
            );
            return (
              <View key={`${tense}-${p}`} style={styles.conjugationRow}>
                <Text
                  style={[
                    styles.pronounLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {pronounLabels[p]}
                </Text>
                <Text style={[styles.conjugationValue, { color: '#ef4444' }]}>
                  {String(value)}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  verbsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  verbItem: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verbItemContent: {
    padding: 16,
  },
  verbItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verbInfinitive: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  audioButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  verbMeaning: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  verbDetailContainer: {
    flex: 1,
  },
  verbTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  tenseGroup: {
    marginBottom: 32,
  },
  tenseGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pronounLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  conjugationValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
});
