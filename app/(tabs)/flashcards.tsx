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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function FlashcardsScreen() {
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
            <View style={styles.cardBackContent}>
              <Text style={styles.mnemonicTitle}>Memory Aid</Text>
              
              <View style={styles.mnemonicBox}>
                <Text style={styles.mnemonicText}>{item.mnemonic}</Text>
              </View>

              <View style={styles.allVerbsList}>
                <Text style={styles.allverbsTitle}>All Verbs in This Group:</Text>
                {item.verbs.map((verb, verbIndex) => (
                  <View key={verbIndex} style={styles.verbDetailItem}>
                    <Text style={styles.verbDetailIgbo}>{verb.igbo}</Text>
                    <Text style={styles.verbDetailEnglish}>{verb.english}</Text>
                    <Text style={styles.verbDetailPronunciation}>/{verb.pronunciation}/</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.tapBackHint}>Tap to flip back</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7c3aed', '#5b21b6']}
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
          style={styles.navButton}
          onPress={() => navigateToCard('prev')}
        >
          <ArrowLeft size={24} color="#7c3aed" />
        </TouchableOpacity>

        <View style={styles.progressIndicator}>
          {mnemonicCards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateToCard('next')}
        >
          <ArrowRight size={24} color="#7c3aed" />
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: 'white',
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
  },
  mnemonicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  mnemonicBox: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  mnemonicText: {
    fontSize: 16,
    color: '#374151',
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
    color: '#374151',
    marginBottom: 12,
  },
  verbDetailItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verbDetailIgbo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  verbDetailEnglish: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  verbDetailPronunciation: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 2,
  },
  tapBackHint: {
    fontSize: 12,
    color: '#9ca3af',
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
    backgroundColor: 'white',
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
    backgroundColor: '#d1d5db',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: '#7c3aed',
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