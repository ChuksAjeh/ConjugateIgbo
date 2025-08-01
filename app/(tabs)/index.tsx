import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  SafeAreaView,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Volume2, Book, X } from 'lucide-react-native';
import { getRandomVerb, checkConjugation, IgboVerb } from '@/data/igboVerbs';
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
  const [currentVerb, setCurrentVerb] = useState(getRandomVerb());
  const [selectedTense, setSelectedTense] = useState(() => tenses[Math.floor(Math.random() * 2)]); // Only present and past
  const [selectedPronoun, setSelectedPronoun] = useState(() => pronouns[Math.floor(Math.random() * pronouns.length)]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConjugations, setShowConjugations] = useState(false);
  const [activeTab, setActiveTab] = useState<'indicative' | 'subjunctive' | 'others'>('indicative');
  
  const { settings } = useSettings();
  const { updateProgress } = useProgress();
  const { isProUser } = usePurchases();
  const { theme, isDark } = useTheme();
  const { statistics } = useProgress();

  const correctAnswer = currentVerb.conjugations[selectedTense]?.[selectedPronoun] || 'N/A';

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    updateProgress(currentVerb.id, true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNextVerb = () => {
    setCurrentVerb(getRandomVerb());
    
    // If user is pro, allow all tenses, otherwise limit to present and past
    const availableTenses = isProUser ? tenses : tenses.slice(0, 2);
    setSelectedTense(availableTenses[Math.floor(Math.random() * availableTenses.length)]);
    setSelectedPronoun(pronouns[Math.floor(Math.random() * pronouns.length)]); // Randomize pronoun
    setShowAnswer(false);
    fadeAnim.setValue(0);
  };

  const handlePlayAudio = () => {
    // Audio playback would be implemented here
    console.log('Playing audio for:', currentVerb.infinitive);
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

  const renderConjugationTable = () => (
    <Modal
      visible={showConjugations}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>All Conjugations</Text>
          <TouchableOpacity onPress={() => setShowConjugations(false)}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'indicative' && { ...styles.activeTab, backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveTab('indicative')}
          >
            <Text style={[
              styles.tabText, 
              { color: theme.colors.textSecondary },
              activeTab === 'indicative' && { color: theme.colors.text }
            ]}>
              Indicative
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'subjunctive' && { ...styles.activeTab, backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveTab('subjunctive')}
          >
            <Text style={[
              styles.tabText, 
              { color: theme.colors.textSecondary },
              activeTab === 'subjunctive' && { color: theme.colors.text }
            ]}>
              Subjunctive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'others' && { ...styles.activeTab, backgroundColor: theme.colors.surface }]}
            onPress={() => setActiveTab('others')}
          >
            <Text style={[
              styles.tabText, 
              { color: theme.colors.textSecondary },
              activeTab === 'others' && { color: theme.colors.text }
            ]}>
              Others
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.verbDetailHeader}>
            <Text style={[styles.verbDetailInfinitive, { color: theme.colors.text }]}>{currentVerb.infinitive}</Text>
            <Text style={[styles.verbDetailMeaning, { color: theme.colors.textSecondary }]}>"{currentVerb.meaning}"</Text>
          </View>

          {activeTab === 'indicative' && (
            <>
              {['present', 'past', 'future'].map((tense) => (
                currentVerb.conjugations[tense] && (
                  <View key={tense} style={[styles.tenseSection, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.tenseTitle, { color: getTenseBadgeColor(tense) }]}>
                      {tense.charAt(0).toUpperCase() + tense.slice(1)} Tense
                    </Text>
                    <View style={styles.conjugationTable}>
                      {Object.entries(currentVerb.conjugations[tense]).map(([pronoun, conjugation]) => (
                        <View key={pronoun} style={[styles.conjugationRow, { borderBottomColor: theme.colors.border }]}>
                          <Text style={[styles.pronounText, { color: theme.colors.textSecondary }]}>{pronounLabels[pronoun]}:</Text>
                          <Text style={[styles.conjugationText, { color: theme.colors.text }]}>{conjugation}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              ))}
            </>
          )}

          {activeTab === 'subjunctive' && (
            <>
              {['subjunctive'].map((tense) => (
                currentVerb.conjugations[tense] && (
                  <View key={tense} style={[styles.tenseSection, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.tenseTitle, { color: getTenseBadgeColor(tense) }]}>
                      {tense.charAt(0).toUpperCase() + tense.slice(1)} Tense
                    </Text>
                    <View style={styles.conjugationTable}>
                      {Object.entries(currentVerb.conjugations[tense]).map(([pronoun, conjugation]) => (
                        <View key={pronoun} style={[styles.conjugationRow, { borderBottomColor: theme.colors.border }]}>
                          <Text style={[styles.pronounText, { color: theme.colors.textSecondary }]}>{pronounLabels[pronoun]}:</Text>
                          <Text style={[styles.conjugationText, { color: theme.colors.text }]}>{conjugation}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              ))}
            </>
          )}

          {activeTab === 'others' && (
            <View style={styles.comingSoonContainer}>
              <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>Imperative and Gerund forms</Text>
              <Text style={[styles.comingSoonSubtext, { color: theme.colors.textSecondary }]}>Coming soon in a future update</Text>
            </View>
          )}

          {currentVerb.examples && (
            <View style={styles.examplesSection}>
              <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>Examples</Text>
              {currentVerb.examples.map((example, index) => (
                <View key={index} style={[styles.exampleItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.exampleIgbo, { color: theme.colors.text }]}>{example.igbo}</Text>
                  <Text style={[styles.exampleEnglish, { color: theme.colors.textSecondary }]}>"{example.english}"</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Daily Goal Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Daily Goal</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
            <View style={[styles.progressFill, { width: `${(statistics.dailyGoalProgress / settings.dailyGoal) * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{statistics.dailyGoalProgress}/{settings.dailyGoal}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={[styles.card, showAnswer && styles.cardRevealed, { backgroundColor: theme.colors.surface }]}>
              {/* Tense Badge */}
              <View style={[styles.tenseBadge, { backgroundColor: getTenseBadgeColor(selectedTense) }]}>
                <Text style={styles.tenseBadgeText}>
                  {selectedTense.charAt(0).toUpperCase() + selectedTense.slice(1)}
                </Text>
              </View>

              {/* Verb Information */}
              <View style={styles.verbSection}>
                <Text style={[styles.verbInfinitive, showAnswer && styles.verbInfinitiveSmall, { color: theme.colors.text }]}>
                  {currentVerb.infinitive}
                </Text>
                <Text style={[styles.verbMeaning, showAnswer && styles.verbMeaningSmall, { color: theme.colors.textSecondary }]}>
                  "{currentVerb.meaning}"
                </Text>
              </View>

              {/* Pronoun Prompt */}
              <View style={styles.promptSection}>
                <Text style={[styles.promptText, showAnswer && styles.promptTextSmall, { color: theme.colors.textSecondary }]}>
                  Conjugate for:
                </Text>
                <Text style={[styles.pronounText, showAnswer && styles.pronounTextSmall]}>
                  {pronounLabels[selectedPronoun]}
                </Text>
              </View>

              {/* Answer Section */}
              <View style={[styles.answerSection, showAnswer && styles.answerSectionSmall]}>
                {!showAnswer ? (
                  <TouchableOpacity style={styles.revealButton} onPress={handleRevealAnswer}>
                    <Text style={styles.revealButtonText}>Tap to Reveal</Text>
                  </TouchableOpacity>
                ) : (
                  <Animated.View style={[styles.answerContainer, { opacity: fadeAnim }]}>
                    <Text style={[styles.answerText, styles.answerTextSmall]}>
                      {correctAnswer}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>

          {/* Example Usage */}
          {currentVerb.examples && showAnswer && (
            <Animated.View style={[styles.examplesContainer, { opacity: fadeAnim, backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>Example:</Text>
              <View style={styles.exampleItem}>
                <Text style={[styles.exampleIgbo, { color: theme.colors.text }]}>{currentVerb.examples[0].igbo}</Text>
                <Text style={[styles.exampleEnglish, { color: theme.colors.textSecondary }]}>"{currentVerb.examples[0].english}"</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Action Buttons - Fixed at bottom */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextVerb}>
            <RotateCcw size={20} color="white" />
            <Text style={styles.nextButtonText}>Next Verb</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]} 
              onPress={() => setShowConjugations(true)}
            >
              <Book size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]} 
              onPress={handlePlayAudio}
            >
              <Volume2 size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderConjugationTable()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
    minHeight: 320,
  },
  cardRevealed: {
    minHeight: 240,
    padding: 16,
  },
  tenseBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tenseBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  verbSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verbInfinitive: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  verbInfinitiveSmall: {
    fontSize: 22,
    marginBottom: 4,
  },
  verbMeaning: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  verbMeaningSmall: {
    fontSize: 14,
    marginBottom: 8,
  },
  promptSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  promptText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  promptTextSmall: {
    fontSize: 12,
    marginBottom: 4,
  },
  pronounText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    fontFamily: 'Inter-SemiBold',
  },
  pronounTextSmall: {
    fontSize: 16,
  },
  answerSection: {
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 16,
  },
  answerSectionSmall: {
    minHeight: 40,
  },
  revealButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  revealButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  answerContainer: {
    alignItems: 'center',
  },
  answerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  answerTextSmall: {
    fontSize: 18,
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examplesContainer: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  exampleItem: {
    alignItems: 'center',
  },
  exampleIgbo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  exampleEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  comingSoonSubtext: {
    fontSize: 14,
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
    fontFamily: 'Inter-Bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  verbDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verbDetailInfinitive: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  verbDetailMeaning: {
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  tenseSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  conjugationTable: {
    gap: 12,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pronounText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 80,
    fontFamily: 'Inter-SemiBold',
  },
  conjugationText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  examplesSection: {
    marginTop: 24,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
});