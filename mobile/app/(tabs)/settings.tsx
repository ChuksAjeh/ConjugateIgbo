import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Bell,
  Target,
  Volume2,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Globe,
  ShoppingBag,
  Smartphone,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from '@/styles/settingsStyles';
import { showCustomerCenter } from '@/lib/revenuecatUI';
import { WavePattern } from '@/components/SplashScreen';
import * as Sentry from '@sentry/react-native';


export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { isProUser, restorePurchases, isLoading } = usePurchases();

  const isLockedItem = (locked: boolean) => {
    if (isLoading) return false; // Don't show as locked while loading
    return locked;
  };

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showDialectModal, setShowDialectModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showTensesModal, setShowTensesModal] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(settings.dailyGoal.toString());
  const [tempTime, setTempTime] = useState(settings.notifications.reminderTime);

  const handleRestorePurchases = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Purchases Restored!',
          'Your Pro features have been restored successfully.',
          [{ text: 'Great!', style: 'default' }],
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases to restore.",
          [{ text: 'OK', style: 'default' }],
        );
      }
    } catch {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK', style: 'default' }],
      );
    }
  };

  const handleOpenCustomerCenter = async () => {
    try {
      await showCustomerCenter({});
    } catch {
      Alert.alert('Unable to open Customer Center', 'Please try again later.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const getAppearanceLabel = () => {
    switch (settings.appearance) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };


  const handleContactUs = async () => {
    const email = 'ajehworks@gmail.com';
    const subject = 'ConjugateIgbo Support';
    const body =
      `Hi ConjugateIgbo team,\n\n` +
      `I need help with:\n\n` +
      `---\n` +
      `App version: 1.0.0\n` +
      `Platform: ${Platform.OS}\n`;

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert(
          'No Mail App Found',
          `Please send an email to ${email} for support.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error :any) {
      Sentry.logger.error(error);
      Alert.alert('Error', 'An unexpected error occurred while trying to open the mail app.');
    }
  };

  const handleSaveGoal = () => {
    const goalNumber = parseInt(tempGoal);
    if (goalNumber && goalNumber > 0 && goalNumber <= 1000) {
      updateSettings({ dailyGoal: goalNumber });
      setShowGoalModal(false);
    } else {
      Alert.alert('Invalid Goal', 'Please enter a number between 1 and 1000.');
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setTempTime(timeString);
  };

  const handleSaveReminder = () => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        reminderTime: tempTime,
      },
    });
    setShowReminderModal(false);
  };

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsItem = ({
    title,
    subtitle,
    onPress,
    rightElement,
    isLocked = false,
  }: {
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
        <View>
          <View style={styles.titleRow}>
            <Text
              style={[styles.settingsItemTitle, isLocked && styles.lockedText]}
            >
              {title}
            </Text>
            {isLocked && <Text style={styles.proLabel}>PRO</Text>}
          </View>
          {subtitle && (
            <Text
              style={[
                styles.settingsItemSubtitle,
                isLocked && styles.lockedText,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {onPress && !isLocked && <ChevronRight size={20} color="#9ca3af" />}
      </View>
    </TouchableOpacity>
  );

  const ToggleItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    isLocked = false,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLocked?: boolean;
  }) => (
    <SettingsItem
      title={title}
      subtitle={subtitle}
      isLocked={isLocked}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#f3f4f6', true: '#F3703E' }}
          thumbColor="#ffffff"
          disabled={isLocked}
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgWaveLeft}>
        <WavePattern side="left" />
      </View>
      <View style={styles.bgWaveRight}>
        <WavePattern side="right" />
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* GENERAL */}
        <SettingsSection title="GENERAL">
          <SettingsItem
            title="Choose region"
            onPress={() => setShowDialectModal(true)}
          />

          <SettingsItem
            title="Appearance"
            onPress={() => setShowAppearanceModal(true)}
          />

          <SettingsItem
            title="Daily reminder"
            onPress={() => setShowReminderModal(true)}
          />
        </SettingsSection>

        {/* PRACTISE */}
        <SettingsSection title="PRACTISE">
          <SettingsItem
            title="Tenses"
            onPress={() => setShowTensesModal(true)}
          />

          <SettingsItem
            title="Translations & Infinitives"
            onPress={() => setShowDisplayModal(true)}
          />

          <SettingsItem
            title="Answers"
            onPress={() => setShowAnswersModal(true)}
          />

          <SettingsItem
            title="Verb filters"
            onPress={() => Alert.alert('Coming Soon', 'Verb filtering will be available soon.')}
          />

          <SettingsItem
            title="Rhymes"
            onPress={() => Alert.alert('Coming Soon', 'Rhymes practice will be available soon.')}
          />
        </SettingsSection>

        {/* Feedback */}
        <SettingsSection title="Feedback">
          <SettingsItem
            title="Contact us"
            onPress={handleContactUs}
          />
        </SettingsSection>

        {/* Purchases - Keep for functionality but style consistent with new design */}
        <SettingsSection title="Purchases">
          <SettingsItem
            title="Restore Purchases"
            onPress={handleRestorePurchases}
            rightElement={
              isLoading ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : null
            }
          />
          <SettingsItem
            title="Manage Purchases"
            onPress={handleOpenCustomerCenter}
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

      {/* Reminder Modal */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Reminders</Text>
            <TouchableOpacity onPress={() => setShowReminderModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.reminderToggleContainer}>
              <Text style={styles.reminderToggleLabel}>
                Enable Daily Reminders
              </Text>
              <Switch
                value={settings.notifications.daily}
                onValueChange={(value) =>
                  updateSettings({
                    notifications: { ...settings.notifications, daily: value },
                  })
                }
                trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>

            {settings.notifications.daily && (
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>Reminder Time</Text>
                <View style={styles.timePicker}>
                  <View style={styles.timeInputContainer}>
                    <TextInput
                      style={styles.timeInput}
                      value={tempTime.split(':')[0]}
                      onChangeText={(text) => {
                        const hours = parseInt(text) || 0;
                        if (hours >= 0 && hours <= 23) {
                          handleTimeChange(
                            hours,
                            parseInt(tempTime.split(':')[1]) || 0,
                          );
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="HH"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={tempTime.split(':')[1]}
                      onChangeText={(text) => {
                        const minutes = parseInt(text) || 0;
                        if (minutes >= 0 && minutes <= 59) {
                          handleTimeChange(
                            parseInt(tempTime.split(':')[0]) || 0,
                            minutes,
                          );
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="MM"
                    />
                  </View>
                  <Text style={styles.timeFormat}>24-hour format</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveReminder}
                >
                  <Text style={styles.saveButtonText}>Save Time</Text>
                </TouchableOpacity>
              </View>
            )}
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
            <Text style={styles.goalDescription}>
              Set how many verbs you want to practice each day
            </Text>
            <View style={styles.goalInputContainer}>
              <TextInput
                style={styles.goalInput}
                value={tempGoal}
                onChangeText={setTempGoal}
                keyboardType="numeric"
                placeholder="Enter goal (1-1000)"
                maxLength={4}
              />
              <Text style={styles.goalUnit}>verbs per day</Text>
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveGoal}
            >
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Appearance Modal */}
      <Modal
        visible={showAppearanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Appearance</Text>
            <TouchableOpacity onPress={() => setShowAppearanceModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {[
              {
                key: 'light',
                label: 'Light',
                icon: Sun,
                description: 'Always use light theme',
              },
              {
                key: 'dark',
                label: 'Dark',
                icon: Moon,
                description: 'Always use dark theme',
              },
              {
                key: 'system',
                label: 'System',
                icon: Smartphone,
                description: 'Follow device settings',
              },
            ].map((appearance) => (
              <TouchableOpacity
                key={appearance.key}
                style={[
                  styles.appearanceOption,
                  settings.appearance === appearance.key &&
                    styles.selectedOption,
                ]}
                onPress={() => {
                  updateSettings({ appearance: appearance.key as any });
                  setShowAppearanceModal(false);
                }}
              >
                <View style={styles.appearanceOptionLeft}>
                  <View style={styles.appearanceIcon}>
                    <appearance.icon size={20} color="#6b7280" />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.appearanceLabel,
                        settings.appearance === appearance.key &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {appearance.label}
                    </Text>
                    <Text style={styles.appearanceDescription}>
                      {appearance.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
            {(
              ['Verb and translation', 'Only translation', 'Only verb'] as const
            ).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionItem,
                  settings.displayMode === mode && styles.selectedOption,
                ]}
                onPress={() => {
                  updateSettings({ displayMode: mode });
                  setShowDisplayModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.displayMode === mode && styles.selectedOptionText,
                  ]}
                >
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
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.bgWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.bgWaveRight}>
            <WavePattern side="right" />
          </View>

          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => setShowDialectModal(false)}>
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select dialect</Text>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {[
              {
                key: 'central',
                label: 'Central Igbo',
                description: 'STANDARD IGBO (OWERRI/UMUAHIA)',
              },
              {
                key: 'delta',
                label: 'Delta Igbo',
                description: 'WESTERN IGBO DIALECT',
              },
              {
                key: 'anambra',
                label: 'Anambra Igbo',
                description: 'NORTHERN IGBO DIALECT',
              },
              {
                key: 'imo',
                label: 'Imo Igbo',
                description: 'CENTRAL-SOUTHERN DIALECT',
              },
              {
                key: 'abia',
                label: 'Abia Igbo',
                description: 'EASTERN DIALECT',
              },
            ].map((dialect) => {
              const isSelected = settings.dialect === dialect.key;
              return (
                <TouchableOpacity
                  key={dialect.key}
                  style={[
                    styles.dialectOption,
                    isSelected && styles.selectedDialectOption,
                  ]}
                  onPress={() => {
                    updateSettings({ dialect: dialect.key as any });
                    setShowDialectModal(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.dialectLabel,
                        isSelected && styles.selectedDialectLabel,
                      ]}
                    >
                      {dialect.label}
                    </Text>
                    <Text 
                      style={[
                        styles.dialectDescription,
                        isSelected && styles.selectedDialectDescription
                      ]}
                    >
                      {dialect.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tenses Modal */}
      <Modal
        visible={showTensesModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tenses</Text>
            <TouchableOpacity onPress={() => setShowTensesModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.subSectionTitle}>Indicative Tenses</Text>
            <ToggleItem
              title="Present"
              value={settings.enabledTenses.present}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, present: value },
                })
              }
            />
            <ToggleItem
              title="Past"
              value={settings.enabledTenses.past}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, past: value },
                })
              }
            />
            <ToggleItem
              title="Imperfect"
              value={settings.enabledTenses.imperfect}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, imperfect: value },
                })
              }
              isLocked={isLockedItem(!isProUser)}
            />
            <ToggleItem
              title="Conditional"
              value={settings.enabledTenses.conditional}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, conditional: value },
                })
              }
              isLocked={isLockedItem(!isProUser)}
            />
            <ToggleItem
              title="Future"
              value={settings.enabledTenses.future}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, future: value },
                })
              }
              isLocked={isLockedItem(!isProUser)}
            />

            <Text style={styles.subSectionTitle}>Other Tenses</Text>
            <ToggleItem
              title="Subjunctive"
              value={settings.enabledTenses.subjunctive}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, subjunctive: value },
                })
              }
              isLocked={isLockedItem(!isProUser)}
            />
            <ToggleItem
              title="Imperative"
              value={settings.enabledTenses.imperative}
              onValueChange={(value) =>
                updateSettings({
                  enabledTenses: { ...settings.enabledTenses, imperative: value },
                })
              }
              isLocked={isLockedItem(!isProUser)}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Answers Modal */}
      <Modal
        visible={showAnswersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Answers</Text>
            <TouchableOpacity onPress={() => setShowAnswersModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <ToggleItem
              title="Auto Pronounce Answers"
              subtitle="Play audio when answer is revealed"
              value={settings.autoPronounce}
              onValueChange={(value) => updateSettings({ autoPronounce: value })}
            />
            <SettingsItem
              title="Daily Goal"
              subtitle={
                !isLoading && isProUser
                  ? `${settings.dailyGoal} verbs per day`
                  : '100 verbs per day (Pro required to change)'
              }
              onPress={!isLoading && isProUser ? () => setShowGoalModal(true) : undefined}
              isLocked={isLockedItem(!isProUser)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
