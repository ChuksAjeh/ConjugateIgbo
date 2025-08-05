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
import { useTheme } from '@/components/ThemeProvider';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
      </ScrollView>
    </SafeAreaView>
  )
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