import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Volume2, X, Book } from 'lucide-react-native';
import { igboVerbs, IgboVerb } from '@/data/igboVerbs';

type FilterType = 'all' | 'common' | 'regular' | 'irregular';
type SortType = 'alphabetical' | 'frequency' | 'difficulty';

export default function VerbsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('alphabetical');
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedVerbs = useMemo(() => {
    let filtered = igboVerbs.filter(verb => {
      const matchesSearch = 
        verb.infinitive.toLowerCase().includes(searchQuery.toLowerCase()) ||
        verb.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'common' && verb.frequency === 'high') ||
        (selectedFilter === 'regular' && verb.type === 'regular') ||
        (selectedFilter === 'irregular' && verb.type === 'irregular');
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.infinitive.localeCompare(b.infinitive);
        case 'frequency':
          const frequencyOrder = { high: 3, medium: 2, low: 1 };
          return frequencyOrder[b.frequency] - frequencyOrder[a.frequency];
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedFilter, sortBy]);

  const renderVerbItem = ({ item }: { item: IgboVerb }) => (
    <TouchableOpacity
      style={styles.verbItem}
      onPress={() => setSelectedVerb(item)}
    >
      <View style={styles.verbItemContent}>
        <View style={styles.verbItemHeader}>
          <Text style={styles.verbInfinitive}>{item.infinitive}</Text>
          <View style={styles.verbBadges}>
            <View style={[styles.badge, getBadgeStyle(item.frequency)]}>
              <Text style={[styles.badgeText, getBadgeTextStyle(item.frequency)]}>
                {item.frequency}
              </Text>
            </View>
            <TouchableOpacity style={styles.audioButton}>
              <Volume2 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.verbMeaning}>"{item.meaning}"</Text>
        
        <View style={styles.verbMeta}>
          <Text style={styles.verbType}>{item.type}</Text>
          <Text style={styles.verbDifficulty}>{item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getBadgeStyle = (frequency: string) => {
    switch (frequency) {
      case 'high': return styles.badgeHigh;
      case 'medium': return styles.badgeMedium;
      case 'low': return styles.badgeLow;
      default: return styles.badgeMedium;
    }
  };

  const getBadgeTextStyle = (frequency: string) => {
    switch (frequency) {
      case 'high': return styles.badgeTextHigh;
      case 'medium': return styles.badgeTextMedium;
      case 'low': return styles.badgeTextLow;
      default: return styles.badgeTextMedium;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Igbo Verbs Dictionary</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAndSortedVerbs.length} verbs
        </Text>
      </LinearGradient>

      {/* Search and Filter Bar */}
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

      {/* Filter Summary */}
      {(selectedFilter !== 'all' || sortBy !== 'alphabetical') && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>
            {selectedFilter !== 'all' && `Filter: ${selectedFilter} • `}
            Sort: {sortBy}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter('all');
              setSortBy('alphabetical');
            }}
          >
            <Text style={styles.clearFilters}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Verbs List */}
      <FlatList
        data={filteredAndSortedVerbs}
        renderItem={renderVerbItem}
        keyExtractor={(item) => item.id}
        style={styles.verbsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters & Sorting</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Filter Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filter by</Text>
              {[
                { key: 'all', label: 'All Verbs' },
                { key: 'common', label: 'Common Verbs' },
                { key: 'regular', label: 'Regular Verbs' },
                { key: 'irregular', label: 'Irregular Verbs' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter.key && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === filter.key && styles.filterOptionTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort by</Text>
              {[
                { key: 'alphabetical', label: 'Alphabetical' },
                { key: 'frequency', label: 'Frequency' },
                { key: 'difficulty', label: 'Difficulty' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterOption,
                    sortBy === sort.key && styles.filterOptionActive
                  ]}
                  onPress={() => setSortBy(sort.key as SortType)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === sort.key && styles.filterOptionTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Verb Detail Modal */}
      <Modal
        visible={selectedVerb !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verb Details</Text>
            <TouchableOpacity onPress={() => setSelectedVerb(null)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {selectedVerb && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.verbDetailHeader}>
                <Text style={styles.verbDetailInfinitive}>{selectedVerb.infinitive}</Text>
                <TouchableOpacity style={styles.audioButtonLarge}>
                  <Volume2 size={24} color="#059669" />
                </TouchableOpacity>
              </View>

              <Text style={styles.verbDetailMeaning}>"{selectedVerb.meaning}"</Text>

              <View style={styles.verbDetailMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Type:</Text>
                  <Text style={styles.metaValue}>{selectedVerb.type}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Frequency:</Text>
                  <Text style={styles.metaValue}>{selectedVerb.frequency}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulty:</Text>
                  <Text style={styles.metaValue}>{selectedVerb.difficulty}</Text>
                </View>
              </View>

              {/* Conjugation Table */}
              <View style={styles.conjugationSection}>
                <Text style={styles.conjugationTitle}>Conjugations</Text>
                {Object.entries(selectedVerb.conjugations).map(([tense, conjugations]) => (
                  <View key={tense} style={styles.tenseSection}>
                    <Text style={styles.tenseTitle}>
                      {tense.charAt(0).toUpperCase() + tense.slice(1)} Tense
                    </Text>
                    <View style={styles.conjugationTable}>
                      {Object.entries(conjugations).map(([pronoun, conjugation]) => (
                        <View key={pronoun} style={styles.conjugationRow}>
                          <Text style={styles.pronounText}>{pronoun}:</Text>
                          <Text style={styles.conjugationText}>{conjugation}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Examples */}
              {selectedVerb.examples && (
                <View style={styles.examplesSection}>
                  <Text style={styles.examplesTitle}>Examples</Text>
                  {selectedVerb.examples.map((example, index) => (
                    <View key={index} style={styles.exampleItem}>
                      <Text style={styles.exampleIgbo}>{example.igbo}</Text>
                      <Text style={styles.exampleEnglish}>"{example.english}"</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clearFilters: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  verbsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verbItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verbItemContent: {
    padding: 16,
  },
  verbItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verbInfinitive: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  verbBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHigh: {
    backgroundColor: '#dcfce7',
  },
  badgeMedium: {
    backgroundColor: '#fef3c7',
  },
  badgeLow: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextHigh: {
    color: '#16a34a',
  },
  badgeTextMedium: {
    color: '#d97706',
  },
  badgeTextLow: {
    color: '#dc2626',
  },
  audioButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  verbMeaning: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  verbMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  verbType: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  verbDifficulty: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  verbDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  verbDetailInfinitive: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  audioButtonLarge: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  verbDetailMeaning: {
    fontSize: 20,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  verbDetailMeta: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metaLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  conjugationSection: {
    marginBottom: 24,
  },
  conjugationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tenseSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  conjugationTable: {
    gap: 8,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pronounText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 60,
  },
  conjugationText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  exampleItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleIgbo: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});