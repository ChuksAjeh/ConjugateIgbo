import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import {
  RotateCcw,
  Volume2,
  Book,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { IgboVerb, Tense, Pronoun } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { useProgress } from '@/hooks/useProgress';
import { usePurchases } from '@/hooks/usePurchases';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/components/ThemeProvider';
import { WavePattern } from '@/components/SplashScreen';
import { pronounLabels, pronouns, tenses } from '@/models/interfaces';

import * as Sentry from '@sentry/react-native';

const { width } = Dimensions.get('window');

export default function PracticeScreen() {
  const { settings } = useSettings();
  const { statistics, updateProgress } = useProgress();
  const { isProUser, isLoading } = usePurchases();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const availablePronouns: Pronoun[] = useMemo(() => {
    const list = pronouns.filter((p) => settings.enabledPronouns[p]);
    return list.length > 0 ? list : pronouns;
  }, [settings.enabledPronouns]);

  const availableTenses: Tense[] = useMemo(() => {
    let list = [...tenses];
    if (!isLoading && !isProUser) {
      list = list.filter((t) => t === 'present' || t === 'past');
    }
    list = list.filter((t) => {
      return settings.enabledTenses[t];
    });
    if (list.length === 0) {
      const defaults: Tense[] =
        !isLoading && !isProUser
          ? ['present', 'past']
          : ['present', 'past', 'future'];
      const fallback = defaults.filter((t) => settings.enabledTenses[t]);
      if (fallback.length > 0) return fallback;
      return defaults;
    }
    return list;
  }, [isProUser, isLoading, settings.enabledTenses]);

  const [currentVerb, setCurrentVerb] = useState<IgboVerb | null>(null);
  const [selectedTense, setSelectedTense] = useState<Tense>('present');
  const [selectedPronoun, setSelectedPronoun] = useState<Pronoun>(
    () =>
      availablePronouns[Math.floor(Math.random() * availablePronouns.length)],
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(1));
  const [translateX] = useState(new Animated.Value(0));
  const [fallbackModalVisible, setFallbackModalVisible] = useState(false);

  // History for "Back" functionality
  const [history, setHistory] = useState<
    { verb: IgboVerb; tense: Tense; pronoun: Pronoun }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const loadNewVerb = useCallback(
    async (isBack = false, isForward = false) => {
      try {
        setFallbackModalVisible(false);

        let verb: IgboVerb;
        let newTense: Tense;
        let newPronoun: Pronoun;

        // Handle back navigation with wrap-around
        if (isBack && history.length > 1) {
          let newIndex: number;
          if (historyIndex <= 0) {
            // Wrap around to the end
            newIndex = history.length - 1;
          } else {
            newIndex = historyIndex - 1;
          }
          const prev = history[newIndex];
          verb = prev.verb;
          newTense = prev.tense;
          newPronoun = prev.pronoun;
          setHistoryIndex(newIndex);
        } 
        // Handle forward navigation in history (only if there are verbs ahead)
        else if (isForward && historyIndex < history.length - 1) {
          // Navigate forward in history
          const next = history[historyIndex + 1];
          verb = next.verb;
          newTense = next.tense;
          newPronoun = next.pronoun;
          setHistoryIndex(historyIndex + 1);
        }
        else {
          // Get a brand new verb (initial load or no history)
          const { verb: nextVerb, fellBackToDelta } =
            await verbService.getRandomVerbForDialect(
              settings.dialect as any,
              settings.verbLimit,
            );
          verb = nextVerb;
          if (fellBackToDelta) {
            setFallbackModalVisible(true);
          }

          newTense = availableTenses[
            Math.floor(Math.random() * availableTenses.length)
          ] as Tense;

          newPronoun = availablePronouns[
            Math.floor(Math.random() * availablePronouns.length)
          ] as Pronoun;

          // Add to history
          setHistory((prev) => {
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, { verb, tense: newTense, pronoun: newPronoun }];
          });
          setHistoryIndex((prev) => prev + 1);
        }

        setCurrentVerb(verb);
        setSelectedTense(newTense);
        setSelectedPronoun(newPronoun);
        setShowAnswer(false);
        fadeAnim.setValue(0);

        return verb;
      } catch {
        // throw error;
      }
    },
    [
      availableTenses,
      availablePronouns,
      fadeAnim,
      settings.dialect,
      settings.verbLimit,
      history,
      historyIndex,
    ],
  );

  useEffect(() => {
    if (!availableTenses.includes(selectedTense)) {
      const newTense = availableTenses[
        Math.floor(Math.random() * availableTenses.length)
      ] as Tense;
      setSelectedTense(newTense);
    }
  }, [availableTenses, selectedTense]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const refreshCardIfNeeded = async () => {
        if (!isActive) return;
        try {
          if (!currentVerb) {
            await loadNewVerb();
          }
        } catch (error: any) {
          Sentry.captureException(error, {
            tags: {
              feature: 'practice - card focus',
              screen: 'PracticeScreen',
            },
          });
        }
      };

      refreshCardIfNeeded();

      return () => {
        isActive = false;
        fadeAnim.stopAnimation();
      };
    }, [currentVerb, loadNewVerb, fadeAnim]),
  );

  const correctAnswer = currentVerb
    ? getConjugatedForm(
        currentVerb,
        selectedTense,
        selectedPronoun,
        settings.dialect as any,
      )
    : 'N/A';

  const handleRevealAnswer = async () => {
    setShowAnswer(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNextVerb = async () => {
    await updateProgress();

    // Reset card position if it was swiped
    translateX.setValue(0);

    // Small bounce animation for transition
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await loadNewVerb(false, true);
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'practice - load a verb', screen: 'PracticeScreen' },
      });
    }
  };

  const handleBackVerb = async () => {
    // Allow wrap-around if we have more than one verb in history
    if (history.length <= 1) return;

    // Reset card position if it was swiped
    translateX.setValue(0);

    // Slide animation for transition
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: width,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -width,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await loadNewVerb(true);
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'practice - back verb', screen: 'PracticeScreen' },
      });
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translateX: translateX } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (Math.abs(translationX) > 100) {
        // Swiped far enough
        Animated.timing(translateX, {
          toValue: translationX > 0 ? width : -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          if (translationX > 0) {
            handleBackVerb();
          } else {
            handleNextVerb();
          }
        });
      } else {
        // Not far enough, spring back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePlayAudio = () => {
    Sentry.logger.info(
      `[PracticeScreen] Playing audio for: ${currentVerb?.igbo}`,
      {
        tags: {
          feature: 'practice - play card audio',
          screen: 'PracticeScreen',
        },
      },
    );
  };

  const handleShowVerbsList = () => {
    router.push('/(tabs)/verbs');
  };

  const toggleSave = () => {
    if (currentVerb) {
      toggleFavorite(currentVerb.id);
    }
  };

  if (!currentVerb) {
    return (
      <View style={localStyles.loadingContainer}>
        <Text style={localStyles.loadingText}>Loading verb...</Text>
      </View>
    );
  }

  return (
    <View style={[localStyles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Daily Goal Top Bar */}
      <View
        style={[
          localStyles.topBarContainer,
          { paddingTop: Math.max(insets.top, 20), backgroundColor: '#F3703E' },
        ]}
      >
        <View style={localStyles.topBar}>
          <Text style={localStyles.goalLabel}>Daily goal</Text>
          <Text style={localStyles.goalProgress}>
            {statistics.dailyGoalProgress}/{settings.dailyGoal}
          </Text>
        </View>
      </View>

      <View style={localStyles.mainContent}>
        {/* Background Waves */}
        <View style={localStyles.bgWaveLeft}>
          <WavePattern side="left" />
        </View>
        <View style={localStyles.bgWaveRight}>
          <WavePattern side="right" />
        </View>

        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              localStyles.cardWrapper,
              {
                transform: [{ scale: cardScale }, { translateX: translateX }],
              },
            ]}
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetX={[-50, 50]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={showAnswer ? handleNextVerb : handleRevealAnswer}
                style={[localStyles.card, { backgroundColor: theme.colors.surface }]}
              >
                {/* Card Decorative Waves */}
                <View style={localStyles.cardWaveLeft}>
                  <WavePattern
                    side="left"
                    customHeight={400}
                    variant="zigzag"
                    color={isDark ? '#FFFFFF' : '#555'}
                    opacity={isDark ? 0.3 : 0.8}
                  />
                </View>
                <View style={localStyles.cardWaveRight}>
                  <WavePattern
                    side="right"
                    customHeight={400}
                    variant="zigzag"
                    color={isDark ? '#FFFFFF' : '#555'}
                    opacity={isDark ? 0.3 : 0.8}
                  />
                </View>

                <View style={localStyles.cardContent}>
                  <Text style={[localStyles.englishText, { color: isDark ? theme.colors.textSecondary : '#666' }]}>
                    {currentVerb.english}
                  </Text>
                  <Text style={[localStyles.igboText, { color: theme.colors.text }]}>{currentVerb.igbo}</Text>

                  <View style={localStyles.tenseBadge}>
                    <Text style={localStyles.tenseText}>
                      {selectedTense.charAt(0).toUpperCase() +
                        selectedTense.slice(1)}
                    </Text>
                  </View>

                  <Text style={[localStyles.pronounText, { color: isDark ? theme.colors.textSecondary : '#666' }]}>
                    {pronounLabels[selectedPronoun]}
                  </Text>

                  {showAnswer ? (
                    <Animated.View
                      style={{ opacity: fadeAnim, alignItems: 'center' }}
                    >
                      <Text style={[localStyles.conjugatedText, { color: theme.colors.text }]}>
                        {correctAnswer}
                      </Text>
                      <Text style={localStyles.tapToContinue}>
                        Tap to continue
                      </Text>
                    </Animated.View>
                  ) : (
                    <View style={localStyles.tapToShow}>
                      <View style={localStyles.line} />
                      <Text style={localStyles.tapToShowText}>
                        Tap to show answer
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </PanGestureHandler>
          </Animated.View>

          {/* Action Buttons */}
          <View style={localStyles.actionRow}>
            <TouchableOpacity
              style={[
                localStyles.actionButton,
                history.length <= 1 && { opacity: 0.3 },
              ]}
              onPress={handleBackVerb}
              disabled={history.length <= 1}
            >
              <View style={[localStyles.actionIconBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <RotateCcw size={28} color={isDark ? theme.colors.textSecondary : "#666"} />
              </View>
              <Text style={localStyles.actionLabel}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.actionButton}
              onPress={handlePlayAudio}
            >
              <View style={[localStyles.actionIconBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Volume2 size={28} color={isDark ? theme.colors.textSecondary : "#666"} />
              </View>
              <Text style={localStyles.actionLabel}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.actionButton}
              onPress={handleShowVerbsList}
            >
              <View style={[localStyles.actionIconBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Book size={28} color={isDark ? theme.colors.textSecondary : "#666"} />
              </View>
              <Text style={localStyles.actionLabel}>Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.actionButton}
              onPress={toggleSave}
            >
              <View style={[localStyles.actionIconBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {isFavorite(currentVerb.id) ? (
                  <BookmarkCheck size={28} color="#CE3B3B" />
                ) : (
                  <Bookmark size={28} color={isDark ? theme.colors.textSecondary : "#666"} />
                )}
              </View>
              <Text style={localStyles.actionLabel}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Fallback Modal */}
      <Modal visible={fallbackModalVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalBox}>
            <Text style={localStyles.modalTitle}>Network or data issue</Text>
            <Text style={localStyles.modalText}>
              Failed to get verbs for {settings.dialect}. Defaulting to Delta
              Igbo.
            </Text>
            <TouchableOpacity
              onPress={() => setFallbackModalVisible(false)}
              style={localStyles.modalOk}
            >
              <Text style={localStyles.modalOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBarContainer: {
    backgroundColor: '#F3703E',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  goalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manjari-Regular',
  },
  goalProgress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manjari-Bold',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  bgWaveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    opacity: 0.2,
  },
  bgWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    opacity: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 120, // Space for floating tab bar
  },
  cardWrapper: {
    width: width * 0.85,
    maxWidth: 340,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 400,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardWaveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 25,
    opacity: 0.15,
  },
  cardWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 25,
    opacity: 0.15,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  englishText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Manjari-Regular',
    marginBottom: 10,
  },
  igboText: {
    fontSize: 36,
    color: '#333',
    fontFamily: 'Manjari-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tenseBadge: {
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 25,
  },
  tenseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Manjari-Bold',
  },
  pronounText: {
    fontSize: 20,
    color: '#666',
    fontFamily: 'Manjari-Regular',
    marginBottom: 15,
  },
  conjugatedText: {
    fontSize: 32,
    color: '#333',
    fontFamily: 'Manjari-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  tapToContinue: {
    fontSize: 12,
    color: '#CCC',
    fontFamily: 'Manjari-Regular',
  },
  tapToShow: {
    alignItems: 'center',
  },
  line: {
    width: 150,
    height: 1,
    backgroundColor: '#EEE',
    marginBottom: 10,
  },
  tapToShowText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Manjari-Regular',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    maxWidth: 360,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Manjari-Regular',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manjari-Bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Manjari-Regular',
    color: '#666',
    marginBottom: 20,
  },
  modalOk: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3703E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalOkText: {
    color: '#FFFFFF',
    fontFamily: 'Manjari-Bold',
  },
});
