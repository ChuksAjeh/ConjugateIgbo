import React, { useState, useMemo, useEffect } from 'react';
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
import { IgboVerb } from '@/data/igboVerbs';
import { verbService } from '@/lib/verbService';
import { useTheme } from '@/components/ThemeProvider';

type FilterType = 'all' | 'common' | 'regular' | 'irregular';
type SortType = 'alphabetical' | 'frequency' | 'difficulty';

export default function VerbsScreen() {
  const { theme, isDark } = useTheme();
  const [verbs, setVerbs] = useState<IgboVerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('alphabetical');
  const [selectedVerb, setSelectedVerb] = useState<IgboVerb | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load verbs on component mount
  useEffect(() => {
    const loadVerbs = async () => {
      try {
        setIsLoading(true);
        const allVerbs = await verbService.getAllVerbs();
        setVerbs(allVerbs);
      } catch (error) {
        console.error('Error loading verbs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVerbs();
  }, []);

  const filteredAndSortedVerbs = useMemo(() => {
    let filtered = verbs.filter(verb => {
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
  }, [searchQuery, selectedFilter, sortBy, verbs]);

  const renderVerbItem = ({ item }: { item: IgboVerb }) => (
    <TouchableOpacity
      style={[styles.verbItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => setSelectedVerb(item)}
    >
      <View style={styles.verbItemContent}>
        <View style={styles.verbItemHeader}>
          <Text style={[styles.verbInfinitive, { color: theme.colors.text }]}>{item.infinitive}</Text>
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
        
        <Text style={[styles.verbMeaning, { color: theme.colors.textSecondary }]}>"{item.meaning}"</Text>
        
        <View style={styles.verbMeta}>
          <Text style={[styles.verbType, { color: theme.colors.textSecondary }]}>{item.type}</Text>
          <Text style={[styles.verbDifficulty, { color: theme.colors.textSecondary }]}>{item.difficulty}</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#047857', '#065f46'] : ['#059669', '#047857']}
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
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search verbs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Summary */}
      {(selectedFilter !== 'all' || sortBy !== 'alphabetical') && (
        <View style={styles.filterSummary}>
          <Text style={[styles.filterSummaryText, { color: theme.colors.textSecondary }]}>
            {selectedFilter !== 'all' && `Filter: ${selectedFilter} • `}
            Sort: {sortBy}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter('all');
              setSortBy('alphabetical');
            }}
          >
            <Text style={[styles.clearFilters, { color: theme.colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Verbs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading verbs...</Text>
        </View>
      ) : (
      <FlatList
        data={filteredAndSortedVerbs}
        renderItem={renderVerbItem}
        keyExtractor={(item) => item.id}
        style={styles.verbsList}
        showsVerticalScrollIndicator={false}
      />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filters & Sorting</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Filter Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Filter by</Text>
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
                    { backgroundColor: theme.colors.surface },
                    selectedFilter === filter.key && { ...styles.filterOptionActive, backgroundColor: isDark ? '#1e40af' : '#eff6ff', borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: theme.colors.text },
                    selectedFilter === filter.key && { color: theme.colors.primary, fontWeight: '500' }
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Sort by</Text>
              {[
                { key: 'alphabetical', label: 'Alphabetical' },
                { key: 'frequency', label: 'Frequency' },
                { key: 'difficulty', label: 'Difficulty' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: theme.colors.surface },
                    sortBy === sort.key && { ...styles.filterOptionActive, backgroundColor: isDark ? '#1e40af' : '#eff6ff', borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setSortBy(sort.key as SortType)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: theme.colors.text },
                    sortBy === sort.key && { color: theme.colors.primary, fontWeight: '500' }
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
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Verb Details</Text>
            <TouchableOpacity onPress={() => setSelectedVerb(null)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {selectedVerb && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.verbDetailHeader}>
                <Text style={[styles.verbDetailInfinitive, { color: theme.colors.text }]}>{selectedVerb.infinitive}</Text>
                <TouchableOpacity style={styles.audioButtonLarge}>
                  <Volume2 size={24} color="#059669" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.verbDetailMeaning, { color: theme.colors.textSecondary }]}>"{selectedVerb.meaning}"</Text>

              <View style={[styles.verbDetailMeta, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{selectedVerb.type}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>Frequency:</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{selectedVerb.frequency}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>Difficulty:</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{selectedVerb.difficulty}</Text>
                </View>
              </View>

              {/* Conjugation Table */}
              <View style={styles.conjugationSection}>
                <Text style={[styles.conjugationTitle, { color: theme.colors.text }]}>Conjugations</Text>
                {Object.entries(selectedVerb.conjugations).map(([tense, conjugations]) => (
                  <View key={tense} style={[styles.tenseSection, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.tenseTitle, { color: theme.colors.text }]}>
                      {tense.charAt(0).toUpperCase() + tense.slice(1)} Tense
                    </Text>
                    <View style={styles.conjugationTable}>
                      {Object.entries(conjugations).map(([pronoun, conjugation]) => (
                        <View key={pronoun} style={styles.conjugationRow}>
                          <Text style={[styles.pronounText, { color: theme.colors.textSecondary }]}>{pronoun}:</Text>
                          <Text style={[styles.conjugationText, { color: theme.colors.text }]}>{conjugation}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Examples */}
              {selectedVerb.examples && (
                <View style={styles.examplesSection}>
                  <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>Examples</Text>
                  {selectedVerb.examples.map((example, index) => (
                    <View key={index} style={[styles.exampleItem, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.exampleIgbo, { color: theme.colors.text }]}>{example.igbo}</Text>
                      <Text style={[styles.exampleEnglish, { color: theme.colors.textSecondary }]}>"{example.english}"</Text>
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  filterOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 16,
  },
  filterOptionTextActive: {
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
  },
  audioButtonLarge: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  verbDetailMeaning: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  verbDetailMeta: {
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
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  conjugationSection: {
    marginBottom: 24,
  },
  conjugationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tenseSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tenseTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '500',
    minWidth: 60,
  },
  conjugationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exampleItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleIgbo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
});