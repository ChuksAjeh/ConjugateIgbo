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
import { Calendar, Target, Trophy, TrendingUp, Clock, Star } from 'lucide-react-native';
import { useProgress } from '@/hooks/useProgress';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { progress, statistics } = useProgress();

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
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarHeader}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        <Text style={styles.progressBarPercentage}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.progressBarTrack}>
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
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
            title="Accuracy Rate"
            value={`${Math.round(statistics.accuracyRate * 100)}%`}
            subtitle="correct answers"
            icon={Trophy}
            color="#10b981"
            gradientColors={['#10b981', '#059669']}
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
            value={`${Math.round(statistics.totalStudyTime / 60)}h`}
            subtitle="total time"
            icon={Clock}
            color="#f59e0b"
            gradientColors={['#f59e0b', '#d97706']}
          />
        </View>

        {/* Progress by Tense */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress by Tense</Text>
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

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsContainer}>
            {statistics.recentAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                  <Star size={20} color="white" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Activity</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {statistics.weeklyProgress.map((day, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBar}>
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
                  <Text style={styles.chartBarLabel}>{day.day}</Text>
                  <Text style={styles.chartBarValue}>{day.practiced}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Study Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Calendar size={20} color="#3b82f6" />
                <Text style={styles.goalTitle}>Daily Practice</Text>
              </View>
              <Text style={styles.goalDescription}>Practice 10 verbs every day</Text>
              <ProgressBar 
                label={`${statistics.dailyGoalProgress}/10 verbs today`}
                progress={statistics.dailyGoalProgress / 10}
                color="#3b82f6"
              />
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Target size={20} color="#10b981" />
                <Text style={styles.goalTitle}>Accuracy Goal</Text>
              </View>
              <Text style={styles.goalDescription}>Maintain 80% accuracy rate</Text>
              <ProgressBar 
                label={`${Math.round(statistics.accuracyRate * 100)}% accuracy`}
                progress={statistics.accuracyRate}
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
    width: (width - 52) / 2,
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
    color: '#1f2937',
    marginBottom: 16,
  },
  progressSection: {
    backgroundColor: 'white',
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
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  progressBarPercentage: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chartContainer: {
    backgroundColor: 'white',
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
    backgroundColor: '#f3f4f6',
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
    color: '#6b7280',
    marginBottom: 2,
  },
  chartBarValue: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  goalsContainer: {
    gap: 16,
  },
  goalItem: {
    backgroundColor: 'white',
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
    color: '#1f2937',
    marginLeft: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
});