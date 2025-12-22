import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Filter, Volume2, X } from 'lucide-react-native';
import { IgboVerb, Tense, Pronoun } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { useTheme } from '@/components/ThemeProvider';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import {
  pronounLabels,
  pronouns,
  tenses as tenseList,
} from '@/app/(tabs)/models/interfaces';

type FilterType = 'all' | 'common' | 'regular' | 'irregular';
type SortType = 'alphabetical' | 'frequency' | 'difficulty';

export default function VerbsScreen() {
  const { theme, isDark } = useTheme();
  const { verbId, openDetails } = useLocalSearchParams<{
    verbId?: string;
    openDetails?: string;
  }>();
  const [verbs, setVerbs] = useState<IgboVerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('alphabetical');
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load verbs on component mount
  useEffect(() => {
    const loadVerbs = async () => {
      try {
        setIsLoading(true);
        const allVerbs = await verbService.getAllVerbs();
        setVerbs(allVerbs);

        // Only auto-open details if explicitly requested via openDetails flag
        if (verbId && openDetails) {
          const targetVerb = allVerbs.find((verb) => verb.id === verbId);
          if (targetVerb) {
            setSelectedVerb(targetVerb);
            // Clear the flag so subsequent visits to Verbs don't auto-open
            try {
              router.setParams({ openDetails: undefined });
            } catch {}
          }
        }
      } catch {
        // console.error('Error loading verbs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVerbs();
  }, [verbId, openDetails]);

  // Ensure that when navigating here from Practice with a verbId,
  // closing the modal and pressing the details icon again reopens the modal.
  // This runs every time the Verbs tab regains focus.
  useFocusEffect(
    React.useCallback(() => {
      // Only reopen automatically if explicitly requested via openDetails flag
      if (verbId && openDetails && !selectedVerb) {
        const targetVerb = verbs.find((v) => v.id === verbId);
        if (targetVerb) {
          setSelectedVerb(targetVerb);
          // Clear the flag once handled so Verbs tab doesn't auto-open on future visits
          try {
            router.setParams({ openDetails: undefined });
          } catch {}
        }
      }
      return () => {};
    }, [verbId, openDetails, verbs, selectedVerb]),
  );

  const filteredAndSortedVerbs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let filtered = verbs.filter((verb) => {
      const matchesSearch =
        (verb.igbo ?? '').toLowerCase().includes(q) ||
        (verb.english ?? '').toLowerCase().includes(q);

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'common' &&
          (verb.freqRank != null
            ? verb.freqRank <= 100
            : verb.frequency === 'high')) ||
        (selectedFilter === 'regular' && verb.type === 'regular') ||
        (selectedFilter === 'irregular' && verb.type === 'irregular');

      return matchesSearch && matchesFilter;
    });

    const frequencyOrder = { high: 3, medium: 2, low: 1 } as const;
    const getFreqScore = (v: IgboVerb) => {
      if (v && typeof v.freqRank === 'number') {
        // Lower rank = higher frequency; map to higher score
        if (v.freqRank <= 100) return 3;
        if (v.freqRank <= 300) return 2;
        return 1;
      }
      // Fallback to legacy label if provided
      // @ts-ignore legacy optional
      return (
        frequencyOrder[(v as any).frequency as keyof typeof frequencyOrder] ?? 1
      );
    };

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.igbo ?? '').localeCompare(b.igbo ?? '');
        case 'frequency':
          return getFreqScore(b) - getFreqScore(a);
        case 'difficulty':
          const difficultyOrder = {
            beginner: 1,
            intermediate: 2,
            advanced: 3,
          } as const;
          return (
            (difficultyOrder[a.difficulty ?? 'beginner'] ?? 1) -
            (difficultyOrder[b.difficulty ?? 'beginner'] ?? 1)
          );
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedFilter, sortBy, verbs]);

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
          <View style={styles.verbBadges}>
            <View style={[styles.badge, getBadgeStyle(item)]}>
              <Text style={[styles.badgeText, getBadgeTextStyle(item)]}>
                {rankToLabel(item.freqRank, (item as any).frequency)}
              </Text>
            </View>
            <TouchableOpacity style={styles.audioButton}>
              <Volume2 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[styles.verbMeaning, { color: theme.colors.textSecondary }]}
        >
          &ldquo;{item.english}&rdquo;
        </Text>
        <View style={styles.verbMeta}>
          <Text
            style={[styles.verbType, { color: theme.colors.textSecondary }]}
          >
            {item.type}
          </Text>
          <Text
            style={[
              styles.verbDifficulty,
              { color: theme.colors.textSecondary },
            ]}
          >
            {item.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const rankToLabel = (
    rank?: number | null,
    legacy?: string,
  ): 'high' | 'medium' | 'low' => {
    if (typeof rank === 'number') {
      if (rank <= 100) return 'high';
      if (rank <= 300) return 'medium';
      return 'low';
    }
    if (legacy === 'high' || legacy === 'medium' || legacy === 'low')
      return legacy;
    return 'low';
  };

  const getBadgeStyle = (verb: IgboVerb) => {
    const label = rankToLabel(verb.freqRank, (verb as any).frequency);
    switch (label) {
      case 'high':
        return styles.badgeHigh;
      case 'medium':
        return styles.badgeMedium;
      case 'low':
        return styles.badgeLow;
      default:
        return styles.badgeMedium;
    }
  };

  const getBadgeTextStyle = (verb: IgboVerb) => {
    const label = rankToLabel(verb.freqRank, (verb as any).frequency);
    switch (label) {
      case 'high':
        return styles.badgeTextHigh;
      case 'medium':
        return styles.badgeTextMedium;
      case 'low':
        return styles.badgeTextLow;
      default:
        return styles.badgeTextMedium;
    }
  };

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
          Verbs
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          {filteredAndSortedVerbs.length} verbs
        </Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search verbs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Summary */}
      {(selectedFilter !== 'all' || sortBy !== 'alphabetical') && (
        <View style={styles.filterSummary}>
          <Text
            style={[
              styles.filterSummaryText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {selectedFilter !== 'all' && `Filter: ${selectedFilter} • `}
            Sort: {sortBy}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter('all');
              setSortBy('alphabetical');
            }}
          >
            <Text
              style={[styles.clearFilters, { color: theme.colors.primary }]}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Verbs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading verbs...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedVerbs}
          renderItem={renderVerbItem}
          keyExtractor={(item) => item.id}
          style={styles.verbsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
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
              Filters & Sorting
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Filter Options */}
            <View style={styles.filterSection}>
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Filter by
              </Text>
              {[
                { key: 'all', label: 'All Verbs' },
                { key: 'common', label: 'Common Verbs' },
                { key: 'regular', label: 'Regular Verbs' },
                { key: 'irregular', label: 'Irregular Verbs' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: theme.colors.surface },
                    selectedFilter === filter.key && {
                      ...styles.filterOptionActive,
                      backgroundColor: isDark ? '#1e40af' : '#eff6ff',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: theme.colors.text },
                      selectedFilter === filter.key && {
                        color: theme.colors.primary,
                        fontWeight: '500',
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Sort by
              </Text>
              {[
                { key: 'alphabetical', label: 'Alphabetical' },
                { key: 'frequency', label: 'Frequency' },
                { key: 'difficulty', label: 'Difficulty' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: theme.colors.surface },
                    sortBy === sort.key && {
                      ...styles.filterOptionActive,
                      backgroundColor: isDark ? '#1e40af' : '#eff6ff',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setSortBy(sort.key as SortType)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: theme.colors.text },
                      sortBy === sort.key && {
                        color: theme.colors.primary,
                        fontWeight: '500',
                      },
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
            <TouchableOpacity
              onPress={() => {
                setSelectedVerb(null);
                if (verbId) {
                  // If we came from practice page, navigate back
                  router.back();
                }
              }}
            >
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

// Separate component for verb detail content
const VerbDetailContent = ({ verb, theme }: { verb: IgboVerb; theme: any }) => {
  const { settings } = useSettings();
  const { isProUser } = usePurchases();

  // Compute available tenses similar to Practice screen
  const availableTenses: Tense[] = useMemo(() => {
    // On the Verbs page, Settings (enabled tenses) should NOT affect which tenses appear.
    // Only Pro status controls visibility: free users see Present and Past; Pro users see all tenses.
    if (!isProUser) {
      return ['present', 'past'];
    }
    return [...(tenseList as Tense[])];
  }, [isProUser]);

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

      {/* Render each available tense with pronouns and conjugations */}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clearFilters: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  verbsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  verbBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHigh: {
    backgroundColor: '#dcfce7',
  },
  badgeMedium: {
    backgroundColor: '#fef3c7',
  },
  badgeLow: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextHigh: {
    color: '#16a34a',
  },
  badgeTextMedium: {
    color: '#d97706',
  },
  badgeTextLow: {
    color: '#dc2626',
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
    marginBottom: 8,
  },
  verbMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  verbType: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  verbDifficulty: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
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
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 16,
  },
  filterOptionTextActive: {
    fontWeight: '500',
  },
  verbDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  verbDetailInfinitive: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  audioButtonLarge: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  verbDetailMeaning: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  verbDetailMeta: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metaLabel: {
    fontSize: 16,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  conjugationSection: {
    marginBottom: 24,
  },
  conjugationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tenseSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  conjugationTable: {
    gap: 8,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pronounText: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
  },
  conjugationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exampleItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleIgbo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  // New verb detail styles
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  tabButtonTextActive: {
    color: '#f59e0b',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#f59e0b',
  },
  tabContent: {
    flex: 1,
  },
  practiceToggle: {
    marginBottom: 24,
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  verbMeaningLarge: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    transform: [{ translateX: 0 }],
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 32,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
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
  pronounLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  conjugationValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
});
