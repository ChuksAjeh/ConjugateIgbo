import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react-native';
import { useProgress } from '@/hooks/useProgress';
import { useTheme } from '@/components/ThemeProvider';
import { createStyles } from './progressStyles';

export default function ProgressScreen() {
  const { progress, statistics } = useProgress();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  type StatCardProps = {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    gradientColors: readonly [string, string]; // Changed from string[]
  };


  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    gradientColors 
  }: StatCardProps) => (
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
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Progress</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Keep up the great work!
        </Text>
      </View>

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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week&apos;s Activity</Text>
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