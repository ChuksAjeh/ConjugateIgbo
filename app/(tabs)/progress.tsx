import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Target, TrendingUp, Clock, Flame, Award } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { createStyles } from './progressStyles';

export default function ProgressScreen() {
  const { stats, progress, getDueReviews, getReviewsForToday, settings } = useAppStore();
  const styles = createStyles();

  const dueReviews = getDueReviews();
  const todayReviews = getReviewsForToday();

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    gradientColors 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    gradientColors: string[];
  }) => (
    <LinearGradient colors={gradientColors} style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Icon size={24} color="#ffffff" />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );

  const AspectProgressBar = ({ 
    aspect, 
    progress, 
    color 
  }: { 
    aspect: string; 
    progress: number; 
    color: string; 
  }) => (
    <View style={styles.aspectProgressContainer}>
      <View style={styles.aspectProgressHeader}>
        <Text style={styles.aspectProgressLabel}>
          {aspect.charAt(0).toUpperCase() + aspect.slice(1)}
        </Text>
        <Text style={styles.aspectProgressPercentage}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View style={styles.aspectProgressTrack}>
        <View 
          style={[
            styles.aspectProgressFill, 
            { width: `${progress * 100}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Track your Igbo learning journey</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Due Reviews"
              value={dueReviews.length}
              subtitle="verbs to practice"
              icon={Target}
              gradientColors={['#ef4444', '#dc2626']}
            />
            <StatCard
              title="Completed"
              value={todayReviews.length}
              subtitle="verbs practiced"
              icon={Award}
              gradientColors={['#10b981', '#059669']}
            />
          </View>
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Practiced"
              value={stats.totalPracticed}
              subtitle="verb attempts"
              icon={TrendingUp}
              gradientColors={['#3b82f6', '#2563eb']}
            />
            <StatCard
              title="Current Streak"
              value={stats.currentStreak}
              subtitle="days in a row"
              icon={Flame}
              gradientColors={['#f59e0b', '#d97706']}
            />
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.weeklyProgressChart}>
              {stats.weeklyProgress.map((day, index) => (
                <View key={index} style={styles.weeklyProgressDay}>
                  <View style={styles.weeklyProgressBar}>
                    <View 
                      style={[
                        styles.weeklyProgressFill,
                        { 
                          height: `${Math.min((day.count / 20) * 100, 100)}%`,
                          backgroundColor: day.count > 0 ? '#059669' : '#e5e7eb'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weeklyProgressLabel}>{day.day}</Text>
                  <Text style={styles.weeklyProgressValue}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Aspect Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aspect Strengths</Text>
          <View style={styles.aspectProgressSection}>
            <AspectProgressBar 
              aspect="imperfective" 
              progress={stats.aspectStrengths.imperfective}
              color="#3b82f6"
            />
            <AspectProgressBar 
              aspect="perfective" 
              progress={stats.aspectStrengths.perfective}
              color="#10b981"
            />
            <AspectProgressBar 
              aspect="progressive" 
              progress={stats.aspectStrengths.progressive}
              color="#f59e0b"
            />
            <AspectProgressBar 
              aspect="habitual" 
              progress={stats.aspectStrengths.habitual}
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <Calendar size={20} color="#059669" />
              <Text style={styles.goalTitle}>Daily Practice Goal</Text>
            </View>
            <Text style={styles.goalDescription}>
              Practice {settings.dailyGoal} verbs every day
            </Text>
            <View style={styles.goalProgressContainer}>
              <View style={styles.goalProgressTrack}>
                <View 
                  style={[
                    styles.goalProgressFill,
                    { 
                      width: `${Math.min((todayReviews.length / settings.dailyGoal) * 100, 100)}%`,
                      backgroundColor: '#059669'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.goalProgressText}>
                {todayReviews.length} / {settings.dailyGoal}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            <View style={[
              styles.achievementBadge,
              stats.currentStreak >= 7 && styles.achievementBadgeUnlocked
            ]}>
              <Flame size={24} color={stats.currentStreak >= 7 ? '#f59e0b' : '#d1d5db'} />
              <Text style={[
                styles.achievementText,
                stats.currentStreak >= 7 && styles.achievementTextUnlocked
              ]}>
                Week Warrior
              </Text>
              <Text style={styles.achievementDescription}>
                7 day streak
              </Text>
            </View>
            
            <View style={[
              styles.achievementBadge,
              stats.totalPracticed >= 100 && styles.achievementBadgeUnlocked
            ]}>
              <Target size={24} color={stats.totalPracticed >= 100 ? '#10b981' : '#d1d5db'} />
              <Text style={[
                styles.achievementText,
                stats.totalPracticed >= 100 && styles.achievementTextUnlocked
              ]}>
                Century Club
              </Text>
              <Text style={styles.achievementDescription}>
                100 practices
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}