import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Lock, Star } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { createStyles } from './proStyles';

export default function ProScreen() {
  const { settings, upgradeToPremium } = useAppStore();
  const styles = createStyles();

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'This would normally trigger the in-app purchase flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => {
            upgradeToPremium();
            Alert.alert('Success!', 'Welcome to ConjugateIgbo Pro!');
          }
        },
      ]
    );
  };

  if (settings.isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#059669', '#047857']}
          style={styles.proHeader}
        >
          <Crown size={48} color="#ffffff" />
          <Text style={styles.proHeaderTitle}>You're Pro!</Text>
          <Text style={styles.proHeaderSubtitle}>All features unlocked</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.proFeaturesContainer}>
            <Text style={styles.proFeaturesTitle}>Pro Features Active</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.featureText}>All dialects unlocked</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.featureText}>1000+ premium verbs</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.featureText}>Advanced progress tracking</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.featureText}>Offline verb packs</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.featureText}>Custom practice sets</Text>
            </View>
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
        {/* Hero Section */}
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          style={styles.heroSection}
        >
          <Crown size={64} color="#ffffff" />
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock all dialects and premium features
          </Text>
        </LinearGradient>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>What's Included</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>All Dialects</Text>
                <Text style={styles.featureDescription}>
                  Access Central, Anambra, and Imo Igbo dialects
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>1000+ Premium Verbs</Text>
                <Text style={styles.featureDescription}>
                  Expand beyond the 100 free verbs with our complete library
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Advanced Stats</Text>
                <Text style={styles.featureDescription}>
                  Detailed progress tracking and performance analytics
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Offline Packs</Text>
                <Text style={styles.featureDescription}>
                  Download verb packs for offline practice
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Star size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Custom Sets</Text>
                <Text style={styles.featureDescription}>
                  Create personalized practice sets and focus areas
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>ConjugateIgbo Pro</Text>
            <Text style={styles.pricingPrice}>$4.99</Text>
            <Text style={styles.pricingPeriod}>One-time purchase</Text>
            <Text style={styles.pricingNote}>No subscriptions!</Text>
            
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Limitations */}
        <View style={styles.limitationsSection}>
          <Text style={styles.limitationsSectionTitle}>Free Version Limitations</Text>
          
          <View style={styles.limitationItem}>
            <Lock size={20} color="#ef4444" />
            <Text style={styles.limitationText}>
              Only Delta Igbo dialect available
            </Text>
          </View>
          
          <View style={styles.limitationItem}>
            <Lock size={20} color="#ef4444" />
            <Text style={styles.limitationText}>
              Limited to 100 basic verbs
            </Text>
          </View>
          
          <View style={styles.limitationItem}>
            <Lock size={20} color="#ef4444" />
            <Text style={styles.limitationText}>
              Basic progress tracking only
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Support Igbo language preservation and learning
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}