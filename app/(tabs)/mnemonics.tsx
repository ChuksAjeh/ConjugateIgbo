import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { rhymeCards } from '@/data/rhymeCards';

const { width } = Dimensions.get('window');

interface VerbRevealState {
  [key: string]: boolean;
}

export default function RhymesScreen() {
  const { theme } = useTheme();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedVerbs, setRevealedVerbs] = useState<VerbRevealState>({});

  const currentCard = rhymeCards[currentCardIndex];
  const totalCards = rhymeCards.length;

  // Check if all verbs on current card are revealed
  const allVerbsRevealed = currentCard.verbs.every(verb => 
    revealedVerbs[`${currentCardIndex}-${verb.igbo}`]
  );

  // Auto-advance to next card when all verbs are revealed
  useEffect(() => {
    if (allVerbsRevealed && currentCardIndex < totalCards - 1) {
      const timer = setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allVerbsRevealed, currentCardIndex, totalCards]);

  const toggleVerbReveal = (verb: string) => {
    const key = `${currentCardIndex}-${verb}`;
    setRevealedVerbs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetProgress = () => {
    setCurrentCardIndex(0);
    setRevealedVerbs({});
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      alignSelf: 'center',
      marginHorizontal: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    verbContainer: {
      width: '100%',
      marginBottom: 16,
    },
    verbButton: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    verbButtonRevealed: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    igboText: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    pronunciationText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 8,
    },
    englishText: {
      fontSize: 16,
      color: theme.colors.primary,
      textAlign: 'center',
      fontWeight: '500',
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 16,
    },
    dotsContainer: {
      flexDirection: 'row',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: theme.colors.textSecondary + '30',
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
    },
    completionMessage: {
      marginTop: 20,
      padding: 16,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      alignItems: 'center',
    },
    completionText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: 8,
    },
    resetButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    resetButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    instructionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
    },
  });

  if (currentCardIndex >= totalCards) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.completionMessage}>
              <Text style={styles.completionText}>
                🎉 Congratulations!
              </Text>
              <Text style={[styles.instructionText, { marginTop: 0 }]}>
                You've completed all rhyme cards!
              </Text>
              <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
                <Text style={styles.resetButtonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Rhyming Verbs: {currentCard.pattern}
          </Text>
          
          {currentCard.verbs.map((verb, index) => {
            const isRevealed = revealedVerbs[`${currentCardIndex}-${verb.igbo}`];
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.verbButton,
                  isRevealed && styles.verbButtonRevealed
                ]}
                onPress={() => toggleVerbReveal(verb.igbo)}
                activeOpacity={0.7}
              >
                <Text style={styles.igboText}>{verb.igbo}</Text>
                <Text style={styles.pronunciationText}>/{verb.pronunciation}/</Text>
                {isRevealed && (
                  <Text style={styles.englishText}>{verb.english}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentCardIndex + 1} of {totalCards}
          </Text>
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalCards }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentCardIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.instructionText}>
          {allVerbsRevealed 
            ? "Great! Moving to next card..." 
            : "Tap each verb to reveal its meaning"
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}