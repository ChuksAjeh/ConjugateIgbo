import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, ChevronRight } from 'lucide-react-native';
import { rhymeGroups, RhymeGroup } from '@/data/rhymeGroups';
import { createStyles } from './rhymesStyles';

export default function RhymesScreen() {
  const [selectedGroup, setSelectedGroup] = useState<RhymeGroup | null>(null);
  const styles = createStyles();

  const renderRhymeGroup = ({ item }: { item: RhymeGroup }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => setSelectedGroup(item)}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.groupCardGradient}
      >
        <View style={styles.groupHeader}>
          <Music size={24} color="#059669" />
          <Text style={styles.groupTitle}>{item.pattern}</Text>
          <ChevronRight size={20} color="#6b7280" />
        </View>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <Text style={styles.verbCount}>{item.verbs.length} verbs</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderVerbInGroup = ({ item }: { item: any }) => (
    <View style={styles.verbCard}>
      <View style={styles.verbHeader}>
        <Text style={styles.verbInfinitive}>{item.infinitive}</Text>
        <Text style={styles.verbMeaning}>"{item.meaning}"</Text>
      </View>
      <Text style={styles.verbMnemonic}>💡 {item.mnemonic}</Text>
    </View>
  );

  if (selectedGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGroup(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedGroup.pattern}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.groupDetailHeader}>
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.patternBadge}
            >
              <Music size={32} color="#ffffff" />
              <Text style={styles.patternTitle}>{selectedGroup.pattern}</Text>
            </LinearGradient>
            <Text style={styles.patternDescription}>{selectedGroup.description}</Text>
          </View>

          <FlatList
            data={selectedGroup.verbs}
            renderItem={renderVerbInGroup}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.verbsList}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rhyme Groups</Text>
        <Text style={styles.headerSubtitle}>Learn verbs by sound patterns</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Group verbs by similar sounds to make memorization easier. Each group includes helpful mnemonics!
          </Text>
        </View>

        <FlatList
          data={rhymeGroups}
          renderItem={renderRhymeGroup}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.groupsList}
        />
      </ScrollView>
    </SafeAreaView>
  );
}