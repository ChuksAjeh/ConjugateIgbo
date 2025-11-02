import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import { RotateCcw, Volume2, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { IgboVerb, Tense, Pronoun } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { useProgress } from '@/hooks/useProgress';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { styles } from './indexStyles';
import { pronounLabels, pronouns, tenses } from '@/app/(tabs)/models/interfaces';

export default function PracticeScreen() {
  const [currentVerb, setCurrentVerb] = useState<IgboVerb | null>(null);
  const [selectedTense, setSelectedTense] = useState<Tense>('present');
  const [selectedPronoun, setSelectedPronoun] = useState<Pronoun>(() => pronouns[Math.floor(Math.random() * pronouns.length)]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [fallbackModalVisible, setFallbackModalVisible] = useState(false);

  const { settings } = useSettings();
  const { updateProgress } = useProgress();
  const { isProUser } = usePurchases();
  const { theme } = useTheme();
  const [dailyCount, setDailyCount] = useState(0);

  // Determine what to show on the card based on Settings > Display Mode
  const showEnglish = settings.displayMode === 'Verb and translation' || settings.displayMode === 'Only translation';
  const showIgbo = settings.displayMode === 'Verb and translation' || settings.displayMode === 'Only verb';

  // Track last used dialect to trigger reloads when it changes
  const lastDialectRef = useRef(settings.dialect);
  useEffect(() => {
    if (lastDialectRef.current !== settings.dialect) {
      lastDialectRef.current = settings.dialect;
      // When dialect changes (e.g., user returns from Settings), refresh the card
      loadNewVerb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.dialect]);

  const availableTenses: Tense[] = useMemo(() => {
    let list = [...tenses];
    if (!isProUser) {
      list = list.filter((t) => t === 'present' || t === 'past');
    }
    list = list.filter((t) => {
      return settings.enabledTenses[t];
    });
    if (list.length === 0) {
      const defaults: Tense[] = !isProUser ? ['present', 'past'] : ['present', 'past', 'future'];
      const fallback = defaults.filter((t) => settings.enabledTenses[t]);
      if (fallback.length > 0) return fallback;
      return defaults;
    }
    return list;
  }, [isProUser, settings.enabledTenses]);

  // Extract the common logic into a reusable function
  const loadNewVerb = useCallback(async () => {
    try {
      // Reset any previous fallback notice; we'll show it again if we actually fall back
      setFallbackModalVisible(false);

      const { verb, fellBackToDelta } = await verbService.getRandomVerbForDialect(settings.dialect as any);
      setCurrentVerb(verb);
      if (fellBackToDelta) {
        setFallbackModalVisible(true);
      }

      // Pick a valid tense based on the latest settings and entitlement
      const newTense = availableTenses[Math.floor(Math.random() * availableTenses.length)] as Tense;
      setSelectedTense(newTense);

      // Randomize pronoun
      const newPronoun = pronouns[Math.floor(Math.random() * pronouns.length)] as Pronoun;
      setSelectedPronoun(newPronoun);

      // Reset answer state and animation
      setShowAnswer(false);
      fadeAnim.setValue(0);

      return verb;
    } catch (error) {
      console.error('Error loading verb:', error);
      throw error;
    }
  }, [availableTenses, fadeAnim, settings.dialect]);

  // Ensure selectedTense always respects current Settings/Pro availability
  useEffect(() => {
    if (!availableTenses.includes(selectedTense)) {
      const newTense = availableTenses[Math.floor(Math.random() * availableTenses.length)] as Tense;
      setSelectedTense(newTense);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTenses]);

  // Refresh the practice card whenever this tab/screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const refreshCard = async () => {
        if (!isActive) return;
        try {
          await loadNewVerb();
        } catch (error) {
          console.error('Error refreshing practice card on focus:', error);
        }
      };

      refreshCard();

      return () => {
        isActive = false;
        try {
          fadeAnim.stopAnimation();
        } catch (error) {
          console.error('Error stopping animation:', error);
        }
      };
    }, [loadNewVerb, fadeAnim])
  );

  // Type-safe access to conjugations (rule-based, with legacy fallback)
  const correctAnswer = currentVerb ? getConjugatedForm(currentVerb, selectedTense, selectedPronoun, settings.dialect as any) : 'N/A';
  console.log('Correct answer:', correctAnswer);

  const handleRevealAnswer = async () => {
    setShowAnswer(true);
    if (currentVerb) {
      try {
        await updateProgress(currentVerb.id, true);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const handleNextVerb = async () => {
    // Increment daily goal counter whenever user proceeds to the next card
    setDailyCount((prev) => prev + 1);
    
    try {
      await loadNewVerb();
    } catch (error) {
      console.error('Error loading next verb:', error);
    }
  };

  const handlePlayAudio = () => {
    // Audio playback would be implemented here
    console.log('Playing audio for:', currentVerb?.igbo);
  };

  const handleShowVerbDetails = () => {
    if (currentVerb) {
      // Navigate to verbs tab and show this specific verb
      router.push({
        pathname: '/(tabs)/verbs',
        params: { verbId: currentVerb.id }
      });
    }
  };

  const getTenseBadgeColor = (tense: Tense) => {
    switch (tense) {
      case 'present':
        return '#3b82f6';
      case 'past':
        return '#10b981';
      case 'future':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Show loading state while verb is loading
  if (!currentVerb) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading verb...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Daily Goal Progress Bar */}
      <View style={[styles.progressContainer, {
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border
      }]}>
        <Text style={[styles.progressTitle, { color: theme.colors.textSecondary }]}>Daily goal</Text>
        <Text style={[styles.progressCount]}> 
          <Text style={{ color: dailyCount >= settings.dailyGoal ? '#10b981' : '#ef4444' }}>{String(dailyCount)}</Text>
          <Text style={{ color: theme.colors.textSecondary }}> / {String(settings.dailyGoal)}</Text>
        </Text>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              {/* English meaning at top (optional) */}
              {showEnglish && (
                <Text style={[styles.englishMeaning, { color: theme.colors.textSecondary }]}>
                  {String(currentVerb.english)}
                </Text>
              )}

              {/* Main Igbo verb (optional) */}
              {showIgbo && (
                <Text style={[styles.igboVerb, { color: theme.colors.text }]}>
                  {String(currentVerb.igbo)}
                </Text>
              )}

              {/* Tense badge */}
              <View style={[styles.tenseBadge, { backgroundColor: getTenseBadgeColor(selectedTense) }]}>
                <Text style={styles.tenseBadgeText}>
                  {selectedTense.charAt(0).toUpperCase() + selectedTense.slice(1)}
                </Text>
              </View>

              {/* Conjugated answer */}
              <View style={styles.answerSection}>
                {/* Pronoun display */}
                <Text style={[styles.pronounText, { color: theme.colors.textSecondary }]}>
                  {pronounLabels[selectedPronoun]}
                </Text>

                {showAnswer ? (
                  <TouchableOpacity onPress={handleNextVerb} activeOpacity={0.7}>
                    <Animated.Text style={[styles.answerText, { opacity: fadeAnim, color: theme.colors.text }]}>
                      {String(correctAnswer)}
                    </Animated.Text>
                    <Animated.Text
                      style={[styles.tapToNextText, { color: theme.colors.textSecondary, opacity: fadeAnim }]}>
                      Tap to continue
                    </Animated.Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.answerPlaceholder}>
                    <View style={[styles.answerLine, { backgroundColor: theme.colors.border }]} />
                    <TouchableOpacity style={styles.tapToShowButton} onPress={handleRevealAnswer}>
                      <Text style={[styles.tapToShowText, { color: theme.colors.textSecondary }]}>
                        Tap to show answer
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleNextVerb}
          >
            <RotateCcw size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleShowVerbDetails}
          >
            <FileText size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handlePlayAudio}
          >
            <Volume2 size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Fallback Modal for verbs defaulting to Delta */}
      <Modal
        visible={fallbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFallbackModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.colors.surface, padding: 20, borderRadius: 12, width: '85%' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, color: theme.colors.text }}>
              Network or data issue
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
              Failed to get verbs for {settings.dialect.charAt(0).toUpperCase() + settings.dialect.slice(1)} Igbo.
              Defaulting to Delta Igbo until your connection is restored.
            </Text>
            <TouchableOpacity
              onPress={() => setFallbackModalVisible(false)}
              style={{ alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#3b82f6', borderRadius: 8 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '600' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
