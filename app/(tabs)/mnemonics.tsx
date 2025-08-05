import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { rhymeCards, RhymeCard, getTotalRhymeCards } from '@/data/rhymeCards';
import { useTheme } from '@/components/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function RhymesScreen() {
  const { theme, isDark } = useTheme();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedVerbs, setRevealedVerbs] = useState<Set<string>>(new Set());
  const [slideAnim] = useState(new Animated.Value(0));
  const [canProceed, setCanProceed] = useState(false);

  const currentCard = rhymeCards[currentCardIndex];
  const totalCards = getTotalRhymeCards();

  // Check if all verbs on current card are revealed
  useEffect(() => {
    if (currentCard) {
      const allRevealed = currentCard.verbs.every(verb => 
        revealedVerbs.has(`${currentCardIndex}-${verb.igbo}`)
      );
      setCanProceed(allRevealed);
    }
  }, [revealedVerbs, currentCardIndex, currentCard]);

  // Reset revealed verbs when card changes
  useEffect(() => {
    setRevealedVerbs(new Set());
    setCanProceed(false);
  }, [currentCardIndex]);

  const toggleVerbMeaning = (verbIgbo: string) => {
    const key = `${currentCardIndex}-${verbIgbo}`;
    setRevealedVerbs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const goToNextCard = () => {
    if (!canProceed || currentCardIndex >= totalCards - 1) return;
    
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentCardIndex(prev => prev + 1);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const goToPreviousCard = () => {
    if (currentCardIndex <= 0) return;
    
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentCardIndex(prev => prev - 1);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Swipe gesture handling
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      slideAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, vx } = gestureState;
      
      if (Math.abs(dx) > width * 0.3 || Math.abs(vx) > 0.5) {
        if (dx > 0 && currentCardIndex > 0) {
          // Swipe right - go to previous card
          goToPreviousCard();
        } else if (dx < 0 && canProceed && currentCardIndex < totalCards - 1) {
          // Swipe left - go to next card (only if all verbs revealed)
          goToNextCard();
        } else {
          // Snap back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      } else {
        // Snap back
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const renderVerb = (verb: { igbo: string; english: string; pronunciation: string }, index: number) => {
    const key = `${currentCardIndex}-${verb.igbo}`;
    const isRevealed = revealedVerbs.has(key);
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.verbItem,
          { borderBottomColor: theme.colors.border },
          index === currentCard.verbs.length - 1 && styles.lastVerbItem
        ]}
        onPress={() => toggleVerbMeaning(verb.igbo)}
        activeOpacity={0.7}
      >
        <View style={styles.verbContent}>
          <Text style={[styles.verbIgbo, { color: theme.colors.text }]}>
            {verb.igbo}
          </Text>
          {isRevealed && (
            <Animated.View style={styles.verbMeaningContainer}>
              <Text style={[styles.verbEnglish, { color: theme.colors.textSecondary }]}>
                {verb.english}
              </Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Progress */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Rhymes</Text>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentCardIndex + 1} of {totalCards}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentCardIndex + 1) / totalCards) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.flashcard, { backgroundColor: theme.colors.surface }]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {currentCard.title}
              </Text>
              <View style={[styles.rhymePatternBadge, { backgroundColor: isDark ? '#1e40af' : '#eff6ff' }]}>
                <Text style={[styles.rhymePatternText, { color: theme.colors.primary }]}>
                  {currentCard.rhymePattern}
                </Text>
              </View>
            </View>

            {/* Verbs List */}
            <View style={styles.verbsList}>
              {currentCard.verbs.map((verb, index) => renderVerb(verb, index))}
            </View>

            {/* Instruction Text */}
            <View style={styles.instructionContainer}>
              <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
                {canProceed 
                  ? 'All meanings revealed! Swipe or tap Next →' 
                  : 'Tap each verb to reveal its meaning'
                }
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.colors.surface },
              currentCardIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={goToPreviousCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft 
              size={24} 
              color={currentCardIndex === 0 ? '#9ca3af' : theme.colors.text} 
            />
          </TouchableOpacity>

          <View style={styles.dotIndicator}>
            {Array.from({ length: totalCards }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: isDark ? '#374151' : '#e5e7eb' },
                  index === currentCardIndex && { backgroundColor: theme.colors.primary }
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.colors.surface },
              (!canProceed || currentCardIndex === totalCards - 1) && styles.navButtonDisabled
            ]}
            onPress={goToNextCard}
            disabled={!canProceed || currentCardIndex === totalCards - 1}
          >
            <ChevronRight 
              size={24} 
              color={(!canProceed || currentCardIndex === totalCards - 1) ? '#9ca3af' : theme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Completion Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {revealedVerbs.size > 0 && (
              `${Array.from(revealedVerbs).filter(key => key.startsWith(`${currentCardIndex}-`)).length} of ${currentCard.verbs.length} revealed`
            )}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcard: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minHeight: 400,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  rhymePatternBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rhymePatternText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  verbsList: {
    flex: 1,
    justifyContent: 'center',
  },
  verbItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  lastVerbItem: {
    borderBottomWidth: 0,
  },
  verbContent: {
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  verbIgbo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  verbMeaningContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  verbEnglish: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  instructionContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});