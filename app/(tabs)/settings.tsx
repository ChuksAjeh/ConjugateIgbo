import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Moon, 
  Sun, 
  Bell, 
  Clock, 
  Target, 
  Volume2, 
  Type, 
  Eye, 
  Star, 
  RefreshCw, 
  MessageCircle, 
  ChevronRight,
  X,
  Lock,
  Globe,
  ShoppingBag
} from 'lucide-react-native';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { isProUser, restorePurchases, isLoading } = usePurchases();
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showDialectModal, setShowDialectModal] = useState(false);

  const handleRestorePurchases = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Purchases Restored!',
          'Your Pro features have been restored successfully.',
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleResetRatings = () => {
    Alert.alert(
      'Reset Ratings',
      'Are you sure you want to reset all verb ratings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All ratings have been reset.');
          }
        },
      ]
    );
  };

  const handleContactUs = () => {
    Alert.alert('Contact Us', 'This would open a contact form or email client.');
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    isLocked = false
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isLocked?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingsItem, isLocked && styles.lockedItem]} 
      onPress={onPress}
      disabled={!onPress || isLocked}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsItemIcon, isLocked && styles.lockedIcon]}>
          {isLocked ? <Lock size={16} color="#9ca3af" /> : <Icon size={20} color="#6b7280" />}
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.settingsItemTitle, isLocked && styles.lockedText]}>{title}</Text>
            {isLocked && <Text style={styles.proLabel}>PRO</Text>}
          </View>
          {subtitle && <Text style={[styles.settingsItemSubtitle, isLocked && styles.lockedText]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {onPress && !isLocked && <ChevronRight size={20} color="#9ca3af" />}
      </View>
    </TouchableOpacity>
  );

  const ToggleItem = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onValueChange,
    isLocked = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLocked?: boolean;
  }) => (
    <SettingsItem
      icon={Icon}
      title={title}
      subtitle={subtitle}
      isLocked={isLocked}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#ffffff'}
          disabled={isLocked}
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your learning experience</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General */}
        <SettingsSection title="General">
          <SettingsItem
            icon={Globe}
            title="Dialect"
            subtitle={`Currently: ${settings.dialect.charAt(0).toUpperCase() + settings.dialect.slice(1)} Igbo`}
            onPress={() => setShowDialectModal(true)}
          />
          
          <SettingsItem
            icon={Moon}
            title="Appearance"
            subtitle={`Currently: ${settings.appearance}`}
            onPress={() => {
              Alert.alert('Coming Soon', 'Appearance settings will be available in a future update.');
            }}
          />
          
          <ToggleItem
            icon={Bell}
            title="Daily Reminder"
            subtitle="Get reminded to practice daily"
            value={settings.notifications.daily}
            onValueChange={(value) => 
              updateSettings({ 
                notifications: { ...settings.notifications, daily: value }
              })
            }
          />

          <SettingsItem
            icon={Clock}
            title="Reminder Time"
            subtitle="Set when to receive reminders"
            onPress={() => setShowTimeModal(true)}
          />
        </SettingsSection>

        {/* Practice */}
        <SettingsSection title="Practice">
          <Text style={styles.subSectionTitle}>Indicative Tenses</Text>
          
          <ToggleItem
            icon={Target}
            title="Present"
            value={settings.enabledTenses.present}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, present: value }
              })
            }
          />
          
          <ToggleItem
            icon={Target}
            title="Past"
            value={settings.enabledTenses.past}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, past: value }
              })
            }
          />

          <ToggleItem
            icon={Target}
            title="Imperfect"
            value={settings.enabledTenses.imperfect}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, imperfect: value }
              })
            }
            isLocked={!isProUser}
          />

          <ToggleItem
            icon={Target}
            title="Conditional"
            value={settings.enabledTenses.conditional}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, conditional: value }
              })
            }
            isLocked={!isProUser}
          />

          <ToggleItem
            icon={Target}
            title="Future"
            value={settings.enabledTenses.future}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, future: value }
              })
            }
            isLocked={!isProUser}
          />

          <Text style={styles.subSectionTitle}>Other Tenses</Text>

          <ToggleItem
            icon={Target}
            title="Subjunctive"
            value={settings.enabledTenses.subjunctive}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, subjunctive: value }
              })
            }
            isLocked={!isProUser}
          />

          <ToggleItem
            icon={Target}
            title="Imperative"
            value={settings.enabledTenses.imperative}
            onValueChange={(value) => 
              updateSettings({ 
                enabledTenses: { ...settings.enabledTenses, imperative: value }
              })
            }
            isLocked={!isProUser}
          />

          <Text style={styles.subSectionTitle}>Translation and Infinitives</Text>

          <SettingsItem
            icon={Eye}
            title="Display Before Revealing"
            subtitle={`Currently: ${settings.displayMode}`}
            onPress={() => setShowDisplayModal(true)}
          />

          <Text style={styles.subSectionTitle}>Answers</Text>

          <ToggleItem
            icon={Volume2}
            title="Auto Pronounce Answers"
            subtitle="Play audio when answer is revealed"
            value={settings.autoPronounce}
            onValueChange={(value) => updateSettings({ autoPronounce: value })}
          />

          <SettingsItem
            icon={Target}
            title="Daily Goal"
            subtitle={`${settings.dailyGoal} verbs per day`}
            onPress={() => setShowGoalModal(true)}
          />

          <ToggleItem
            icon={Type}
            title="Answer by Typing"
            subtitle="Type answers instead of tap to reveal"
            value={settings.typingMode}
            onValueChange={(value) => updateSettings({ typingMode: value })}
          />

          <ToggleItem
            icon={Eye}
            title="Highlight Mistakes"
            subtitle="Show incorrect parts in red"
            value={settings.highlightMistakes}
            onValueChange={(value) => updateSettings({ highlightMistakes: value })}
          />

          <ToggleItem
            icon={Star}
            title="Rate Answers"
            subtitle="Rate how well you know each verb"
            value={settings.rateAnswers}
            onValueChange={(value) => updateSettings({ rateAnswers: value })}
          />

          <SettingsItem
            icon={RefreshCw}
            title="Reset Ratings"
            subtitle="Clear all verb ratings"
            onPress={handleResetRatings}
          />
        </SettingsSection>

        {/* Feedback */}
        <SettingsSection title="Purchases">
          <SettingsItem
            icon={ShoppingBag}
            title="Restore Purchases"
            subtitle="Restore your Pro features if you reinstalled the app"
            onPress={handleRestorePurchases}
            rightElement={
              isLoading ? <ActivityIndicator size="small" color="#6b7280" /> : null
            }
          />
        </SettingsSection>

        <SettingsSection title="Feedback">
          <SettingsItem
            icon={MessageCircle}
            title="Contact Us"
            subtitle="Send feedback or get help"
            onPress={handleContactUs}
          />
        </SettingsSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Igbo Verb Conjugation</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoDescription}>
            Learn Igbo verb conjugations with interactive practice exercises.
          </Text>
        </View>
      </ScrollView>

      {/* Time Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reminder Time</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Time picker would go here</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Goal</Text>
            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Goal picker would go here</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Display Mode Modal */}
      <Modal
        visible={showDisplayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Display Mode</Text>
            <TouchableOpacity onPress={() => setShowDisplayModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {['Verb and translation', 'Only translation', 'Only verb'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionItem,
                  settings.displayMode === mode && styles.selectedOption
                ]}
                onPress={() => {
                  updateSettings({ displayMode: mode });
                  setShowDisplayModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  settings.displayMode === mode && styles.selectedOptionText
                ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Dialect Modal */}
      <Modal
        visible={showDialectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Dialect</Text>
            <TouchableOpacity onPress={() => setShowDialectModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {[
              { key: 'central', label: 'Central Igbo', description: 'Standard Igbo (Owerri/Umuahia)' },
              { key: 'delta', label: 'Delta Igbo', description: 'Western Igbo dialect' },
              { key: 'anambra', label: 'Anambra Igbo', description: 'Northern Igbo dialect' },
              { key: 'imo', label: 'Imo Igbo', description: 'Central-Southern dialect' },
              { key: 'abia', label: 'Abia Igbo', description: 'Eastern dialect' },
            ].map((dialect) => (
              <TouchableOpacity
                key={dialect.key}
                style={[
                  styles.dialectOption,
                  settings.dialect === dialect.key && styles.selectedOption
                ]}
                onPress={() => {
                  updateSettings({ dialect: dialect.key as any });
                  setShowDialectModal(false);
                }}
              >
                <View>
                  <Text style={[
                    styles.dialectLabel,
                    settings.dialect === dialect.key && styles.selectedOptionText
                  ]}>
                    {dialect.label}
                  </Text>
                  <Text style={styles.dialectDescription}>{dialect.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
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
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lockedItem: {
    opacity: 0.6,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lockedIcon: {
    backgroundColor: '#f9fafb',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  lockedText: {
    color: '#9ca3af',
  },
  proLabel: {
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  appInfoDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  optionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  selectedOptionText: {
    color: '#3b82f6',
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  dialectOption: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dialectLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter-SemiBold',
  },
  dialectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
});