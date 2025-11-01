import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ScrollView
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

  const { settings } = useSettings();
  const { updateProgress, statistics } = useProgress();
  const { isProUser } = usePurchases();
  const { theme } = useTheme();
  const [dailyCount, setDailyCount] = useState(0);

  // Build the list of available tenses based on Settings and Pro status
  const availableTenses: Tense[] = useMemo(() => {
    // Start with the app-supported tenses
    let list = [...tenses];

    // Restrict non-Pro users to present and past only
    if (!isProUser) {
      list = list.filter((t) => t === 'present' || t === 'past');
    }

    // Apply user settings toggles
    list = list.filter((t) => {
      return settings.enabledTenses[t];
    });

    // Fallbacks to ensure we always have at least one tense
    if (list.length === 0) {
      // Try a sensible default respecting entitlement first
      const fallback = (!isProUser ? ['present', 'past'] : ['present', 'past', 'future']).filter(
        (t) => (settings.enabledTenses as any)[t] !== false
      );
      if (fallback.length > 0) return fallback as Tense[];

      // Absolute fallback
      return (!isProUser ? ['present', 'past'] : ['present', 'past', 'future']) as Tense[];
    }

    return list as Tense[];
  }, [isProUser, settings.enabledTenses]);

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
        try {
          const verb = await verbService.getRandomVerb();
          if (!isActive) return;
          setCurrentVerb(verb);

          // Pick a valid tense based on latest settings and entitlement
          const newTense = availableTenses[Math.floor(Math.random() * availableTenses.length)] as Tense;
          setSelectedTense(newTense);

          // Randomize pronoun
          const newPronoun = pronouns[Math.floor(Math.random() * pronouns.length)] as Pronoun;
          setSelectedPronoun(newPronoun);

          // Reset answer state and animation
          setShowAnswer(false);
          fadeAnim.setValue(0);
        } catch (error) {
          console.error('Error refreshing practice card on focus:', error);
        }
      };

      refreshCard().then(r => console.log("card refresh: ", r));

      return () => {
        isActive = false;
        // Stop any ongoing animations to avoid warnings on blur/unmount
        try {
          fadeAnim.stopAnimation();
        } catch {}
      };
    }, [availableTenses])
  );

  // Initialize with a random verb
  useEffect(() => {
    const loadRandomVerb = async () => {
      try {
        const verb = await verbService.getRandomVerb();
        console.log('Loaded random verb:', verb);
        setCurrentVerb(verb);
      } catch (error) {
        console.error('Error loading random verb:', error);
      }
    };

    loadRandomVerb();

    // Cleanup function to prevent animation errors when the component unmounts
    return () => {
      // Stop any ongoing animations
      fadeAnim.stopAnimation();
      fadeAnim.setValue(0);
    };
  }, []);

  // Type-safe access to conjugations (rule-based, with legacy fallback)
  const correctAnswer = currentVerb ? getConjugatedForm(currentVerb, selectedTense, selectedPronoun) : 'N/A';
  console.log('Correct answer:', correctAnswer);

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    if (currentVerb) {
      updateProgress(currentVerb.id, true);
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
      const verb = await verbService.getRandomVerb();
      setCurrentVerb(verb);
    } catch (error) {
      console.error('Error loading next verb:', error);
      return;
    }

    // Pick next tense from those available per Settings and Pro status
    const newTense = availableTenses[Math.floor(Math.random() * availableTenses.length)] as Tense;
    setSelectedTense(newTense);
    // Type assertion to ensure we're getting a valid Pronoun
    const newPronoun = pronouns[Math.floor(Math.random() * pronouns.length)] as Pronoun;
    setSelectedPronoun(newPronoun);
    setShowAnswer(false);
    fadeAnim.setValue(0);
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
              {/* English meaning at top */}
              <Text style={[styles.englishMeaning, { color: theme.colors.textSecondary }]}>
                {String(currentVerb.english)}
              </Text>

              {/* Main Igbo verb */}
              <Text style={[styles.igboVerb, { color: theme.colors.text }]}>
                {String(currentVerb.igbo)}
              </Text>

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
    </SafeAreaView>
  );
}
