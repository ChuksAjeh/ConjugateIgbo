import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSettings } from '@/hooks/useSettings';
import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from '@/styles/settingsStyles';
import { WavePattern } from '@/components/SplashScreen';
import { Pronoun } from '@/models/verb';
import { pronounLabels, pronouns } from '@/models/interfaces';

export default function VerbFiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { isProUser } = usePurchases();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const verbLimitOptions: (100 | 250 | 500 | 1000)[] = [100, 250, 500, 1000];

  const handleTogglePronoun = (pronoun: Pronoun) => {
    const newEnabledPronouns = { ...settings.enabledPronouns };
    newEnabledPronouns[pronoun] = !newEnabledPronouns[pronoun];

    // Ensure at least one pronoun is enabled
    const anyEnabled = Object.values(newEnabledPronouns).some((val) => val);
    if (anyEnabled) {
      updateSettings({ enabledPronouns: newEnabledPronouns });
    }
  };

  const handleSetVerbLimit = (limit: 100 | 250 | 500 | 1000) => {
    if (limit === 100 || isProUser) {
      updateSettings({ verbLimit: limit });
    } else {
      router.push('/pro');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgWaveLeft}>
        <WavePattern side="left" opacity={isDark ? 0.15 : 0.2} />
      </View>
      <View style={styles.bgWaveRight}>
        <WavePattern side="right" opacity={isDark ? 0.15 : 0.2} />
      </View>

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verb Filters</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Number of Verbs</Text>
        <View style={styles.sectionContent}>
          {verbLimitOptions.map((limit) => {
            const isLocked = limit > 100 && !isProUser;
            const isSelected = settings.verbLimit === limit;

            return (
              <TouchableOpacity
                key={limit}
                style={[
                  styles.settingsItem,
                  isSelected && { borderBottomColor: '#F3703E' },
                ]}
                onPress={() => handleSetVerbLimit(limit)}
              >
                <View style={styles.settingsItemLeft}>
                  <Text
                    style={[
                      styles.settingsItemTitle,
                      isSelected && {
                        color: '#F3703E',
                        fontFamily: 'Manjari-Bold',
                      },
                    ]}
                  >
                    Top {limit} Verbs
                  </Text>
                  {isLocked && <Text style={styles.proLabel}>PRO</Text>}
                </View>
                {isSelected && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#F3703E',
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Practice Pronouns
        </Text>
        <View style={styles.sectionContent}>
          {pronouns.map((pronoun) => (
            <View key={pronoun} style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemTitle}>
                  {pronounLabels[pronoun]}
                </Text>
              </View>
              <Switch
                value={settings.enabledPronouns[pronoun]}
                onValueChange={() => handleTogglePronoun(pronoun)}
                trackColor={{ false: '#f3f4f6', true: '#F3703E' }}
                thumbColor="#ffffff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
