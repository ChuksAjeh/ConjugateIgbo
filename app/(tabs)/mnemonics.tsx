import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

const { width, height } = Dimensions.get('window');

// Simple verb data for the rhymes page
const verbGroups = [
  {
    id: 'flow-group',
    verbs: [
      { igbo: 'fluir', english: 'to flow', revealed: false },
      { igbo: 'flotar', english: 'to float', revealed: false },
      { igbo: 'faltar', english: 'to lack', revealed: false },
      { igbo: 'fallar', english: 'to fail', revealed: false },
    ]
  }
];

export default function MnemonicsScreen() {
  const { theme, isDark } = useTheme();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [revealedVerbs, setRevealedVerbs] = useState<Set<string>>(new Set());

  const currentGroup = verbGroups[currentGroupIndex];

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

  const renderVerb = (verb: { igbo: string; english: string }, index: number) => {
    const isRevealed = revealedVerbs.has(verb.igbo);
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.verbContainer}
        onPress={() => toggleVerbMeaning(verb.igbo)}
        activeOpacity={0.7}
      >
        <Text style={[styles.verbIgbo, { color: theme.colors.text }]}>
          {verb.igbo}
        </Text>
        {isRevealed && (
          <Text style={[styles.verbEnglish, { color: theme.colors.textSecondary }]}>
            {verb.english}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.verbsContainer}>
          {currentGroup.verbs.map((verb, index) => renderVerb(verb, index))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  verbsContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 40,
  },
  verbContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    minHeight: 80,
    justifyContent: 'center',
    width: '100%',
  },
  verbIgbo: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  verbEnglish: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});