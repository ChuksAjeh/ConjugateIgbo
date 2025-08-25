import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { rhymeCards } from '@/data/rhymeCards';
import { createStyles } from './rhymesStyles';

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

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Rhyming Verbs: {currentCard.rhymePattern}
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