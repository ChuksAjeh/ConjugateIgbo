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
} from 'react-native';
import {
  Moon,
  Sun,
  Bell,
  Target,
  Volume2,
  Eye,
  MessageCircle,
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
import { createStyles } from './settingsStyles';
import { presentCustomerCenter } from '@/lib/revenuecatUI';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { isProUser, restorePurchases, isLoading } = usePurchases();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showDialectModal, setShowDialectModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
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
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK', style: 'default' }],
      );
    }
  };

  const handleOpenCustomerCenter = async () => {
    try {
      await presentCustomerCenter({});
    } catch (e) {
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

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'This would open a contact form or email client.',
    );
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
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
    isLocked = false,
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
          {isLocked ? (
            <Lock size={16} color="#9ca3af" />
          ) : (
            <Icon size={20} color="#6b7280" />
          )}
        </View>
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
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          Customize your learning experience
        </Text>
      </View>

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
            subtitle={getAppearanceLabel()}
            onPress={() => setShowAppearanceModal(true)}
          />

          <SettingsItem
            icon={Bell}
            title="Daily Reminders"
            subtitle={
              settings.notifications.daily
                ? `Enabled at ${settings.notifications.reminderTime}`
                : 'Disabled'
            }
            onPress={() => setShowReminderModal(true)}
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
                enabledTenses: { ...settings.enabledTenses, present: value },
              })
            }
          />

          <ToggleItem
            icon={Target}
            title="Past"
            value={settings.enabledTenses.past}
            onValueChange={(value) =>
              updateSettings({
                enabledTenses: { ...settings.enabledTenses, past: value },
              })
            }
          />

          <ToggleItem
            icon={Target}
            title="Imperfect"
            value={settings.enabledTenses.imperfect}
            onValueChange={(value) =>
              updateSettings({
                enabledTenses: { ...settings.enabledTenses, imperfect: value },
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
                enabledTenses: {
                  ...settings.enabledTenses,
                  conditional: value,
                },
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
                enabledTenses: { ...settings.enabledTenses, future: value },
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
                enabledTenses: {
                  ...settings.enabledTenses,
                  subjunctive: value,
                },
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
                enabledTenses: { ...settings.enabledTenses, imperative: value },
              })
            }
            isLocked={!isProUser}
          />

          <Text style={styles.subSectionTitle}>
            Translation and Infinitives
          </Text>

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
            subtitle={
              isProUser
                ? `${settings.dailyGoal} verbs per day`
                : '100 verbs per day (Pro required to change)'
            }
            onPress={isProUser ? () => setShowGoalModal(true) : undefined}
            isLocked={!isProUser}
          />
        </SettingsSection>

        {/* Feedback */}
        <SettingsSection title="Purchases">
          <SettingsItem
            icon={ShoppingBag}
            title="Restore Purchases"
            subtitle="Restore Pro features after reinstalling"
            onPress={handleRestorePurchases}
            rightElement={
              isLoading ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : null
            }
          />
          <SettingsItem
            icon={Smartphone}
            title="Manage Purchases"
            subtitle="Open RevenueCat Customer Center"
            onPress={handleOpenCustomerCenter}
          />
        </SettingsSection>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Feedback
          </Text>
          <View
            style={[
              styles.sectionContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon={MessageCircle}
              title="Contact Us"
              subtitle="Send feedback or get help"
              onPress={handleContactUs}
            />
          </View>
        </View>

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
              {
                key: 'central',
                label: 'Central Igbo',
                description: 'Standard Igbo (Owerri/Umuahia)',
              },
              {
                key: 'delta',
                label: 'Delta Igbo',
                description: 'Western Igbo dialect',
              },
              {
                key: 'anambra',
                label: 'Anambra Igbo',
                description: 'Northern Igbo dialect',
              },
              {
                key: 'imo',
                label: 'Imo Igbo',
                description: 'Central-Southern dialect',
              },
              {
                key: 'abia',
                label: 'Abia Igbo',
                description: 'Eastern dialect',
              },
            ].map((dialect) => (
              <TouchableOpacity
                key={dialect.key}
                style={[
                  styles.dialectOption,
                  settings.dialect === dialect.key && styles.selectedOption,
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
                      settings.dialect === dialect.key &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {dialect.label}
                  </Text>
                  <Text style={styles.dialectDescription}>
                    {dialect.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
