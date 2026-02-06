import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LOGO_IMAGE, WavePattern, SlantedBox } from './SplashScreen';
import { useTheme } from './ThemeProvider';

const { width } = Dimensions.get('window');

export default function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.waveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.1 : 0.6} />
      </View>
      <View style={styles.waveRight}>
        <WavePattern side="right" opacity={isDark ? 0.1 : 0.6} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />

          <View style={styles.titleContainer}>
            <SlantedBox type="conjugate">
              <Text style={styles.titleText}>WELCOME TO CONJUGATE IGBO!</Text>
            </SlantedBox>
          </View>

          <Text style={styles.tagline}>Your one stop shop to learning Igbo</Text>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardWaveLeft}>
                 <WavePattern side="left" variant="zigzag" color={isDark ? "#888" : "#555"} opacity={0.8} />
              </View>
              <View style={styles.cardWaveRight}>
                 <WavePattern side="right" variant="zigzag" color={isDark ? "#888" : "#555"} opacity={0.8} />
              </View>
              
              <Text style={styles.cardVerbLabel}>To go out</Text>
              <Text style={styles.cardVerbIgbo}>ịpu apu</Text>
              
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>Past</Text>
              </View>
              
              <Text style={styles.cardPronoun}>Anyị (we)</Text>
              <Text style={styles.cardVerbConjugated}>Anyi pu apu</Text>
              
              <Text style={styles.cardFooter}>Tap to continue</Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Practise Igbo verbs:</Text>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>The card shows the verb, tense and pronoun.</Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>Practise saying the correct conjugation.</Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>Tap and see if you got it correct.</Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>4.</Text>
                <Text style={styles.instructionText}>Swipe to move on to the next verb.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onFinish}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  waveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  waveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 25,
  },
  titleText: {
    fontFamily: 'Manjari-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  tagline: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: 'Manjari-Regular',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.9,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: theme.colors.surface,
    width: 240,
    height: 320,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Subtle shadow instead of harsh line
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: theme.colors.border,
  },
  cardWaveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 25,
    opacity: isDark ? 0.1 : 0.2,
  },
  cardWaveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 25,
    opacity: isDark ? 0.1 : 0.2,
  },
  cardVerbLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Manjari-Regular',
  },
  cardVerbIgbo: {
    color: theme.colors.text,
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Manjari-Bold',
  },
  pastBadge: {
    backgroundColor: isDark ? '#333' : '#4A4A4A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  pastBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Manjari-Bold',
  },
  cardPronoun: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Manjari-Regular',
  },
  cardVerbConjugated: {
    color: theme.colors.text,
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Manjari-Bold',
  },
  cardFooter: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    position: 'absolute',
    bottom: 15,
    fontFamily: 'Manjari-Regular',
    opacity: 0.5,
  },
  instructionsContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  instructionsTitle: {
    color: theme.colors.text,
    fontSize: 20,
    marginBottom: 20,
    fontFamily: 'Manjari-Bold',
    textAlign: 'center',
  },
  instructionsList: {
    width: 280,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  instructionNumber: {
    color: theme.colors.primary,
    fontSize: 18,
    width: 25,
    fontFamily: 'Manjari-Bold',
  },
  instructionText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Manjari-Regular',
    flex: 1,
    opacity: 0.9,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    width: 280,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Manjari-Bold',
  },
});
