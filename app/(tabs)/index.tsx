import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Volume2, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { igboVerbs, getVerbById, AspectForm } from '@/data/igboVerbs';
import { createStyles } from './practiceStyles';

const pronouns = ['m', 'i', 'o', 'anyi', 'unu', 'ha'];
const pronounLabels = {
  m: 'M (I)',
  i: 'I (You)',
  o: 'O (He/She/It)',
  anyi: 'Anyị (We)',
  unu: 'Unu (You all)',
  ha: 'Ha (They)',
};

export default function PracticeScreen() {
  const { settings, progress, updateProgress, getDueReviews, currentSession, setCurrentSession } = useAppStore();
  const [currentVerb, setCurrentVerb] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [sessionCount, setSessionCount] = useState(0);

  const styles = createStyles();

  // Get available verbs based on premium status
  const getAvailableVerbs = () => {
    if (settings.isPremium) {
      return igboVerbs;
    }
    return igboVerbs.filter(verb => !verb.isPremium);
  };

  // Get next verb for practice
  const getNextVerb = () => {
    const availableVerbs = getAvailableVerbs();
    const dueReviews = getDueReviews();
    
    // Prioritize due reviews
    if (dueReviews.length > 0) {
      const dueReview = dueReviews[Math.floor(Math.random() * dueReviews.length)];
      const verb = getVerbById(dueReview.verbId);
      if (verb) {
        setCurrentSession({
          verbId: verb.id,
          dialect: dueReview.dialect,
          aspect: dueReview.aspect,
          pronoun: pronouns[Math.floor(Math.random() * pronouns.length)],
        });
        return verb;
      }
    }
    
    // Otherwise, pick a random verb
    const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)];
    const enabledAspects = settings.enabledAspects;
    const aspect = enabledAspects[Math.floor(Math.random() * enabledAspects.length)];
    
    setCurrentSession({
      verbId: verb.id,
      dialect: settings.selectedDialect,
      aspect,
      pronoun: pronouns[Math.floor(Math.random() * pronouns.length)],
    });
    
    return verb;
  };

  // Initialize with first verb
  useEffect(() => {
    const verb = getNextVerb();
    setCurrentVerb(verb);
  }, []);

  // Get correct answer
  const getCorrectAnswer = () => {
    if (!currentVerb || !currentSession.verbId) return '';
    
    const conjugations = currentVerb.conjugations[currentSession.dialect];
    const aspectConjugations = conjugations[currentSession.aspect];
    const conjugation = aspectConjugations.find(c => c.pronoun === currentSession.pronoun);
    
    return settings.showToneMarks ? conjugation?.toneMarks || '' : conjugation?.form || '';
  };

  // Handle reveal answer
  const handleRevealAnswer = () => {
    if (settings.typeToAnswer && userAnswer.trim()) {
      // Check typed answer
      const correctAnswer = getCorrectAnswer();
      const isAnswerCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
      setIsCorrect(isAnswerCorrect);
      
      // Update progress
      updateProgress(
        currentSession.verbId,
        currentSession.dialect,
        currentSession.aspect,
        isAnswerCorrect
      );
    }
    
    setShowAnswer(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle next verb
  const handleNextVerb = () => {
    if (!settings.typeToAnswer) {
      // For tap-to-reveal mode, assume correct
      updateProgress(
        currentSession.verbId,
        currentSession.dialect,
        currentSession.aspect,
        true
      );
    }
    
    const nextVerb = getNextVerb();
    setCurrentVerb(nextVerb);
    setShowAnswer(false);
    setUserAnswer('');
    setIsCorrect(null);
    setSessionCount(prev => prev + 1);
    fadeAnim.setValue(0);
  };

  // Handle audio playback (stub)
  const handlePlayAudio = () => {
    // Audio implementation would go here
    Alert.alert('Audio', 'Audio playback coming soon!');
  };

  if (!currentVerb) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctAnswer = getCorrectAnswer();
  const aspectColor = {
    imperfective: '#3b82f6',
    perfective: '#10b981',
    progressive: '#f59e0b',
    habitual: '#8b5cf6',
  }[currentSession.aspect];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.dialectBadge}>
          <Text style={styles.dialectText}>
            {settings.selectedDialect.charAt(0).toUpperCase() + settings.selectedDialect.slice(1)} Igbo
          </Text>
        </View>
        <Text style={styles.sessionCount}>Session: {sessionCount}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Practice Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.card}
          >
            {/* English meaning */}
            <Text style={styles.englishMeaning}>"{currentVerb.meaning}"</Text>
            
            {/* Igbo infinitive */}
            <Text style={styles.igboVerb}>{currentVerb.infinitive}</Text>
            
            {/* Aspect badge */}
            <View style={[styles.aspectBadge, { backgroundColor: aspectColor }]}>
              <Text style={styles.aspectBadgeText}>
                {currentSession.aspect.charAt(0).toUpperCase() + currentSession.aspect.slice(1)}
              </Text>
            </View>
            
            {/* Pronoun */}
            <Text style={styles.pronounText}>
              {pronounLabels[currentSession.pronoun]}
            </Text>
            
            {/* Answer section */}
            <View style={styles.answerSection}>
              {settings.typeToAnswer ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.answerInput,
                      isCorrect === true && styles.correctInput,
                      isCorrect === false && styles.incorrectInput,
                    ]}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="Type your answer..."
                    placeholderTextColor="#9ca3af"
                    editable={!showAnswer}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {showAnswer && (
                    <View style={styles.feedbackContainer}>
                      {isCorrect ? (
                        <View style={styles.correctFeedback}>
                          <Check size={20} color="#10b981" />
                          <Text style={styles.correctText}>Correct!</Text>
                        </View>
                      ) : (
                        <View style={styles.incorrectFeedback}>
                          <X size={20} color="#ef4444" />
                          <Text style={styles.incorrectText}>
                            Correct answer: {correctAnswer}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.tapToRevealContainer}>
                  {showAnswer ? (
                    <Animated.View style={[styles.answerContainer, { opacity: fadeAnim }]}>
                      <Text style={styles.answerText}>{correctAnswer}</Text>
                      <Text style={styles.tapToContinueText}>Tap to continue</Text>
                    </Animated.View>
                  ) : (
                    <View style={styles.hiddenAnswerContainer}>
                      <View style={styles.answerLine} />
                      <Text style={styles.tapToShowText}>Tap to reveal answer</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {/* Mnemonic hint */}
            {showAnswer && (
              <Animated.View style={[styles.mnemonicContainer, { opacity: fadeAnim }]}>
                <Text style={styles.mnemonicText}>💡 {currentVerb.mnemonic}</Text>
              </Animated.View>
            )}
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleNextVerb}>
          <RotateCcw size={24} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, showAnswer && styles.primaryButtonActive]}
          onPress={showAnswer ? handleNextVerb : handleRevealAnswer}
          disabled={settings.typeToAnswer && !userAnswer.trim() && !showAnswer}
        >
          <Text style={styles.primaryButtonText}>
            {showAnswer ? 'Continue' : settings.typeToAnswer ? 'Check' : 'Reveal'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handlePlayAudio}>
          <Volume2 size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}