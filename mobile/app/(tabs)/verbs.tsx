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
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { IgboVerb, Tense } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { useResponsiveLayout } from '@/lib/responsive';
import { useTheme } from '@/components/ThemeProvider';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import {
  pronounLabels,
  pronouns,
  tenseLabels,
  tenseAnnotations,
} from '@/models/interfaces';
import { WavePattern } from '@/components/SplashScreen';

export default function VerbsScreen() {
  const { settings } = useSettings();
  const { theme, isDark } = useTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const { verbId, openDetails } = useLocalSearchParams<{
    verbId?: string;
    openDetails?: string;
  }>();
  const [verbs, setVerbs] = useState<IgboVerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchQuery(searchQuery), 200);
    return () => clearTimeout(handle);
  }, [searchQuery]);
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);
  const numColumns = layout.isLargeScreen ? 3 : layout.isTablet ? 2 : 1;
  const listGap = layout.isTablet ? 24 : 0;
  const gridWidth = Math.max(
    Math.min(layout.listMaxWidth, layout.windowWidth - layout.screenPadding * 2),
    0,
  );
  const cardWidth = Math.max(
    numColumns === 1
      ? gridWidth
      : (gridWidth - listGap * (numColumns - 1)) / numColumns,
    0,
  );

  // Load verbs on component mount
  useEffect(() => {
    const loadVerbs = async () => {
      try {
        setIsLoading(true);
        const { verbs: dialectVerbs } = await verbService.getAllVerbsForDialect(
          settings.dialect as any,
          settings.verbLimit
        );
        setVerbs(dialectVerbs);

        // Only auto-open details if explicitly requested via openDetails flag
        if (verbId && openDetails) {
          const targetVerb = dialectVerbs.find((verb) => verb.id === verbId);
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
  }, [verbId, openDetails, settings.dialect, settings.verbLimit]);

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
          } catch (error) {
            Sentry.captureException(error, {
              tags: { feature: 'verbs', screen: 'VerbsScreen' },
              extra: { context: 'Clearing openDetails flag on focus' },
            });
          }
        }
      }
      return () => {};
    }, [verbId, openDetails, verbs, selectedVerb]),
  );

  const sortedVerbs = useMemo(() => {
    return [...verbs].sort((a, b) =>
      (a.igbo ?? '').localeCompare(b.igbo ?? ''),
    );
  }, [verbs]);

  const filteredAndSortedVerbs = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    if (!q) return sortedVerbs;
    return sortedVerbs.filter(
      (verb) =>
        (verb.igbo ?? '').toLowerCase().includes(q) ||
        (verb.english ?? '').toLowerCase().includes(q),
    );
  }, [debouncedSearchQuery, sortedVerbs]);

  const renderVerbItem = ({ item }: { item: IgboVerb }) => (
    <TouchableOpacity
      style={[
        styles.verbItem,
        {
          backgroundColor: theme.colors.surface,
          width: cardWidth,
          marginBottom: numColumns > 1 ? 0 : 12,
        },
      ]}
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
        <WavePattern side="left" opacity={isDark ? 0.15 : 0.2} />
      </View>
      <View style={styles.bgWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.15 : 0.2} />
      </View>

      <View style={[styles.orangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={[styles.headerInner, { maxWidth: layout.listMaxWidth }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitleText}>Verbs</Text>
          </View>
          <Text style={styles.headerSubtitleText}>
            {filteredAndSortedVerbs.length} verbs
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: layout.screenPadding }]}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: theme.colors.surface,
              maxWidth: layout.listMaxWidth,
            },
          ]}
        >
          <Search size={20} color={isDark ? theme.colors.textSecondary : '#6b7280'} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search verbs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* Verbs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading verbs...
          </Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filteredAndSortedVerbs}
          renderItem={renderVerbItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          style={styles.verbsList}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: 100,
              paddingHorizontal: layout.screenPadding,
            },
          ]}
          columnWrapperStyle={
            numColumns > 1 ? { gap: listGap, marginBottom: listGap } : undefined
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={selectedVerb !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}
        >
          {selectedVerb && (
            <VerbDetailContent
              verb={selectedVerb}
              theme={theme}
              isDark={isDark}
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
  Indicative: ['present', 'past', 'future', 'presentPerfect', 'habitualPresent'] as Tense[],
  Negation: ['negativePast', 'negativeFuture', 'negativeImperative', 'negativePerfect', 'neverPerfect'] as Tense[],
  Others: ['imperative'] as Tense[],
  Extras: ['finished', 'together', 'first', 'polite'] as Tense[],
};

const VerbDetailContent = ({
  verb,
  theme,
  isDark,
  onClose,
}: {
  verb: IgboVerb;
  theme: any;
  isDark: boolean;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { isProUser, isLoading } = usePurchases();
  const [activeTab, setActiveTab] = useState<
    'Indicative' | 'Negation' | 'Others' | 'Extras'
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
      // Free tier: Present, Past, Future only (all live under Indicative).
      // Every other tab — negation, perfects, derivational helpers — is Pro.
      if (activeTab === 'Indicative') {
        list = list.filter(
          (t) => t === 'present' || t === 'past' || t === 'future',
        );
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

  const getRuleData = (tense: Tense): { source: string; parts: string[]; text: string } => {
    // Mirrors lib/conjugateVerbs.ts. Keep surface particles aligned with the
    // active dialect profile so the worked example matches the output cell.
    const igbo = typeof verb.igbo === 'string' ? verb.igbo : '';
    const stem =
      igbo.startsWith('i') || igbo.startsWith('ị') ? igbo.substring(1) : igbo;
    const isHeavy = /[aọụịỌỤỊ]/.test(stem);
    const vowelPrefix = isHeavy ? 'a' : 'e';
    // Negative past (Notion Rule 5) uses the accented '-ná/né' suffix,
    // while the negative imperative (Imperatives page, Rule 2) uses the
    // unaccented '-na/ne'. The engine currently outputs unaccented for
    // both — flagged as a known divergence from the Notion grammar.
    const negPastSuffix = isHeavy ? 'ná' : 'né';
    const negImpSuffix = isHeavy ? 'na' : 'ne';
    const source = igbo;

    const imperativeExceptions = new Set(['bia', 'je', 'nodu']);
    const lastChar = stem.length ? stem[stem.length - 1] : '';
    const imperativeForm = imperativeExceptions.has(stem)
      ? stem
      : stem + ('aịọụ'.includes(lastChar) ? 'a' : 'e');

    switch (tense) {
      case 'present':
        return {
          source,
          parts: ['na', `${vowelPrefix}${stem}`],
          text: `Remove the 'i' prefix and add the vowel-harmony prefix '${vowelPrefix}'. Pronoun + na + ${vowelPrefix}${stem}.`,
        };
      case 'past':
        return {
          source,
          parts: [stem],
          text: `Remove the 'i' prefix to form the past stem. Pronoun + ${stem}.`,
        };
      case 'future':
        return {
          source,
          parts: ['ga', `${vowelPrefix}${stem}`],
          text: `Same stem as present, with the 'ga' auxiliary. Pronoun + ga + ${vowelPrefix}${stem}.`,
        };
      case 'imperative':
        return {
          source,
          parts: [imperativeForm],
          text: imperativeExceptions.has(stem)
            ? `${stem} is an imperative exception — the bare stem is used.`
            : `Append '${isHeavy ? 'a' : 'e'}' to the stem by vowel harmony.`,
        };
      case 'presentPerfect':
        return {
          source,
          parts: [`${vowelPrefix}${stem}`, 'ga'],
          text: `Plural subjects: vowel-harmony prefix + stem + '-ga'. Singular pronouns (m/i/o) drop the suffix.`,
        };
      case 'habitualPresent':
        return {
          source,
          parts: ['na', `${vowelPrefix}${stem}`, 'kari'],
          text: `Present frame with the habitual suffix '-kari'. Pronoun + na + ${vowelPrefix}${stem}kari.`,
        };
      case 'negativePast':
        return {
          source,
          parts: [stem, negPastSuffix],
          text: `Stem + '-${negPastSuffix}' (vowel harmony). Plural subjects also insert the '${vowelPrefix}' linker.`,
        };
      case 'negativeFuture':
        return {
          source,
          parts: ['ma', stem],
          text: `Replace 'ga' with 'ma' and drop the harmony prefix. Pronoun + ma + ${stem}.`,
        };
      case 'negativeImperative':
        return {
          source,
          parts: [`${vowelPrefix}${stem}`, negImpSuffix],
          text: `Vowel-harmony prefix + stem + '-${negImpSuffix}'. Pronoun prepended (e.g. "Anyi ${vowelPrefix}${stem}${negImpSuffix}").`,
        };
      case 'negativePerfect':
        return {
          source,
          parts: ['dika', `${vowelPrefix}${stem}`],
          text: `Pronoun + dika + ${vowelPrefix}${stem}. Plural subjects prefix 'dika' with the harmony vowel.`,
        };
      case 'neverPerfect':
        return {
          source,
          parts: [stem, 'nene'],
          text: `Stem + '-nene'. The suffix does not take a verb-prefix linker on its own — only when combined with a tense that requires one.`,
        };
      case 'finished':
        return {
          source,
          parts: [stem, 'si'],
          text: `Derivational suffix for a completed action. Shown here in the present-perfect frame: plural subjects add '-ga'; singular pronouns use the bare derived stem.`,
        };
      case 'together':
        return {
          source,
          parts: [stem, 'kota'],
          text: `Derivational suffix meaning "together". Shown in the future frame (Pronoun + ga + ${vowelPrefix}${stem}kota).`,
        };
      case 'first':
        return {
          source,
          parts: [stem, 'gode'],
          text: `Derivational suffix meaning "do X first of all". Imperative only: 2sg / 1pl / 2pl carry forms.`,
        };
      case 'polite':
        return {
          source,
          parts: [stem, 'nụ́'],
          text: `Polite intensifier ("please"). Imperative-form base + '-nụ́'. Only 2sg / 1pl / 2pl carry forms.`,
        };
      default:
        return {
          source,
          parts: [stem],
          text: 'Follows the standard conjugation rule for this tense.',
        };
    }
  };

  const isVerbEnabled = true; // Placeholder for enabled state

  return (
    <View style={[styles.verbDetailContainer, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}>
      {/* Background Wave Patterns */}
      <View style={styles.detailWaveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.15 : 0.2} />
      </View>
      <View style={styles.detailWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.15 : 0.2} />
      </View>

      {/* Custom Header for Modal */}
      <View style={[styles.detailHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={28} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderTitleContainer}>
          <Text style={styles.detailHeaderTitle}>{verb.igbo}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.detailScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Tab Bar */}
        <View style={styles.detailTabBar}>
          {(['Indicative', 'Negation', 'Others', 'Extras'] as const).map((tab) => (
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
            <Text style={styles.englishMeaningLabel}>
              {/^to\s/i.test(verb.english ?? '') ? verb.english : `To ${verb.english ?? ''}`}
            </Text>
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
                <View style={styles.tenseHeaderLabelGroup}>
                  <Text style={styles.tenseHeaderText}>{tenseLabels[tense].toUpperCase()}</Text>
                  {!!tenseAnnotations[tense] && (
                    <Text style={styles.tenseHeaderAnnotation}>
                      {tenseAnnotations[tense]}
                    </Text>
                  )}
                </View>
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
                            </View>

                            <View style={styles.formulaRow}>
                              <View
                                style={[
                                  styles.formulaBox,
                                  styles.formulaBoxOutline,
                                ]}
                              >
                                <Text style={styles.formulaText}>
                                  {ruleData.source}
                                </Text>
                              </View>
                              <Text style={styles.formulaOperator}>→</Text>
                              {ruleData.parts.map((part, idx) => (
                                <React.Fragment key={`${part}-${idx}`}>
                                  {idx > 0 && (
                                    <Text style={styles.formulaOperator}>
                                      +
                                    </Text>
                                  )}
                                  <View style={styles.formulaBox}>
                                    <Text style={styles.formulaText}>
                                      {part}
                                    </Text>
                                  </View>
                                </React.Fragment>
                              ))}
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
  },
  bgWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  orangeHeader: {
    backgroundColor: '#F3703E',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerInner: {
    width: '100%',
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
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: -20, // Pull up over the orange header overlap
  },
  searchInputContainer: {
    width: '100%',
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
  verbsList: {
    flex: 1,
  },
  listContent: {
    alignItems: 'center',
    paddingTop: 4,
  },
  verbItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#D85A22',
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
    position: 'relative',
  },
  detailWaveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 0,
  },
  detailWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 0,
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
  tenseHeaderLabelGroup: {
    flex: 1,
    flexDirection: 'column',
  },
  tenseHeaderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Manjari-Bold',
    letterSpacing: 1,
  },
  tenseHeaderAnnotation: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
    marginTop: 2,
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
