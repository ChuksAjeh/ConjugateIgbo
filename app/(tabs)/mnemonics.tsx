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
  const [revealedCount, setRevealedCount] = useState(0);
  
  const totalCards = rhymeCards.length;

  const currentCard = rhymeCards[currentCardIndex];

  const handleCardTap = () => {
    if (revealedCount < currentCard.verbs.length) {
      // Reveal next verb
      setRevealedCount(prev => prev + 1);
    } else {
      // All verbs revealed, move to next card
      setCurrentCardIndex(prev => (prev + 1) % totalCards);
      setRevealedCount(0);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 40,
      width: width - 40,
      maxWidth: 380,
      height: 500,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 32,
      textAlign: 'center',
      fontFamily: 'Inter-SemiBold',
    },
    verbContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
    verbButton: {
      paddingVertical: 8,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verbButtonRevealed: {
      // No additional styling needed
    },
    igboText: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
      fontFamily: 'Inter-Bold',
    },
    pronunciationText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 4,
      fontFamily: 'Inter-Regular',
    },
    englishText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Inter-Regular',
    },
    instructionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      paddingHorizontal: 20,
      fontFamily: 'Inter-Regular',
    },
    cardTapArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Rhyming Verbs: {currentCard.pattern}
          </Text>
          
          <View style={styles.verbContainer}>
            {currentCard.verbs.map((verb, index) => {
              const isRevealed = index < revealedCount;
              return (
                <View
                  key={index}
                  style={styles.verbButton}
                >
                  <Text style={styles.igboText}>{verb.igbo}</Text>
                  <Text style={styles.pronunciationText}>/{verb.pronunciation}/</Text>
                  {isRevealed && (
                    <Text style={styles.englishText}>{verb.english}</Text>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.cardTapArea}
            onPress={handleCardTap}
            activeOpacity={1}
          />
        </View>

        <Text style={styles.instructionText}>
          {revealedCount < currentCard.verbs.length 
            ? 'Tap to reveal next verb' 
            : 'Tap to continue to next card'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}