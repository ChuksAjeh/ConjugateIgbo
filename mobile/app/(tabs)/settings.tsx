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
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Check,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { createStyles } from '@/styles/settingsStyles';
import { showCustomerCenter } from '@/lib/revenuecatUI';
import { WavePattern } from '@/components/SplashScreen';
import * as Sentry from '@sentry/react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { isProUser, restorePurchases, isLoading } = usePurchases();

  const isLockedItem = (locked: boolean) => {
    if (isLoading) return false; // Don't show as locked while loading
    return locked;
  };

  const { theme, isDark } = useTheme();
  const { scheduleDailyReminder, cancelDailyReminder } = useNotifications();
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
  const [showTimePicker, setShowTimePicker] = useState(false);

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


  const handleContactUs = async () => {
    const email = 'support@3lt.dev';
    const subject = 'ConjugateIgbo Support';
    const body =
      `Hi ConjugateIgbo team,\n\n` +
      `I need help with:\n\n` +
      `---\n` +
      `App version: 1.0.0\n` +
      `Platform: ${Platform.OS}\n`;

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Android's Linking.canOpenURL returns false for mailto unless the app
    // declares a package-visibility queries intent. Call openURL directly
    // and surface the email address if the OS cannot resolve a handler.
    try {
      await Linking.openURL(mailto);
    } catch (error: any) {
      Sentry.logger.error(error);
      Alert.alert(
        'No Mail App Found',
        `Please send an email to ${email} for support.`,
        [{ text: 'OK' }],
      );
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

  // Convert tempTime string ("HH:MM") to Date object for the picker
  const getTimeAsDate = (): Date => {
    const [hours, minutes] = tempTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  };

  // Handle time picker change
  const handleTimePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker is dismissed after selection
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setTempTime(timeString);
    }
  };

  // Format time for display (e.g., "09:30" -> "9:30 AM")
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSaveReminder = async () => {
    // Update settings
    updateSettings({
      notifications: {
        ...settings.notifications,
        reminderTime: tempTime,
      },
    });

    // Schedule the notification if reminders are enabled
    if (settings.notifications.daily) {
      await scheduleDailyReminder(tempTime);
    }

    setShowReminderModal(false);
  };

  const handleToggleReminder = async (value: boolean) => {
    updateSettings({
      notifications: { ...settings.notifications, daily: value },
    });

    if (value) {
      // Schedule notification when enabled
      await scheduleDailyReminder(settings.notifications.reminderTime);
    } else {
      // Cancel when disabled
      await cancelDailyReminder();
    }
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

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
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
            onPress={() => router.push('/verb-filters')}
          />

        </SettingsSection>

        {/* Feedback */}
        <SettingsSection title="Feedback">
          <SettingsItem title="Contact us" onPress={handleContactUs} />
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
          <Text style={styles.appInfoTitle}>ConjugateIgbo</Text>
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
        onRequestClose={() => setShowReminderModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowReminderModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Daily Reminders</Text>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.reminderToggleContainer}>
              <Text style={styles.reminderToggleLabel}>
                Enable Daily Reminders
              </Text>
              <Switch
                value={settings.notifications.daily}
                onValueChange={handleToggleReminder}
                trackColor={{ false: '#f3f4f6', true: '#F3703E' }}
                thumbColor="#ffffff"
              />
            </View>

            {settings.notifications.daily && (
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>Reminder Time</Text>
                
                {/* Time Display Button - Tap to open picker */}
                <TouchableOpacity
                  style={styles.timeDisplayButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeDisplayText}>
                    {formatTimeForDisplay(tempTime)}
                  </Text>
                  <Text style={styles.timeDisplayHint}>Tap to change</Text>
                </TouchableOpacity>

                {/* Native Time Picker */}
                {showTimePicker && (
                  <View style={styles.dateTimePickerWrapper}>
                    <DateTimePicker
                      value={getTimeAsDate()}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleTimePickerChange}
                      themeVariant={isDark ? 'dark' : 'light'}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <Text style={styles.reminderHint}>
                  You will receive a daily notification at {formatTimeForDisplay(tempTime)} to practice conjugating Igbo!
                </Text>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveReminder}
                >
                  <Text style={styles.saveButtonText}>Save Reminder</Text>
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
        onRequestClose={() => setShowGoalModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowGoalModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Daily Goal</Text>
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
        onRequestClose={() => setShowAppearanceModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowAppearanceModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Appearance</Text>
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
            ].map((appearance) => {
              const isSelected = settings.appearance === appearance.key;
              return (
                <TouchableOpacity
                  key={appearance.key}
                  style={styles.appearanceOption}
                  onPress={() => {
                    updateSettings({ appearance: appearance.key as any });
                    setShowAppearanceModal(false);
                  }}
                >
                  <View style={styles.appearanceOptionLeft}>
                    <View style={styles.appearanceIcon}>
                      <appearance.icon size={20} color="#6b7280" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.appearanceLabel,
                          isSelected && styles.selectedOptionText,
                        ]}
                      >
                        {appearance.label}
                      </Text>
                      <Text style={styles.appearanceDescription}>
                        {appearance.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color="#F3703E" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Display Mode Modal */}
      <Modal
        visible={showDisplayModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDisplayModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowDisplayModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Display Mode</Text>
          </View>
          <View style={styles.modalContent}>
            {(
              ['Verb and translation', 'Only translation', 'Only verb'] as const
            ).map((mode) => {
              const isSelected = settings.displayMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={styles.optionItem}
                  onPress={() => {
                    updateSettings({ displayMode: mode });
                    setShowDisplayModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {mode}
                  </Text>
                  {isSelected && <Check size={20} color="#F3703E" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Dialect Modal */}
      <Modal
        visible={showDialectModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDialectModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>

          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowDialectModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Select dialect</Text>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {[
              {
                key: 'delta',
                label: 'Delta Igbo',
                description: '',
                disabled: false,
              },
              {
                key: 'central',
                label: 'Central Igbo',
                description: 'COMING SOON',
                disabled: true,
              },
              {
                key: 'anambra',
                label: 'Anambra Igbo',
                description: 'COMING SOON',
                disabled: true,
              },
              {
                key: 'imo',
                label: 'Imo Igbo',
                description: 'COMING SOON',
                disabled: true,
              },
              {
                key: 'abia',
                label: 'Abia Igbo',
                description: 'COMING SOON',
                disabled: true,
              },
            ].map((dialect) => {
              const isSelected = settings.dialect === dialect.key;
              return (
                <TouchableOpacity
                  key={dialect.key}
                  disabled={dialect.disabled}
                  style={[
                    styles.dialectOption,
                    isSelected && styles.selectedDialectOption,
                    dialect.disabled && { opacity: 0.4 },
                  ]}
                  onPress={() => {
                    if (dialect.disabled) return;
                    updateSettings({ dialect: dialect.key as any });
                    setShowDialectModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dialectLabel,
                        isSelected && styles.selectedDialectLabel,
                      ]}
                    >
                      {dialect.label}
                    </Text>
                    {!!dialect.description && (
                      <Text
                        style={[
                          styles.dialectDescription,
                          isSelected && styles.selectedDialectDescription,
                        ]}
                      >
                        {dialect.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && <Check size={20} color="#F3703E" />}
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
        onRequestClose={() => setShowTensesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowTensesModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Tenses</Text>
          </View>
          <ScrollView style={styles.modalContent}>
            {(
              [
                {
                  heading: 'Easy — Free',
                  items: [
                    { key: 'present', title: 'Present' },
                    { key: 'past', title: 'Past' },
                    { key: 'future', title: 'Future' },
                  ],
                  proLocked: false,
                },
                {
                  heading: 'Pro — Aspect',
                  items: [
                    { key: 'presentPerfect', title: 'Present Perfect' },
                    { key: 'habitualPresent', title: 'Habitual Present' },
                  ],
                  proLocked: true,
                },
                {
                  heading: 'Pro — Mood',
                  items: [
                    { key: 'imperative', title: 'Imperative' },
                  ],
                  proLocked: true,
                },
                {
                  heading: 'Pro — Negation',
                  items: [
                    { key: 'negativePast', title: 'Negative Past' },
                    { key: 'negativeFuture', title: 'Negative Future' },
                    { key: 'negativeImperative', title: 'Negative Imperative' },
                    { key: 'negativePerfect', title: 'Negative Perfect' },
                    { key: 'neverPerfect', title: 'Never Perfect' },
                  ],
                  proLocked: true,
                },
                {
                  heading: 'Pro — Derivational Suffixes',
                  items: [
                    { key: 'finished', title: 'Finished (-si)' },
                    { key: 'together', title: 'Together (-kota)' },
                    { key: 'first', title: 'First (-gode)' },
                    { key: 'polite', title: 'Polite (-nụ́)' },
                  ],
                  proLocked: true,
                },
              ] as const
            ).map((group) => (
              <View key={group.heading}>
                <Text style={styles.subSectionTitle}>{group.heading}</Text>
                {group.items.map((item) => (
                  <ToggleItem
                    key={item.key}
                    title={item.title}
                    value={
                      settings.enabledTenses[
                        item.key as keyof typeof settings.enabledTenses
                      ]
                    }
                    onValueChange={(value) =>
                      updateSettings({
                        enabledTenses: {
                          ...settings.enabledTenses,
                          [item.key]: value,
                        },
                      })
                    }
                    isLocked={group.proLocked ? isLockedItem(!isProUser) : false}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Answers Modal */}
      <Modal
        visible={showAnswersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnswersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalWaveLeft}>
            <WavePattern side="left" />
          </View>
          <View style={styles.modalWaveRight}>
            <WavePattern side="right" />
          </View>
          <View style={[styles.modalOrangeHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.modalHeaderBackButton}
              onPress={() => setShowAnswersModal(false)}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Answers</Text>
          </View>
          <View style={styles.modalContent}>
            <SettingsItem
              title="Daily Goal"
              subtitle={
                !isLoading && isProUser
                  ? `${settings.dailyGoal} verbs per day`
                  : '100 verbs per day (Pro required to change)'
              }
              onPress={
                !isLoading && isProUser
                  ? () => setShowGoalModal(true)
                  : undefined
              }
              isLocked={isLockedItem(!isProUser)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
