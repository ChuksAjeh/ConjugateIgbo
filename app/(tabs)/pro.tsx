import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, X, Star, Zap, Globe, TrendingUp, Download } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { createStyles } from './proStyles';

const { width } = Dimensions.get('window');

export default function ProScreen() {
  const { settings, upgradeToPremium } = useAppStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const styles = createStyles();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    // Simulate purchase flow
    setTimeout(() => {
      upgradeToPremium();
      setIsUpgrading(false);
      Alert.alert(
        '🎉 Welcome to Pro!',
        'All dialects and premium features are now unlocked. Happy learning!',
        [{ text: 'Start Learning!', style: 'default' }]
      );
    }, 2000);
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'This would restore any previous purchases from the App Store.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => console.log('Restore purchases') },
      ]
    );
  };

  // If user is already pro, show success state
  if (settings.isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#059669', '#047857']}
          style={styles.successHeader}
        >
          <View style={styles.successBadge}>
            <Crown size={32} color="#fbbf24" />
          </View>
          <Text style={styles.successTitle}>You're Pro! 🎉</Text>
          <Text style={styles.successSubtitle}>
            All dialects and features unlocked
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.activeFeatures}>
            <Text style={styles.activeFeaturesTitle}>Your Pro Features</Text>
            
            {[
              { icon: Globe, text: 'All 4 Igbo dialects' },
              { icon: Star, text: '1,000+ premium verbs' },
              { icon: TrendingUp, text: 'Advanced progress analytics' },
              { icon: Download, text: 'Offline verb packs' },
            ].map((feature, index) => (
              <View key={index} style={styles.activeFeatureItem}>
                <View style={styles.activeFeatureIcon}>
                  <feature.icon size={20} color="#059669" />
                </View>
                <Text style={styles.activeFeatureText}>{feature.text}</Text>
                <Check size={20} color="#10b981" />
              </View>
            ))}
          </View>

          <View style={styles.thankYouCard}>
            <Text style={styles.thankYouTitle}>Thank you! 🙏</Text>
            <Text style={styles.thankYouText}>
              Your support helps preserve and promote the Igbo language for future generations.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#1e40af', '#1d4ed8']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Crown size={24} color="#fbbf24" />
              <Text style={styles.heroBadgeText}>UPGRADE</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Master All Igbo{'\n'}Dialects
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Unlock the complete Igbo learning experience with all dialects, 1000+ verbs, and advanced features
            </Text>
          </View>
          
          {/* Floating elements for visual interest */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingElement, styles.floatingElement1]}>
              <Text style={styles.floatingEmoji}>🦁</Text>
            </View>
            <View style={[styles.floatingElement, styles.floatingElement2]}>
              <Text style={styles.floatingEmoji}>📚</Text>
            </View>
            <View style={[styles.floatingElement, styles.floatingElement3]}>
              <Text style={styles.floatingEmoji}>🎯</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Current Limitations */}
        <View style={styles.limitationsSection}>
          <Text style={styles.limitationsTitle}>You're Missing Out On:</Text>
          
          <View style={styles.limitationsList}>
            {[
              { icon: Globe, text: 'Central, Anambra & Imo dialects', locked: true },
              { icon: Star, text: '900+ additional premium verbs', locked: true },
              { icon: TrendingUp, text: 'Advanced progress analytics', locked: true },
              { icon: Download, text: 'Offline verb packs', locked: true },
            ].map((limitation, index) => (
              <View key={index} style={styles.limitationItem}>
                <View style={styles.limitationIcon}>
                  <limitation.icon size={20} color="#ef4444" />
                </View>
                <Text style={styles.limitationText}>{limitation.text}</Text>
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>LOCKED</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Feature Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Free vs Pro</Text>
          
          <View style={styles.comparisonTable}>
            {/* Header */}
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHeaderText}>Feature</Text>
              <Text style={styles.comparisonHeaderText}>Free</Text>
              <Text style={styles.comparisonHeaderText}>Pro</Text>
            </View>
            
            {/* Rows */}
            {[
              { feature: 'Delta Igbo dialect', free: true, pro: true },
              { feature: 'Other dialects', free: false, pro: true },
              { feature: 'Basic verbs (100)', free: true, pro: true },
              { feature: 'Premium verbs (1000+)', free: false, pro: true },
              { feature: 'Basic progress', free: true, pro: true },
              { feature: 'Advanced analytics', free: false, pro: true },
              { feature: 'Offline packs', free: false, pro: true },
            ].map((row, index) => (
              <View key={index} style={styles.comparisonRow}>
                <Text style={styles.featureName}>{row.feature}</Text>
                <View style={styles.checkContainer}>
                  {row.free ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                </View>
                <View style={styles.checkContainer}>
                  <Check size={16} color="#10b981" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingCard}>
            <LinearGradient
              colors={['#fbbf24', '#f59e0b']}
              style={styles.pricingBadge}
            >
              <Star size={16} color="#ffffff" />
              <Text style={styles.pricingBadgeText}>BEST VALUE</Text>
            </LinearGradient>
            
            <Text style={styles.pricingTitle}>ConjugateIgbo Pro</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>£</Text>
              <Text style={styles.priceAmount}>5</Text>
              <Text style={styles.pricePeriod}>.00</Text>
            </View>
            
            <Text style={styles.priceDescription}>One-time purchase • No subscriptions</Text>
            
            <View style={styles.priceFeatures}>
              <View style={styles.priceFeatureItem}>
                <Zap size={14} color="#059669" />
                <Text style={styles.priceFeatureText}>Instant access to all features</Text>
              </View>
              <View style={styles.priceFeatureItem}>
                <Crown size={14} color="#059669" />
                <Text style={styles.priceFeatureText}>Lifetime updates included</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.upgradeButton, isUpgrading && styles.upgradeButtonLoading]}
            onPress={handleUpgrade}
            disabled={isUpgrading}
          >
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.upgradeButtonGradient}
            >
              {isUpgrading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.upgradeButtonText}>Processing...</Text>
                </View>
              ) : (
                <>
                  <Crown size={20} color="#ffffff" />
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>Restore Previous Purchase</Text>
          </TouchableOpacity>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProofSection}>
          <Text style={styles.socialProofTitle}>Join 10,000+ Igbo Learners</Text>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "The dialect comparison feature helped me understand the nuances between different Igbo regions. Amazing app!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Chioma O., Lagos</Text>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <View style={styles.trustIcon}>
              <Check size={16} color="#10b981" />
            </View>
            <Text style={styles.trustText}>Secure payment via App Store</Text>
          </View>
          <View style={styles.trustItem}>
            <View style={styles.trustIcon}>
              <Check size={16} color="#10b981" />
            </View>
            <Text style={styles.trustText}>Cancel anytime (no subscription)</Text>
          </View>
          <View style={styles.trustItem}>
            <View style={styles.trustIcon}>
              <Check size={16} color="#10b981" />
            </View>
            <Text style={styles.trustText}>Instant feature activation</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Supporting Igbo language preservation • Made with ❤️ for the Igbo community
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}