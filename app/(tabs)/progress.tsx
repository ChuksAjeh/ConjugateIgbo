import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react-native';
import { useProgress } from '@/hooks/useProgress';
import { useTheme } from '@/components/ThemeProvider';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { progress, statistics } = useProgress();
  const { theme, isDark } = useTheme();

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    gradientColors 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    gradientColors: string[];
  }) => (
    <LinearGradient colors={gradientColors} style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Icon size={24} color="white" />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );

  const ProgressBar = ({ 
    label, 
    progress, 
    color 
  }: { 
    label: string; 
    progress: number; 
    color: string; 
  }) => (
    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.progressBarHeader}>
        <Text style={[styles.progressBarLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.progressBarPercentage, { color: theme.colors.textSecondary }]}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${progress * 100}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1f2937', '#111827'] : ['#f59e0b', '#d97706']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Keep up the great work!</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Overview */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Practice"
            value={statistics.totalPracticed}
            subtitle="verbs practiced"
            icon={Target}
            color="#3b82f6"
            gradientColors={['#3b82f6', '#1d4ed8']}
          />
          

          <StatCard
            title="Current Streak"
            value={statistics.currentStreak}
            subtitle="days in a row"
            icon={TrendingUp}
            color="#8b5cf6"
            gradientColors={['#8b5cf6', '#7c3aed']}
          />

          <StatCard
            title="Study Time"
            value={`${Math.round(statistics.totalStudyTime)}h`}
            subtitle="total time"
            icon={Clock}
            color="#f59e0b"
            gradientColors={['#f59e0b', '#d97706']}
          />
        </View>

        {/* Progress by Tense */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Progress by Tense</Text>
          <View style={styles.progressSection}>
            <ProgressBar 
              label="Present Tense" 
              progress={statistics.tenseProgress.present}
              color="#3b82f6"
            />
            <ProgressBar 
              label="Past Tense" 
              progress={statistics.tenseProgress.past}
              color="#10b981"
            />
            <ProgressBar 
              label="Future Tense" 
              progress={statistics.tenseProgress.future}
              color="#f59e0b"
            />
            <ProgressBar 
              label="Subjunctive" 
              progress={statistics.tenseProgress.subjunctive}
              color="#8b5cf6"
            />
          </View>
        </View>


        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week's Activity</Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.chartBars}>
              {statistics.weeklyProgress.map((day, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={[styles.chartBar, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                    <View 
                      style={[
                        styles.chartBarFill,
                        { 
                          height: `${(day.practiced / 10) * 100}%`,
                          backgroundColor: day.practiced > 0 ? '#3b82f6' : '#e5e7eb'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.chartBarLabel, { color: theme.colors.textSecondary }]}>{day.day}</Text>
                  <Text style={[styles.chartBarValue, { color: theme.colors.textSecondary }]}>{day.practiced}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Study Goals */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Study Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={[styles.goalItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.goalHeader}>
                <Calendar size={20} color="#3b82f6" />
                <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Daily Practice</Text>
              </View>
              <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>Practice 10 verbs every day</Text>
              <ProgressBar 
                label={`${statistics.dailyGoalProgress}/10 verbs today`}
                progress={statistics.dailyGoalProgress / 10}
                color="#3b82f6"
              />
            </View>

            <View style={[styles.goalItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.goalHeader}>
                <Target size={20} color="#10b981" />
                <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Weekly Streak</Text>
              </View>
              <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>Keep your daily practice streak going</Text>
              <ProgressBar 
                label={`${statistics.currentStreak} days streak`}
                progress={Math.min(statistics.currentStreak / 7, 1)}
                color="#10b981"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statCardValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressSection: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBarContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarPercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  chartBarLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  chartBarValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  goalsContainer: {
    gap: 16,
  },
  goalItem: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
});