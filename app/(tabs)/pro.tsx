import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Star, Zap, Book, Volume2 } from 'lucide-react-native';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';

export default function ProScreen() {
  const { theme, isDark } = useTheme();
  const { isProUser, isLoading, purchasePro } = usePurchases();

  const handlePurchase = async () => {
    try {
      const success = await purchasePro();
      if (success) {
        Alert.alert(
          'Purchase Successful!',
          'Welcome to Igbo Verb Conjugation Pro! All features are now unlocked.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          'Something went wrong with your purchase. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Purchase Error',
        'Unable to complete purchase. Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const features = [
    { icon: Book, text: 'Access to 1000+ premium verbs' },
    { icon: Volume2, text: 'High-quality audio pronunciations' },
    { icon: Zap, text: 'All tenses unlocked (Imperfect, Conditional, Future, Subjunctive, Imperative)' },
    { icon: Star, text: 'Advanced practice modes' },
    { icon: Check, text: 'Offline mode for all content' },
    { icon: Crown, text: 'Priority customer support' },
  ];

  // If user is already pro, show a different screen
  if (isProUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={isDark ? ['#059669', '#047857'] : ['#10b981', '#059669']}
            style={styles.header}
          >
            <Crown size={48} color="white" />
            <Text style={styles.headerTitle}>You're Pro!</Text>
            <Text style={styles.headerSubtitle}>
              All features unlocked
            </Text>
          </LinearGradient>

          <View style={[styles.proStatusContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.proStatusTitle, { color: theme.colors.text }]}>Pro Features Active</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Check size={20} color="#10b981" />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.thankYouContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.thankYouText, { color: theme.colors.text }]}>
              Thank you for supporting Igbo language learning! 🎉
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
          <Crown size={32} color={theme.colors.success} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>You're Pro!</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            All features unlocked
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>What you'll get:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
                <feature.icon size={20} color="#f59e0b" />
              </View>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={[styles.pricingCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? '#f59e0b' : '#f59e0b' }]}>
            <Text style={[styles.pricingTitle, { color: theme.colors.text }]}>Pro Version</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.text }]}>£5</Text>
              <Text style={[styles.priceSubtext, { color: theme.colors.textSecondary }]}>one-time purchase</Text>
            </View>
            <TouchableOpacity 
              style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]} 
              onPress={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.purchaseButtonText}>Purchase Pro</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.purchaseText, { color: theme.colors.textSecondary }]}>Lifetime access to all features</Text>
          </View>
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialContainer}>
          <View style={[styles.testimonialCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.testimonialText, { color: theme.colors.text }]}>
            "This app transformed my Igbo learning. The conjugation practice is exactly what I needed!"
            </Text>
            <Text style={[styles.testimonialAuthor, { color: theme.colors.textSecondary }]}>- Sarah, Pro User</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            One-time purchase. Lifetime access. Start learning today!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    paddingVertical: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresContainer: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Inter-Bold',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pricingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  priceSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  purchaseButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  purchaseText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  testimonialContainer: {
    margin: 20,
  },
  testimonialCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  proStatusContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  proStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  thankYouContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});