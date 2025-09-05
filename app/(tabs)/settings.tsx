import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { Globe, Eye, Type, Target, Volume2, Download, X } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { Dialect, AspectForm } from '@/data/igboVerbs';
import { createStyles } from './settingsStyles';

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppStore();
  const [showDialectModal, setShowDialectModal] = useState(false);
  const [showAspectsModal, setShowAspectsModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const styles = createStyles();

  const dialects: { key: Dialect; label: string; isPremium: boolean }[] = [
    { key: 'delta', label: 'Delta Igbo', isPremium: false },
    { key: 'central', label: 'Central Igbo', isPremium: true },
    { key: 'anambra', label: 'Anambra Igbo', isPremium: true },
    { key: 'imo', label: 'Imo Igbo', isPremium: true },
  ];

  const aspects: { key: AspectForm; label: string; description: string }[] = [
    { key: 'imperfective', label: 'Imperfective', description: 'Ongoing or habitual actions' },
    { key: 'perfective', label: 'Perfective', description: 'Completed actions' },
    { key: 'progressive', label: 'Progressive', description: 'Actions in progress' },
    { key: 'habitual', label: 'Habitual', description: 'Regular or repeated actions' },
  ];

  const dailyGoals = [10, 20, 30, 50, 100];

  const handleDialectChange = (dialect: Dialect) => {
    const dialectInfo = dialects.find(d => d.key === dialect);
    if (dialectInfo?.isPremium && !settings.isPremium) {
      Alert.alert(
        'Premium Feature',
        'This dialect requires ConjugateIgbo Pro. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {/* Navigate to pro screen */} },
        ]
      );
      return;
    }
    
    updateSettings({ selectedDialect: dialect });
    setShowDialectModal(false);
  };

  const handleAspectToggle = (aspect: AspectForm) => {
    const currentAspects = settings.enabledAspects;
    let newAspects: AspectForm[];
    
    if (currentAspects.includes(aspect)) {
      // Don't allow removing if it's the last one
      if (currentAspects.length === 1) {
        Alert.alert('Error', 'At least one aspect must be enabled.');
        return;
      }
      newAspects = currentAspects.filter(a => a !== aspect);
    } else {
      newAspects = [...currentAspects, aspect];
    }
    
    updateSettings({ enabledAspects: newAspects });
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
        <View style={styles.settingsItemIcon}>
          <Icon size={20} color={isLocked ? "#9ca3af" : "#6b7280"} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.settingsItemTitle, isLocked && styles.lockedText]}>
              {title}
            </Text>
            {isLocked && <Text style={styles.proLabel}>PRO</Text>}
          </View>
          {subtitle && (
            <Text style={[styles.settingsItemSubtitle, isLocked && styles.lockedText]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
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
          trackColor={{ false: '#f3f4f6', true: '#059669' }}
          thumbColor="#ffffff"
          disabled={isLocked}
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your learning experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language & Dialect */}
        <SettingsSection title="Language & Dialect">
          <SettingsItem
            icon={Globe}
            title="Dialect"
            subtitle={`Currently: ${dialects.find(d => d.key === settings.selectedDialect)?.label}`}
            onPress={() => setShowDialectModal(true)}
          />
        </SettingsSection>

        {/* Practice Settings */}
        <SettingsSection title="Practice">
          <ToggleItem
            icon={Type}
            title="Type to Answer"
            subtitle="Type answers instead of tap-to-reveal"
            value={settings.typeToAnswer}
            onValueChange={(value) => updateSettings({ typeToAnswer: value })}
          />
          
          <ToggleItem
            icon={Eye}
            title="Show Tone Marks"
            subtitle="Display tone marks in conjugations"
            value={settings.showToneMarks}
            onValueChange={(value) => updateSettings({ showToneMarks: value })}
          />
          
          <ToggleItem
            icon={Volume2}
            title="Include Irregulars"
            subtitle="Include irregular verbs in practice"
            value={settings.includeIrregulars}
            onValueChange={(value) => updateSettings({ includeIrregulars: value })}
          />
          
          <SettingsItem
            icon={Target}
            title="Enabled Aspects"
            subtitle={`${settings.enabledAspects.length} of 4 aspects enabled`}
            onPress={() => setShowAspectsModal(true)}
          />
          
          <SettingsItem
            icon={Target}
            title="Daily Goal"
            subtitle={`${settings.dailyGoal} verbs per day`}
            onPress={() => setShowGoalModal(true)}
          />
        </SettingsSection>

        {/* Premium Features */}
        <SettingsSection title="Premium Features">
          <SettingsItem
            icon={Download}
            title="Offline Packs"
            subtitle="Download verb packs for offline use"
            onPress={() => Alert.alert('Premium Feature', 'Upgrade to Pro to access offline packs.')}
            isLocked={!settings.isPremium}
          />
        </SettingsSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>ConjugateIgbo</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoDescription}>
            Learn Igbo verb conjugations with focus on aspects and dialects.
          </Text>
        </View>
      </ScrollView>

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
          <ScrollView style={styles.modalContent}>
            {dialects.map((dialect) => (
              <TouchableOpacity
                key={dialect.key}
                style={[
                  styles.dialectOption,
                  settings.selectedDialect === dialect.key && styles.selectedOption,
                  dialect.isPremium && !settings.isPremium && styles.lockedOption,
                ]}
                onPress={() => handleDialectChange(dialect.key)}
              >
                <View style={styles.dialectOptionContent}>
                  <Text style={[
                    styles.dialectLabel,
                    settings.selectedDialect === dialect.key && styles.selectedOptionText,
                    dialect.isPremium && !settings.isPremium && styles.lockedText,
                  ]}>
                    {dialect.label}
                  </Text>
                  {dialect.isPremium && !settings.isPremium && (
                    <Text style={styles.proLabel}>PRO</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Aspects Modal */}
      <Modal
        visible={showAspectsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Enabled Aspects</Text>
            <TouchableOpacity onPress={() => setShowAspectsModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose which aspects to include in your practice sessions.
            </Text>
            {aspects.map((aspect) => (
              <TouchableOpacity
                key={aspect.key}
                style={styles.aspectOption}
                onPress={() => handleAspectToggle(aspect.key)}
              >
                <View style={styles.aspectOptionContent}>
                  <View>
                    <Text style={styles.aspectLabel}>{aspect.label}</Text>
                    <Text style={styles.aspectDescription}>{aspect.description}</Text>
                  </View>
                  <Switch
                    value={settings.enabledAspects.includes(aspect.key)}
                    onValueChange={() => handleAspectToggle(aspect.key)}
                    trackColor={{ false: '#f3f4f6', true: '#059669' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Daily Goal Modal */}
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
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Set your daily practice goal.
            </Text>
            {dailyGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  settings.dailyGoal === goal && styles.selectedOption,
                ]}
                onPress={() => {
                  updateSettings({ dailyGoal: goal });
                  setShowGoalModal(false);
                }}
              >
                <Text style={[
                  styles.goalLabel,
                  settings.dailyGoal === goal && styles.selectedOptionText,
                ]}>
                  {goal} verbs per day
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}