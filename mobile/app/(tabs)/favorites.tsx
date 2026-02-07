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
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Volume2,
  Bookmark,
  ChevronLeft,
  ChevronDown,
  Play,
} from 'lucide-react-native';
import { WavePattern } from '@/components/SplashScreen';
import { IgboVerb, Tense } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { useTheme } from '@/components/ThemeProvider';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import { useFavorites } from '@/hooks/useFavorites';
import {
  pronounLabels,
  pronouns,
} from '@/models/interfaces';

export default function FavoritesScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    favorites,
    isLoading: favoritesLoading,
    refresh: refreshFavorites,
  } = useFavorites();
  const [verbs, setVerbs] = useState<IgboVerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites]),
  );

  useEffect(() => {
    const loadVerbs = async () => {
      try {
        // Only show loading on initial load to prevent flickering
        if (!hasInitiallyLoaded) {
          setIsLoading(true);
        }
        const allVerbs = await verbService.getAllVerbs();
        // Filter verbs that are in favorites
        const favoriteVerbs = allVerbs.filter((v) => favorites.includes(v.id));
        setVerbs(favoriteVerbs);
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: { feature: 'favorites', screen: 'FavoritesScreen' },
        });
      } finally {
        if (!hasInitiallyLoaded) {
          setIsLoading(false);
          setHasInitiallyLoaded(true);
        }
      }
    };

    if (!favoritesLoading) {
      loadVerbs();
    }
  }, [favorites, favoritesLoading, hasInitiallyLoaded]);

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
    <View
      style={[styles.container, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}
    >
      {/* Background Wave Patterns */}
      <View style={styles.bgWaveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.15 : 0.2} />
      </View>
      <View style={styles.bgWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.15 : 0.2} />
      </View>

      {/* Orange Header */}
      <View style={[styles.orangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitleText}>Favourites</Text>
        <Text style={styles.headerSubtitleText}>
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

// Tenses organized by tab - matching verbs.tsx
const tensesByTab = {
  Indicative: ['present', 'past', 'future', 'imperfect'] as Tense[],
  Subjunctive: ['subjunctive'] as Tense[],
  Others: ['imperative', 'conditional'] as Tense[],
};

// VerbDetailContent matching the design from verbs.tsx
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
    'Indicative' | 'Subjunctive' | 'Others'
  >('Indicative');
  const [expandedTenses, setExpandedTenses] = useState<Record<string, boolean>>({
    PRESENT: true,
  });
  const [expandedConjugation, setExpandedConjugation] = useState<string | null>(
    null,
  );

  const availableTensesInTab = useMemo(() => {
    let list = tensesByTab[activeTab];
    if (!isLoading && !isProUser) {
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
    const stem = verb.igbo.startsWith('i') || verb.igbo.startsWith('ị')
      ? verb.igbo.substring(1)
      : verb.igbo;
    const vowelPrefix = /[aọụịỌỤỊ]/.test(stem) ? 'a' : 'e';

    switch (tense) {
      case 'present':
        return {
          text: `Remove 'i' prefix, add vowel harmony prefix '${vowelPrefix}'. Pronoun + na + ${vowelPrefix}${stem}.`,
          formula: [verb.igbo, '→', `${vowelPrefix}${stem}`],
        };
      case 'past':
        return {
          text: `Remove 'i' prefix to form past stem. Pronoun + ${stem}.`,
          formula: [verb.igbo, '→', stem],
        };
      case 'future':
        return {
          text: `Same as present with 'ga' particle. Pronoun + ga + ${vowelPrefix}${stem}.`,
          formula: [verb.igbo, '→', `ga ${vowelPrefix}${stem}`],
        };
      case 'subjunctive':
        return {
          text: `Remove 'i' prefix, add 'e' suffix. ${stem}e.`,
          formula: [verb.igbo, '→', `${stem}e`],
        };
      default:
        return {
          text: 'Follows the standard conjugation rule for this tense.',
          formula: [stem, '-', '+'],
        };
    }
  };

  const isVerbEnabled = true;

  return (
    <View style={[styles.verbDetailContainer, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}>
      <View style={styles.detailWaveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.15 : 0.2} />
      </View>
      <View style={styles.detailWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.15 : 0.2} />
      </View>

      <View style={[styles.detailHeader, { paddingTop: Math.max(insets.top, 20) }]}>
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
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.detailScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
            Toggle on or off to practise conjugation. Swipe to move on to new verb.
          </Text>
        </View>

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
                    const conjugationId = `${tense}-${p}`;
                    const isConjugationExpanded = expandedConjugation === conjugationId;

                    return (
                      <View key={conjugationId}>
                        <TouchableOpacity
                          style={styles.conjugationRow}
                          onPress={() => toggleConjugation(conjugationId)}
                        >
                          <Text style={styles.pronounLabel}>
                            {pronounLabels[p]}
                          </Text>
                          <View style={styles.conjugationRight}>
                            <Text style={styles.conjugationValue}>
                              {String(conjugated)}
                            </Text>
                            <ChevronDown
                              size={16}
                              color="#9ca3af"
                              style={{
                                transform: [
                                  { rotate: isConjugationExpanded ? '180deg' : '0deg' },
                                ],
                              }}
                            />
                          </View>
                        </TouchableOpacity>

                        {isConjugationExpanded && (
                          <View style={styles.ruleSection}>
                            <View style={styles.ruleHeader}>
                              <View style={styles.easyBadge}>
                                <Text style={styles.easyBadgeText}>Easy</Text>
                              </View>
                              <TouchableOpacity style={styles.playButton}>
                                <Play size={16} color="#F3703E" />
                              </TouchableOpacity>
                            </View>

                            <View style={styles.formulaContainer}>
                              <View style={styles.formulaBox}>
                                <Text style={styles.formulaText}>
                                  {ruleData.formula[0]}
                                </Text>
                              </View>
                              <Text style={styles.formulaArrow}>
                                {ruleData.formula[1]}
                              </Text>
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
          <TouchableOpacity style={styles.proUpgradeBanner} onPress={onClose}>
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
  verbsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  verbItem: {
    borderRadius: 15,
    marginBottom: 12,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'Manjari-Bold',
    flex: 1,
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
    fontFamily: 'Manjari-Regular',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Manjari-Regular',
  },
  modalContainer: {
    flex: 1,
  },
  // Verb Detail Styles (matching verbs.tsx)
  verbDetailContainer: {
    flex: 1,
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
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
  },
  tenseAccordion: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  tenseHeaderText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manjari-Bold',
    letterSpacing: 1,
  },
  tenseContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pronounLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manjari-Regular',
  },
  conjugationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conjugationValue: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Manjari-Bold',
  },
  ruleSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  easyBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontFamily: 'Manjari-Bold',
  },
  playButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formulaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  formulaBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formulaText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manjari-Bold',
  },
  formulaArrow: {
    fontSize: 18,
    color: '#9ca3af',
    fontFamily: 'Manjari-Regular',
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Manjari-Regular',
  },
  proUpgradeBanner: {
    backgroundColor: '#F3703E',
    padding: 20,
    margin: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  proUpgradeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manjari-Bold',
  },
});
