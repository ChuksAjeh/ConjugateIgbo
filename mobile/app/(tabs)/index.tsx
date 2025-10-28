import React, { useState, useEffect } from 'react';
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
import { IgboVerb, Tense, Pronoun } from '@/models/verb';
import { verbService } from '@/lib/verbService';
import { getConjugatedForm } from '@/lib/conjugateVerbs';
import { useSettings } from '@/hooks/useSettings';
import { useProgress } from '@/hooks/useProgress';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { styles } from './indexStyles';

// Define type-safe tenses and pronouns
const tenses: Tense[] = ['present', 'past', 'future'];
const pronouns: Pronoun[] = ['m', 'i', 'o', 'anyi', 'unu', 'wa'];
const pronounLabels: Record<Pronoun, string> = {
  m: 'A/E… m (I)',
  i: 'I/Iyu (You)',
  o: 'Ọ (He/She/It)',
  anyi: 'Anyị (We)',
  unu: 'Unu (You all)',
  wa: 'Wa (They)'
};

export default function PracticeScreen() {
  const [currentVerb, setCurrentVerb] = useState<IgboVerb | null>(null);
  const [selectedTense, setSelectedTense] = useState<Tense>(() => tenses[Math.floor(Math.random() * 2)]); // Only present and past
  const [selectedPronoun, setSelectedPronoun] = useState<Pronoun>(() => pronouns[Math.floor(Math.random() * pronouns.length)]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { settings } = useSettings();
  const { updateProgress, statistics } = useProgress();
  const { isProUser } = usePurchases();
  const { theme } = useTheme();

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
    try {
      const verb = await verbService.getRandomVerb();
      setCurrentVerb(verb);
    } catch (error) {
      console.error('Error loading next verb:', error);
      return;
    }

    // If user is pro, allow all tenses, otherwise limit to present and past
    const availableTenses = isProUser ? tenses : tenses.slice(0, 2);
    // Type assertion to ensure we're getting a valid Tense
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
        <Text
          style={[styles.progressCount, { color: theme.colors.textSecondary }]}>{String(statistics.dailyGoalProgress)} / {String(settings.dailyGoal)}</Text>
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
