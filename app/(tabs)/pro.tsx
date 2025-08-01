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

export default function ProScreen() {
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
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.header}
          >
            <Crown size={48} color="white" />
            <Text style={styles.headerTitle}>You're Pro!</Text>
            <Text style={styles.headerSubtitle}>
              All features unlocked
            </Text>
          </LinearGradient>

          <View style={styles.proStatusContainer}>
            <Text style={styles.proStatusTitle}>Pro Features Active</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Check size={20} color="#10b981" />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.thankYouContainer}>
            <Text style={styles.thankYouText}>
              Thank you for supporting Igbo language learning! 🎉
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#fbbf24', '#f59e0b']}
          style={styles.header}
        >
          <Crown size={48} color="white" />
          <Text style={styles.headerTitle}>Upgrade to Pro</Text>
          <Text style={styles.headerSubtitle}>
            Unlock all tenses and 1000+ verbs
          </Text>
        </LinearGradient>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you'll get:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <feature.icon size={20} color="#f59e0b" />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Pro Version</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>£5</Text>
              <Text style={styles.priceSubtext}>one-time purchase</Text>
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
            </TouchableOpacity>
            <Text style={styles.purchaseText}>Lifetime access to all features</Text>
          </View>
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialContainer}>
          <Text style={styles.testimonialText}>
            "This app transformed my Igbo learning. The conjugation practice is exactly what I needed!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Sarah, Pro User</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  featuresContainer: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  priceSubtext: {
    fontSize: 16,
    color: '#6b7280',
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
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  testimonialContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  proStatusContainer: {
    padding: 20,
  },
  proStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  thankYouContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});