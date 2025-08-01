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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Volume2, Book, X } from 'lucide-react-native';
import { getRandomVerb, checkConjugation, IgboVerb } from '@/data/igboVerbs';
import { useSettings } from '@/hooks/useSettings';
import { useProgress } from '@/hooks/useProgress';

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
  const [dailyProgress, setDailyProgress] = useState(23); // Mock progress out of 100
  const [showConjugations, setShowConjugations] = useState(false);
  
  const { settings } = useSettings();
  const { updateProgress } = useProgress();

  const correctAnswer = currentVerb.conjugations[selectedTense]?.[selectedPronoun] || 'N/A';

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setDailyProgress(prev => Math.min(prev + 1, 100));
    updateProgress(currentVerb.id, true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNextVerb = () => {
    setCurrentVerb(getRandomVerb());
    setSelectedTense(tenses[Math.floor(Math.random() * 2)]); // Randomize between present and past
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>All Conjugations</Text>
          <TouchableOpacity onPress={() => setShowConjugations(false)}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.verbDetailHeader}>
            <Text style={styles.verbDetailInfinitive}>{currentVerb.infinitive}</Text>
            <Text style={styles.verbDetailMeaning}>"{currentVerb.meaning}"</Text>
          </View>

          {Object.entries(currentVerb.conjugations).map(([tense, conjugations]) => (
            <View key={tense} style={styles.tenseSection}>
              <Text style={[styles.tenseTitle, { color: getTenseBadgeColor(tense) }]}>
                {tense.charAt(0).toUpperCase() + tense.slice(1)} Tense
              </Text>
              <View style={styles.conjugationTable}>
                {Object.entries(conjugations).map(([pronoun, conjugation]) => (
                  <View key={pronoun} style={styles.conjugationRow}>
                    <Text style={styles.pronounText}>{pronounLabels[pronoun]}:</Text>
                    <Text style={styles.conjugationText}>{conjugation}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {currentVerb.examples && (
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Examples</Text>
              {currentVerb.examples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleIgbo}>{example.igbo}</Text>
                  <Text style={styles.exampleEnglish}>"{example.english}"</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Daily Goal Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Daily Goal</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${dailyProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{dailyProgress}/100</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Tense Badge */}
            <View style={[styles.tenseBadge, { backgroundColor: getTenseBadgeColor(selectedTense) }]}>
              <Text style={styles.tenseBadgeText}>
                {selectedTense.charAt(0).toUpperCase() + selectedTense.slice(1)}
              </Text>
            </View>

            {/* Verb Information */}
            <View style={styles.verbSection}>
              <Text style={styles.verbInfinitive}>{currentVerb.infinitive}</Text>
              <Text style={styles.verbMeaning}>"{currentVerb.meaning}"</Text>
            </View>

            {/* Pronoun Prompt */}
            <View style={styles.promptSection}>
              <Text style={styles.promptText}>Conjugate for:</Text>
              <Text style={styles.pronounText}>
                {pronounLabels[selectedPronoun]}
              </Text>
            </View>

            {/* Answer Section */}
            <View style={styles.answerSection}>
              {!showAnswer ? (
                <TouchableOpacity style={styles.revealButton} onPress={handleRevealAnswer}>
                  <Text style={styles.revealButtonText}>Tap to Reveal</Text>
                </TouchableOpacity>
              ) : (
                <Animated.View style={[styles.answerContainer, { opacity: fadeAnim }]}>
                  <Text style={styles.answerText}>{correctAnswer}</Text>
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextVerb}>
            <RotateCcw size={20} color="white" />
            <Text style={styles.nextButtonText}>Next Verb</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setShowConjugations(true)}
            >
              <Book size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handlePlayAudio}
            >
              <Volume2 size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Example Usage */}
        {currentVerb.examples && showAnswer && (
          <Animated.View style={[styles.examplesContainer, { opacity: fadeAnim }]}>
            <Text style={styles.examplesTitle}>Example:</Text>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleIgbo}>{currentVerb.examples[0].igbo}</Text>
              <Text style={styles.exampleEnglish}>"{currentVerb.examples[0].english}"</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {renderConjugationTable()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    backgroundColor: '#f3f4f6',
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
    color: '#6b7280',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
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
    marginBottom: 32,
  },
  verbInfinitive: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  verbMeaning: {
    fontSize: 18,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  promptSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  promptText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  pronounText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3b82f6',
    fontFamily: 'Inter-SemiBold',
  },
  answerSection: {
    alignItems: 'center',
    minHeight: 60,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  actionButtonsContainer: {
    alignItems: 'center',
    gap: 16,
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
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examplesContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  exampleItem: {
    alignItems: 'center',
  },
  exampleIgbo: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  verbDetailMeaning: {
    fontSize: 18,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  tenseSection: {
    backgroundColor: 'white',
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
    borderBottomColor: '#f3f4f6',
  },
  pronounText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 80,
    fontFamily: 'Inter-SemiBold',
  },
  conjugationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  examplesSection: {
    marginTop: 24,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
});