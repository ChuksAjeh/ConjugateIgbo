import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { mnemonicCards, MnemonicCard } from '@/data/mnemonicCards';
import { useTheme } from '@/components/ThemeProvider';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function FlashcardsScreen() {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [revealedVerbs, setRevealedVerbs] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const flipAnimations = useRef<{ [key: number]: Animated.Value }>({});

  const currentCard = mnemonicCards[currentIndex];

  const toggleVerbMeaning = (verbId: string) => {
    setRevealedVerbs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verbId)) {
        newSet.delete(verbId);
      } else {
        newSet.add(verbId);
      }
      return newSet;
    });
  };

  const renderCard = ({ item, index }: { item: MnemonicCard; index: number }) => {
    return (
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={item.colors}
            style={styles.cardHeader}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity style={styles.audioButton}>
              <Volume2 size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.cardContent}>
            <View style={[styles.mnemonicBox, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Text style={[styles.mnemonicText, { color: theme.colors.text }]}>{item.mnemonic}</Text>
            </View>

            <View style={styles.verbsList}>
              <Text style={[styles.verbsListTitle, { color: theme.colors.text }]}>Tap to reveal meanings:</Text>
              {item.verbs.map((verb, verbIndex) => {
                const verbId = `${item.id}-${verbIndex}`;
                const isRevealed = revealedVerbs.has(verbId);
                
                return (
                  <TouchableOpacity
                    key={verbIndex}
                    style={[styles.verbItem, { backgroundColor: isDark ? '#4b5563' : '#f9fafb' }]}
                    onPress={() => toggleVerbMeaning(verbId)}
                  >
                    <View style={styles.verbItemHeader}>
                      <Text style={[styles.verbIgbo, { color: theme.colors.text }]}>{verb.igbo}</Text>
                      <View style={styles.verbItemRight}>
                        <Text style={[styles.verbPronunciation, { color: theme.colors.textSecondary }]}>/{verb.pronunciation}/</Text>
                        {isRevealed ? (
                          <EyeOff size={16} color={theme.colors.textSecondary} />
                        ) : (
                          <Eye size={16} color={theme.colors.textSecondary} />
                        )}
                      </View>
                    </View>
                    {isRevealed && (
                      <Text style={[styles.verbEnglish, { color: theme.colors.textSecondary }]}>"{verb.english}"</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mnemonics</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Swipe to explore memory aids
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mnemonicCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setRevealedVerbs(new Set());
        }}
      >
        <RotateCcw size={20} color="white" />
        <Text style={styles.resetButtonText}>Hide All Meanings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  flatListContent: {
    paddingVertical: 20,
  },
  cardContainer: {
    width: width,
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 400,
  },
  card: {
    width: CARD_WIDTH,
    height: 500,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardHeader: {
    padding: 20,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  audioButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mnemonicBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  mnemonicText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  verbsList: {
    flex: 1,
  },
  verbsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  verbItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verbItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verbItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verbIgbo: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  verbPronunciation: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  verbEnglish: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
});