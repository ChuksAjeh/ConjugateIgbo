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
  const flatListRef = useRef<FlatList>(null);
  const flipAnimations = useRef<{ [key: number]: Animated.Value }>({});

  const currentCard = mnemonicCards[currentIndex];

  const initializeFlipAnimation = (index: number) => {
    if (!flipAnimations.current[index]) {
      flipAnimations.current[index] = new Animated.Value(0);
    }
    return flipAnimations.current[index];
  };

  const handleFlipCard = (index: number) => {
    const flipValue = initializeFlipAnimation(index);
    const isFlipped = flippedCards.has(index);
    
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (isFlipped) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });

    Animated.timing(flipValue, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const navigateToCard = (direction: 'next' | 'prev') => {
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = currentIndex < mnemonicCards.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : mnemonicCards.length - 1;
    }
    
    setCurrentIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const renderCard = ({ item, index }: { item: MnemonicCard; index: number }) => {
    const flipValue = initializeFlipAnimation(index);
    const isFlipped = flippedCards.has(index);

    const frontInterpolate = flipValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    });

    const backOpacity = flipValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleFlipCard(index)}
          style={styles.cardWrapper}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                opacity: frontOpacity,
                transform: [{ rotateY: frontInterpolate }],
              },
            ]}
          >
            <LinearGradient
              colors={item.colors}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.audioButton}>
                  <Volume2 size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              
              <View style={styles.verbsList}>
                {item.verbs.slice(0, 3).map((verb, verbIndex) => (
                  <View key={verbIndex} style={styles.verbItem}>
                    <Text style={styles.verbIgbo}>{verb.igbo}</Text>
                    <Text style={styles.verbEnglish}>({verb.english})</Text>
                  </View>
                ))}
                {item.verbs.length > 3 && (
                  <Text style={styles.moreVerbs}>+{item.verbs.length - 3} more</Text>
                )}
              </View>

              <Text style={styles.tapHint}>Tap to see mnemonic</Text>
            </LinearGradient>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                opacity: backOpacity,
                transform: [{ rotateY: backInterpolate }],
              },
            ]}
          >
            <View style={[styles.cardBackContent, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.mnemonicTitle, { color: theme.colors.text }]}>Memory Aid</Text>
              
              <View style={[styles.mnemonicBox, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                <Text style={[styles.mnemonicText, { color: theme.colors.text }]}>{item.mnemonic}</Text>
              </View>

              <View style={styles.allVerbsList}>
                <Text style={[styles.allverbsTitle, { color: theme.colors.text }]}>All Verbs in This Group:</Text>
                {item.verbs.map((verb, verbIndex) => (
                  <View key={verbIndex} style={[styles.verbDetailItem, { backgroundColor: isDark ? '#4b5563' : '#f9fafb' }]}>
                    <Text style={[styles.verbDetailIgbo, { color: theme.colors.text }]}>{verb.igbo}</Text>
                    <Text style={[styles.verbDetailEnglish, { color: theme.colors.textSecondary }]}>{verb.english}</Text>
                    <Text style={[styles.verbDetailPronunciation, { color: theme.colors.textSecondary }]}>/{verb.pronunciation}/</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.tapBackHint, { color: theme.colors.textSecondary }]}>Tap to flip back</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#5b21b6', '#4c1d95'] : ['#7c3aed', '#5b21b6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mnemonic Flashcards</Text>
        <Text style={styles.headerSubtitle}>
          Card {currentIndex + 1} of {mnemonicCards.length}
        </Text>
      </LinearGradient>

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

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateToCard('prev')}
        >
          <ArrowLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.progressIndicator}>
          {mnemonicCards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                { backgroundColor: isDark ? '#4b5563' : '#d1d5db' },
                index === currentIndex && { backgroundColor: theme.colors.primary },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateToCard('next')}
        >
          <ArrowRight size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setFlippedCards(new Set());
          flipAnimations.current = {};
        }}
      >
        <RotateCcw size={20} color="white" />
        <Text style={styles.resetButtonText}>Reset All Cards</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
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
    width: '100%',
    height: '100%',
    borderRadius: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardGradient: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  verbsList: {
    flex: 1,
    justifyContent: 'center',
  },
  verbItem: {
    marginBottom: 12,
    alignItems: 'center',
  },
  verbIgbo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  verbEnglish: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  moreVerbs: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardBackContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  mnemonicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  mnemonicBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  mnemonicText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  allVerbsList: {
    flex: 1,
  },
  allverbsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  verbDetailItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verbDetailIgbo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verbDetailEnglish: {
    fontSize: 14,
    marginTop: 2,
  },
  verbDetailPronunciation: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tapBackHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressIndicator: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  progressDotActive: {
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
  },
});