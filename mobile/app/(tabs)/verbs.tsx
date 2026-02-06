import React, { useState, useMemo, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
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
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  Filter,
  Volume2,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Play,
} from 'lucide-react-native';
import { IgboVerb, Tense } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { useTheme } from '@/components/ThemeProvider';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import {
  pronounLabels,
  pronouns,
} from '@/models/interfaces';
import { WavePattern } from '@/components/SplashScreen';

type FilterType = 'all' | 'common' | 'regular' | 'irregular';
type SortType = 'alphabetical' | 'frequency' | 'difficulty';

export default function VerbsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
            } catch (error) {
              Sentry.captureException(error, {
                tags: { feature: 'verbs', screen: 'VerbsScreen' },
                extra: { context: 'Clearing openDetails flag' },
              });
            }
          }
        }
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: { feature: 'verbs', screen: 'VerbsScreen' },
          extra: { context: 'Loading verbs' },
        });
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
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}>
      <View style={styles.bgWaveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.05 : 0.1} />
      </View>
      <View style={styles.bgWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.05 : 0.1} />
      </View>

      <View style={[styles.orangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitleText}>Verbs</Text>
        </View>
        <Text style={styles.headerSubtitleText}>
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
          contentContainerStyle={{ paddingBottom: 100 }}
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
                      backgroundColor: isDark ? '#7c2d12' : '#fff7ed',
                      borderColor: '#F3703E',
                    },
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: theme.colors.text },
                      selectedFilter === filter.key && {
                        color: '#F3703E',
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
                      backgroundColor: isDark ? '#7c2d12' : '#fff7ed',
                      borderColor: '#F3703E',
                    },
                  ]}
                  onPress={() => setSortBy(sort.key as SortType)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: theme.colors.text },
                      sortBy === sort.key && {
                        color: '#F3703E',
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

      <Modal
        visible={selectedVerb !== null}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: '#FFFFFF' }]}
        >
          {selectedVerb && (
            <VerbDetailContent
              verb={selectedVerb}
              theme={theme}
              onClose={() => setSelectedVerb(null)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// Separate component for verb detail content
const tensesByTab = {
  Indicative: ['present', 'past', 'future', 'imperfect'] as Tense[],
  Subjunctive: ['subjunctive'] as Tense[],
  Others: ['imperative', 'conditional'] as Tense[],
};

const VerbDetailContent = ({
  verb,
  theme,
  onClose,
}: {
  verb: IgboVerb;
  theme: any;
  onClose: () => void;
}) => {
  const { settings } = useSettings();
  const { isProUser, isLoading } = usePurchases();
  const [activeTab, setActiveTab] = useState<
    'Indicative' | 'Subjunctive' | 'Others'
  >('Indicative');
  const [expandedTenses, setExpandedTenses] = useState<Record<string, boolean>>(
    {
      PRESENT: true,
    },
  );
  const [expandedConjugation, setExpandedConjugation] = useState<string | null>(
    null,
  );

  const availableTensesInTab = useMemo(() => {
    let list = tensesByTab[activeTab];
    if (!isLoading && !isProUser) {
      // Free users only see Present and Past in Indicative
      if (activeTab === 'Indicative') {
        list = list.filter((t) => t === 'present' || t === 'past');
      } else {
        list = [];
      }
    }
    return list;
  }, [activeTab, isProUser, isLoading]);

  const toggleTense = (tense: string) => {
    setExpandedTenses((prev) => ({ ...prev, [tense]: !prev[tense] }));
  };

  const toggleConjugation = (id: string) => {
    setExpandedConjugation((prev) => (prev === id ? null : id));
  };

  const getRuleData = (tense: Tense) => {
    // These are simplified rules for display purposes
    const stem = verb.igbo.split(' ')[0];
    const prefix = stem.substring(0, 1);

    switch (tense) {
      case 'present':
        return {
          text: 'The infinitive drops its prefix and adds a harmony prefix.',
          formula: [stem, stem, prefix],
        };
      case 'past':
        return {
          text: 'The infinitive drops its prefix to form the past stem.',
          formula: [stem, prefix, ''],
        };
      default:
        return {
          text: 'Follows the standard conjugation rule for this tense.',
          formula: [stem, '-', '+'],
        };
    }
  };

  const isVerbEnabled = true; // Placeholder for enabled state

  return (
    <View style={styles.verbDetailContainer}>
      {/* Custom Header for Modal */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={28} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderTitleContainer}>
          <Text style={styles.detailHeaderTitle}>{verb.igbo}</Text>
          <TouchableOpacity style={styles.detailAudioButton}>
            <Volume2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={{ width: 60 }} /> {/* Spacer to balance Back button */}
      </View>

      <ScrollView
        style={styles.detailScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Tab Bar */}
        <View style={styles.detailTabBar}>
          {(['Indicative', 'Subjunctive', 'Others'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.detailTabItem,
                activeTab === tab && styles.detailTabItemActive,
              ]}
            >
              <Text
                style={[
                  styles.detailTabText,
                  activeTab === tab && styles.detailTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* English Meaning Section */}
        <View style={styles.meaningSection}>
          <View style={styles.meaningRow}>
            <Text style={styles.flagEmoji}>🇬🇧</Text>
            <Text style={styles.englishMeaningLabel}>To {verb.english}</Text>
          </View>
          <View style={styles.enabledRow}>
            <Text style={styles.enabledLabel}>Enabled for practise</Text>
            <Switch
              value={isVerbEnabled}
              onValueChange={() => {}}
              trackColor={{ false: '#f3f4f6', true: '#F3703E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.toggleHint}>
            Toggle on or off to practise conjugation. swipe to move on to new
            verb.
          </Text>
        </View>

        {/* Tense Sections */}
        {availableTensesInTab.map((tense) => {
          const tenseUpper = tense.toUpperCase();
          const isExpanded = expandedTenses[tenseUpper];
          const ruleData = getRuleData(tense);

          return (
            <View key={tense} style={styles.tenseAccordion}>
              <TouchableOpacity
                style={styles.tenseHeader}
                onPress={() => toggleTense(tenseUpper)}
              >
                <Text style={styles.tenseHeaderText}>{tenseUpper}</Text>
                <ChevronDown
                  size={20}
                  color="#9ca3af"
                  style={{
                    transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }],
                  }}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.tenseContent}>
                  {pronouns.map((p) => {
                    const conjugated = getConjugatedForm(
                      verb,
                      tense,
                      p,
                      settings.dialect as any,
                    );
                    const rowId = `${tense}-${p}`;
                    const isRowExpanded = expandedConjugation === rowId;

                    return (
                      <View key={p} style={styles.conjugationRowContainer}>
                        <TouchableOpacity
                          style={styles.conjugationRowDesign}
                          onPress={() => toggleConjugation(rowId)}
                        >
                          <View style={styles.conjugationRowLeft}>
                            <ChevronRight
                              size={18}
                              color="#9ca3af"
                              style={{
                                transform: [
                                  { rotate: isRowExpanded ? '90deg' : '0deg' },
                                ],
                              }}
                            />
                            <Text style={styles.pronounLabelDesign}>
                              {pronounLabels[p]}
                            </Text>
                          </View>
                          <Text style={styles.conjugatedValueDesign}>
                            {String(conjugated)}
                          </Text>
                        </TouchableOpacity>

                        {isRowExpanded && (
                          <View style={styles.ruleSection}>
                            <View style={styles.ruleHeaderRow}>
                              <View style={styles.easyBadge}>
                                <Text style={styles.easyBadgeText}>Easy</Text>
                              </View>
                              <TouchableOpacity style={styles.rulePlayButton}>
                                <Play
                                  size={16}
                                  color="#F3703E"
                                  fill="#F3703E"
                                />
                              </TouchableOpacity>
                            </View>

                            <View style={styles.formulaRow}>
                              <View style={styles.formulaBox}>
                                <Text style={styles.formulaText}>
                                  {ruleData.formula[0]}
                                </Text>
                              </View>
                              <Text style={styles.formulaOperator}>-</Text>
                              <View
                                style={[
                                  styles.formulaBox,
                                  styles.formulaBoxOutline,
                                ]}
                              >
                                <Text style={styles.formulaText}>
                                  {ruleData.formula[1]}
                                </Text>
                              </View>
                              <Text style={styles.formulaOperator}>+</Text>
                              <View style={styles.formulaBox}>
                                <Text style={styles.formulaText}>
                                  {ruleData.formula[2]}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.ruleDescription}>
                              {ruleData.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {availableTensesInTab.length === 0 && !isLoading && !isProUser && (
          <TouchableOpacity
            style={styles.proUpgradeBanner}
            onPress={() => {
              onClose();
              router.push('/pro');
            }}
          >
            <Text style={styles.proUpgradeText}>
              Get Pro to unlock all tenses
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  bgWaveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: -1,
  },
  bgWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: -1,
  },
  orangeHeader: {
    backgroundColor: '#F3703E',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitleText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Manjari-Bold',
  },
  headerSubtitleText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontFamily: 'Manjari-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    marginTop: -20, // Pull up over the orange header overlap
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manjari-Regular',
  },
  filterButton: {
    borderRadius: 15,
    padding: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontFamily: 'Manjari-Regular',
  },
  clearFilters: {
    fontSize: 14,
    color: '#F3703E',
    fontWeight: '500',
    fontFamily: 'Manjari-Bold',
  },
  verbsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verbItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 12,
    padding: 16,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  verbItemContent: {
    flex: 1,
  },
  verbItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verbInfinitive: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Manjari-Bold',
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
    fontSize: 10,
    fontFamily: 'Manjari-Bold',
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
    color: '#666',
    fontFamily: 'Manjari-Regular',
    marginBottom: 8,
  },
  verbMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  verbType: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
    fontFamily: 'Manjari-Regular',
  },
  verbDifficulty: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
    fontFamily: 'Manjari-Regular',
  },
  // Modal & Detail Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  verbDetailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailHeader: {
    backgroundColor: '#F3703E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manjari-Regular',
    marginLeft: -4,
  },
  detailHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailHeaderTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: 'Manjari-Bold',
  },
  detailAudioButton: {
    padding: 4,
  },
  detailScroll: {
    flex: 1,
  },
  detailTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
  },
  detailTabItem: {
    paddingVertical: 15,
    marginRight: 25,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  detailTabItemActive: {
    borderBottomColor: '#F3703E',
  },
  detailTabText: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
  },
  detailTabTextActive: {
    color: '#F3703E',
    fontFamily: 'Manjari-Bold',
  },
  meaningSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  englishMeaningLabel: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Manjari-Regular',
  },
  enabledRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  enabledLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manjari-Regular',
  },
  toggleHint: {
    fontSize: 12,
    color: '#CCC',
    fontFamily: 'Manjari-Regular',
    lineHeight: 16,
  },
  tenseAccordion: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  tenseHeaderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Manjari-Bold',
    letterSpacing: 1,
  },
  tenseContent: {
    paddingBottom: 10,
  },
  conjugationRowContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F9F9F9',
  },
  conjugationRowDesign: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  conjugationRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pronounLabelDesign: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
  },
  conjugatedValueDesign: {
    fontSize: 16,
    color: '#22C55E', // Greenish color from the mockup for results
    fontFamily: 'Manjari-Bold',
  },
  ruleSection: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
  },
  ruleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  easyBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Manjari-Bold',
  },
  rulePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3703E',
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  formulaBox: {
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  formulaBoxOutline: {
    borderColor: '#9ca3af',
  },
  formulaText: {
    fontSize: 16,
    color: '#22C55E',
    fontFamily: 'Manjari-Regular',
  },
  formulaOperator: {
    fontSize: 20,
    color: '#9ca3af',
  },
  ruleDescription: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  proUpgradeBanner: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 15,
    alignItems: 'center',
  },
  proUpgradeText: {
    color: '#D97706',
    fontFamily: 'Manjari-Bold',
    fontSize: 16,
  },
  // Legacy styles to keep for now
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
    fontFamily: 'Manjari-Bold',
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
    fontFamily: 'Manjari-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Manjari-Regular',
  },
});
