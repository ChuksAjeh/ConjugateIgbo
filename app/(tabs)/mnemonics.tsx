import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff, RotateCcw } from 'lucide-react-native';
import { mnemonicCards, getRandomMnemonicCard } from '@/data/mnemonicCards';
import { useTheme } from '@/hooks/useTheme';

export default function MnemonicsScreen() {
  const { theme, isDark } = useTheme();
  const [revealedVerbs, setRevealedVerbs] = useState<Set<string>>(new Set());
  const [currentCard, setCurrentCard] = useState(() => getRandomMnemonicCard());

  const handleNextCard = () => {
    setCurrentCard(getRandomMnemonicCard());
    setRevealedVerbs(new Set());
  };

  const toggleVerbMeaning = (verbIgbo: string) => {
    setRevealedVerbs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verbIgbo)) {
        newSet.delete(verbIgbo);
      } else {
        newSet.add(verbIgbo);
      }
      return newSet;
    });
  };

  const hideAllMeanings = () => {
    setRevealedVerbs(new Set());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Mnemonic Card */}
        <View style={[styles.mnemonicCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.mnemonicTitle, { color: theme.colors.text }]}>
            {currentCard.title}
          </Text>
          <Text style={[styles.mnemonicSubtitle, { color: theme.colors.textSecondary }]}>
            {currentCard.subtitle}
          </Text>
          <Text style={[styles.mnemonicText, { color: theme.colors.text }]}>
            {currentCard.mnemonic}
          </Text>
        </View>

        {/* Verbs Container */}
        <View style={[styles.verbsCard, { backgroundColor: theme.colors.surface }]}>
          {currentCard.verbs.map((verb, index) => {
            const isRevealed = revealedVerbs.has(verb.igbo);
            const isLastItem = index === currentCard.verbs.length - 1;
            
            return (
              <View key={index}>
                <TouchableOpacity
                  style={styles.verbItem}
                  onPress={() => toggleVerbMeaning(verb.igbo)}
                  activeOpacity={0.7}
                >
                  <View style={styles.verbContent}>
                    <Text style={[styles.verbIgbo, { color: theme.colors.text }]}>
                      {verb.igbo}
                    </Text>
                    {isRevealed && (
                      <Text style={[styles.verbEnglish, { color: theme.colors.textSecondary }]}>
                        {verb.english}
                      </Text>
                    )}
                  </View>
                  <View style={styles.eyeIcon}>
                    {isRevealed ? (
                      <EyeOff size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={theme.colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
                {!isLastItem && (
                  <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={hideAllMeanings}
          >
            <EyeOff size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>
              Hide All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleNextCard}
          >
            <RotateCcw size={20} color="white" />
            <Text style={styles.primaryButtonText}>Next Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  mnemonicCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mnemonicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  mnemonicSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  mnemonicText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  verbsCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  verbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  verbContent: {
    flex: 1,
  },
  verbIgbo: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  verbEnglish: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});