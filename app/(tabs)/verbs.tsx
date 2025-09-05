import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Book, Eye, X, Lock } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { igboVerbs, getVerbById, IgboVerb, AspectForm } from '@/data/igboVerbs';
import { createStyles } from './verbsStyles';

type ViewMode = 'cheat-sheet' | 'conjugation-table';

export default function VerbsScreen() {
  const { settings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cheat-sheet');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');

  const styles = createStyles();

  // Get available verbs based on premium status
  const getAvailableVerbs = () => {
    let verbs = igboVerbs;
    
    // Apply search filter
    if (searchQuery) {
      verbs = verbs.filter(verb =>
        verb.infinitive.toLowerCase().includes(searchQuery.toLowerCase()) ||
        verb.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      verbs = verbs.filter(verb => verb.difficulty === filterDifficulty);
    }
    
    // Apply frequency filter
    if (filterFrequency !== 'all') {
      verbs = verbs.filter(verb => verb.frequency === filterFrequency);
    }
    
    return verbs;
  };

  const renderVerbItem = ({ item }: { item: IgboVerb }) => {
    const isLocked = item.isPremium && !settings.isPremium;
    
    return (
      <TouchableOpacity
        style={[styles.verbCard, isLocked && styles.lockedCard]}
        onPress={() => setSelectedVerb(item)}
      >
        <View style={styles.verbHeader}>
          <View style={styles.verbTitleContainer}>
            <Text style={[styles.verbInfinitive, isLocked && styles.lockedText]}>
              {item.infinitive}
            </Text>
            {isLocked && <Lock size={16} color="#6b7280" />}
          </View>
          <View style={styles.verbBadges}>
            <View style={[styles.difficultyBadge, getDifficultyBadgeStyle(item.difficulty)]}>
              <Text style={styles.badgeText}>{item.difficulty}</Text>
            </View>
            <View style={[styles.frequencyBadge, getFrequencyBadgeStyle(item.frequency)]}>
              <Text style={styles.badgeText}>{item.frequency}</Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.verbMeaning, isLocked && styles.lockedText]}>
          "{item.meaning}"
        </Text>
        
        <Text style={[styles.verbFamily, isLocked && styles.lockedText]}>
          Pattern: {item.patternFamily}
        </Text>
        
        {isLocked && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { backgroundColor: '#dcfce7' };
      case 'intermediate': return { backgroundColor: '#fef3c7' };
      case 'advanced': return { backgroundColor: '#fee2e2' };
      default: return { backgroundColor: '#f3f4f6' };
    }
  };

  const getFrequencyBadgeStyle = (frequency: string) => {
    switch (frequency) {
      case 'high': return { backgroundColor: '#dbeafe' };
      case 'medium': return { backgroundColor: '#f0f9ff' };
      case 'low': return { backgroundColor: '#f8fafc' };
      default: return { backgroundColor: '#f3f4f6' };
    }
  };

  const renderConjugationTable = () => {
    if (!selectedVerb) return null;
    
    const conjugations = selectedVerb.conjugations[settings.selectedDialect];
    const aspects: AspectForm[] = ['imperfective', 'perfective', 'progressive', 'habitual'];
    
    return (
      <ScrollView style={styles.tableContainer}>
        {aspects.map(aspect => (
          <View key={aspect} style={styles.aspectSection}>
            <Text style={styles.aspectTitle}>
              {aspect.charAt(0).toUpperCase() + aspect.slice(1)}
            </Text>
            <View style={styles.conjugationGrid}>
              {conjugations[aspect].map(conjugation => (
                <View key={conjugation.pronoun} style={styles.conjugationRow}>
                  <Text style={styles.pronounCell}>
                    {conjugation.pronoun}
                  </Text>
                  <Text style={styles.conjugationCell}>
                    {settings.showToneMarks ? conjugation.toneMarks : conjugation.form}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderCheatSheet = () => {
    if (!selectedVerb) return null;
    
    const conjugations = selectedVerb.conjugations[settings.selectedDialect];
    const examples = selectedVerb.examples[settings.selectedDialect];
    
    return (
      <ScrollView style={styles.cheatSheetContainer}>
        {/* Quick reference */}
        <View style={styles.quickRefSection}>
          <Text style={styles.sectionTitle}>Quick Reference</Text>
          <View style={styles.quickRefGrid}>
            <View style={styles.quickRefItem}>
              <Text style={styles.quickRefLabel}>Present (I)</Text>
              <Text style={styles.quickRefValue}>
                {settings.showToneMarks 
                  ? conjugations.imperfective[0].toneMarks 
                  : conjugations.imperfective[0].form}
              </Text>
            </View>
            <View style={styles.quickRefItem}>
              <Text style={styles.quickRefLabel}>Past (I)</Text>
              <Text style={styles.quickRefValue}>
                {settings.showToneMarks 
                  ? conjugations.perfective[0].toneMarks 
                  : conjugations.perfective[0].form}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Mnemonic */}
        <View style={styles.mnemonicSection}>
          <Text style={styles.sectionTitle}>Memory Aid</Text>
          <Text style={styles.mnemonicText}>💡 {selectedVerb.mnemonic}</Text>
        </View>
        
        {/* Examples */}
        {examples && examples.length > 0 && (
          <View style={styles.examplesSection}>
            <Text style={styles.sectionTitle}>Examples</Text>
            {examples.map((example, index) => (
              <View key={index} style={styles.exampleItem}>
                <Text style={styles.exampleIgbo}>{example.igbo}</Text>
                <Text style={styles.exampleEnglish}>{example.english}</Text>
                <Text style={styles.exampleAspect}>({example.aspect})</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verb Library</Text>
        <Text style={styles.headerSubtitle}>
          {getAvailableVerbs().length} verbs available
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search verbs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Verbs List */}
      <FlatList
        data={getAvailableVerbs()}
        renderItem={renderVerbItem}
        keyExtractor={(item) => item.id}
        style={styles.verbsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verbsListContent}
      />

      {/* Verb Detail Modal */}
      <Modal
        visible={selectedVerb !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {selectedVerb?.infinitive} - "{selectedVerb?.meaning}"
              </Text>
              <View style={styles.dialectBadge}>
                <Text style={styles.dialectText}>
                  {settings.selectedDialect.charAt(0).toUpperCase() + settings.selectedDialect.slice(1)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedVerb(null)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'cheat-sheet' && styles.viewModeButtonActive
              ]}
              onPress={() => setViewMode('cheat-sheet')}
            >
              <Eye size={16} color={viewMode === 'cheat-sheet' ? '#ffffff' : '#6b7280'} />
              <Text style={[
                styles.viewModeText,
                viewMode === 'cheat-sheet' && styles.viewModeTextActive
              ]}>
                Cheat Sheet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'conjugation-table' && styles.viewModeButtonActive
              ]}
              onPress={() => setViewMode('conjugation-table')}
            >
              <Book size={16} color={viewMode === 'conjugation-table' ? '#ffffff' : '#6b7280'} />
              <Text style={[
                styles.viewModeText,
                viewMode === 'conjugation-table' && styles.viewModeTextActive
              ]}>
                Full Table
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {viewMode === 'cheat-sheet' ? renderCheatSheet() : renderConjugationTable()}
        </SafeAreaView>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Difficulty Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              {['all', 'beginner', 'intermediate', 'advanced'].map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterOption,
                    filterDifficulty === difficulty && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterDifficulty(difficulty)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterDifficulty === difficulty && styles.filterOptionTextActive
                  ]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Frequency Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Frequency</Text>
              {['all', 'high', 'medium', 'low'].map(frequency => (
                <TouchableOpacity
                  key={frequency}
                  style={[
                    styles.filterOption,
                    filterFrequency === frequency && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterFrequency(frequency)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterFrequency === frequency && styles.filterOptionTextActive
                  ]}>
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}