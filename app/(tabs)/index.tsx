import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { RotateCcw, Volume2, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { IgboVerb } from '@/data/igboVerbs';
import { verbService } from '@/lib/verbService';
import { useSettings } from '@/hooks/useSettings';
import { useProgress } from '@/hooks/useProgress';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';

const { width } = Dimensions.get('window');

const tenses = ['present', 'past', 'future', 'subjunctive'];
const pronouns = ['m', 'i', 'o', 'anyi', 'unu', 'ha'];
const pronounLabels = {
  m: 'M (I)',
  i: 'I (You)',
  o: 'O (He/She)',
  anyi: 'Anyị (We)',
  unu: 'Unu (You all)',
  ha: 'Ha (They)',
};

export default function PracticeScreen() {
  const [currentVerb, setCurrentVerb] = useState<IgboVerb | null>(null);
  const [selectedTense, setSelectedTense] = useState(() => tenses[Math.floor(Math.random() * 2)]); // Only present and past
  const [selectedPronoun, setSelectedPronoun] = useState(() => pronouns[Math.floor(Math.random() * pronouns.length)]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const { settings } = useSettings();
  const { updateProgress } = useProgress();
  const { isProUser } = usePurchases();
  const { theme, isDark } = useTheme();
  const { statistics } = useProgress();

  // Initialize with random verb
  useEffect(() => {
    const loadRandomVerb = async () => {
      try {
        const verb = await verbService.getRandomVerb();
        setCurrentVerb(verb);
      } catch (error) {
        console.error('Error loading random verb:', error);
      }
    };
    
    loadRandomVerb();
  }, []);

  const correctAnswer = currentVerb?.conjugations[selectedTense]?.[selectedPronoun] || 'N/A';

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    if (currentVerb) {
      updateProgress(currentVerb.id, true);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
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
    setSelectedTense(availableTenses[Math.floor(Math.random() * availableTenses.length)]);
    setSelectedPronoun(pronouns[Math.floor(Math.random() * pronouns.length)]); // Randomize pronoun
    setShowAnswer(false);
    fadeAnim.setValue(0);
  };

  const handlePlayAudio = () => {
    // Audio playback would be implemented here
    console.log('Playing audio for:', currentVerb?.infinitive);
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

  const getTenseBadgeColor = (tense: string) => {
    switch (tense) {
      case 'present': return '#3b82f6';
      case 'past': return '#10b981';
      case 'future': return '#f59e0b';
      case 'subjunctive': return '#8b5cf6';
      default: return '#6b7280';
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
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.progressTitle, { color: theme.colors.textSecondary }]}>Daily goal</Text>
        <Text style={[styles.progressCount, { color: theme.colors.textSecondary }]}>{String(statistics.dailyGoalProgress)} / {String(settings.dailyGoal)}</Text>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              {/* English meaning at top */}
              <Text style={[styles.englishMeaning, { color: theme.colors.textSecondary }]}>
                {String(currentVerb.meaning)}
              </Text>

              {/* Main Igbo verb */}
              <Text style={[styles.igboVerb, { color: theme.colors.text }]}>
                {String(currentVerb.infinitive)}
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
                    <Text style={[styles.tapToNextText, { color: theme.colors.textSecondary, opacity: fadeAnim }]}>
                      Tap to continue
                    </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  progressCount: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 320,
    position: 'relative',
  },
  englishMeaning: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
  },
  igboVerb: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 60,
    fontFamily: 'Inter-Bold',
  },
  tenseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  tenseBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  answerSection: {
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  answerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  pronounText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tapToNextText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  answerPlaceholder: {
    alignItems: 'center',
  },
  answerLine: {
    width: 200,
    height: 2,
    marginBottom: 20,
  },
  tapToShowButton: {
    paddingVertical: 8,
  },
  tapToShowText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
});