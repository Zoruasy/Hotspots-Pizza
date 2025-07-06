import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Dimensions,
} from 'react-native';
import { ThemeContext } from '../components/ThemeContext';
import { LanguageContext } from '../components/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ListScreen({ navigation }) {
    const [pizzerias, setPizzerias] = useState([]);
    const [filteredPizzerias, setFilteredPizzerias] = useState([]);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { darkMode } = useContext(ThemeContext);
    const { texts } = useContext(LanguageContext);

    useEffect(() => {
        fetchPizzerias();
        loadFavorites();
    }, []);

    useEffect(() => {
        filterPizzerias();
    }, [pizzerias, favorites, showOnlyFavorites, searchQuery]);

    const loadFavorites = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('favorite-pizzerias');
            const savedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
            setFavorites(savedFavorites);
        } catch (error) {
            console.error('Could not load favorites', error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            const jsonValue = JSON.stringify(newFavorites);
            await AsyncStorage.setItem('favorite-pizzerias', jsonValue);
        } catch (error) {
            console.error('Could not save favorites', error);
        }
    };

    const toggleFavorite = (pizzeriaName) => {
        let newFavorites;
        if (favorites.includes(pizzeriaName)) {
            newFavorites = favorites.filter((name) => name !== pizzeriaName);
        } else {
            newFavorites = [...favorites, pizzeriaName];
        }
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    const toggleFavoritesFilter = () => {
        setShowOnlyFavorites(!showOnlyFavorites);
    };

    const filterPizzerias = () => {
        let result = [...pizzerias];
        if (showOnlyFavorites) {
            result = result.filter((pizzeria) =>
                favorites.includes(pizzeria.name)
            );
        }
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (pizzeria) =>
                    pizzeria.name.toLowerCase().includes(query) ||
                    (pizzeria.city?.toLowerCase() || '').includes(query) ||
                    (pizzeria.province?.toLowerCase() || '').includes(query)
            );
        }
        setFilteredPizzerias(result);
    };

    const fetchPizzerias = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                'https://zoruasy.github.io/pizzaria-hotspots/pizzarias.json'
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const pizzeriasWithExtras = data.hotspots.map((pizzeria) => ({
                ...pizzeria,
                rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                city: 'Rotterdam',
                province: 'Zuid-Holland',
            }));
            setPizzerias(pizzeriasWithExtras);
            setFilteredPizzerias(pizzeriasWithExtras);
            setError(null);
        } catch (err) {
            console.error('Error fetching pizzerias:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPizzeria = ({ item, index }) => {
        const isFavorite = favorites.includes(item.name);
        return (
            <TouchableOpacity
                style={[
                    styles.pizzeriaCard,
                    darkMode ? styles.darkPizzeriaCard : null,
                    { marginTop: index === 0 ? 0 : 12 }
                ]}
                onPress={() =>
                    navigation.navigate('Map', {
                        selectedHall: item,
                    })
                }
                activeOpacity={0.9}
            >
                <View style={styles.cardContent}>
                    <View style={styles.pizzeriaInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.pizzeriaName, darkMode ? styles.darkText : null]}>
                                {item.name}
                            </Text>
                            {isFavorite && (
                                <View style={styles.favoriteIndicator}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                </View>
                            )}
                        </View>
                        <View style={styles.locationRow}>
                            <Ionicons
                                name="location-outline"
                                size={14}
                                color={darkMode ? '#94A3B8' : '#6B7280'}
                            />
                            <Text style={[styles.locationText, darkMode ? styles.darkSubText : null]}>
                                {item.city}, {item.province}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardActions}>
                        <View style={[styles.ratingBadge, darkMode ? styles.darkRatingBadge : null]}>
                            <Ionicons
                                name="star"
                                size={12}
                                color="#F59E0B"
                            />
                            <Text style={[styles.rating, darkMode ? styles.darkRatingText : null]}>
                                {item.rating}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => toggleFavorite(item.name)}
                            style={[
                                styles.favoriteButton,
                                isFavorite ? styles.activeFavoriteButton : null,
                                darkMode && !isFavorite ? styles.darkFavoriteButton : null
                            ]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isFavorite ? '#EF4444' : (darkMode ? '#94A3B8' : '#6B7280')}
                            />
                        </TouchableOpacity>

                        <View style={styles.chevronContainer}>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={darkMode ? '#64748B' : '#9CA3AF'}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Hero Header */}
            <View style={[styles.heroSection, darkMode ? styles.darkHeroSection : null]}>
                <View style={styles.heroContent}>
                    <View style={styles.heroIconContainer}>
                        <Ionicons
                            name="restaurant"
                            size={24}
                            color={darkMode ? "#F59E0B" : "#D97706"}
                        />
                    </View>
                    <View style={styles.heroText}>
                        <Text style={[styles.title, darkMode ? styles.darkText : null]}>
                            Alle Pizzeria's
                        </Text>
                        <Text style={[styles.subtitle, darkMode ? styles.darkSubText : null]}>
                            Ontdek {pizzerias.length} heerlijke pizza hotspots! 🍕
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, darkMode ? styles.darkSearchContainer : null]}>
                <View style={styles.searchIconContainer}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={darkMode ? '#60A5FA' : '#3B82F6'}
                    />
                </View>
                <TextInput
                    style={[styles.searchInput, darkMode ? styles.darkSearchInput : null]}
                    placeholder="Zoek op naam of locatie..."
                    placeholderTextColor={darkMode ? '#94A3B8' : '#6B7280'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                    >
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color={darkMode ? '#94A3B8' : '#6B7280'}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Controls */}
            <View style={styles.filterSection}>
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        showOnlyFavorites ? styles.activeFilterChip : null,
                        darkMode && !showOnlyFavorites ? styles.darkFilterChip : null,
                    ]}
                    onPress={toggleFavoritesFilter}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={showOnlyFavorites ? "heart" : "heart-outline"}
                        size={16}
                        color={showOnlyFavorites ? '#FFFFFF' : (darkMode ? '#F59E0B' : '#EF4444')}
                    />
                    <Text
                        style={[
                            styles.filterChipText,
                            showOnlyFavorites ? styles.activeFilterChipText : null,
                            darkMode && !showOnlyFavorites ? styles.darkText : null,
                        ]}
                    >
                        Favorieten
                    </Text>
                    {favorites.length > 0 && (
                        <View style={[
                            styles.filterBadge,
                            showOnlyFavorites ? styles.activeFilterBadge : null
                        ]}>
                            <Text style={[
                                styles.filterBadgeText,
                                showOnlyFavorites ? styles.activeFilterBadgeText : null
                            ]}>
                                {favorites.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.resultInfo}>
                    <Text style={[styles.resultCount, darkMode ? styles.darkSubText : null]}>
                        {filteredPizzerias.length} van {pizzerias.length}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => {
        if (showOnlyFavorites && filteredPizzerias.length === 0) {
            return (
                <View style={[styles.emptyState, darkMode ? styles.darkEmptyState : null]}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons
                            name="heart-outline"
                            size={48}
                            color={darkMode ? '#64748B' : '#9CA3AF'}
                        />
                    </View>
                    <Text style={[styles.emptyTitle, darkMode ? styles.darkText : null]}>
                        Geen favorieten
                    </Text>
                    <Text style={[styles.emptySubtitle, darkMode ? styles.darkSubText : null]}>
                        Voeg pizzeria's toe aan je favorieten door op het hartje te tikken!
                    </Text>
                </View>
            );
        }

        if (searchQuery && filteredPizzerias.length === 0) {
            return (
                <View style={[styles.emptyState, darkMode ? styles.darkEmptyState : null]}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons
                            name="search-outline"
                            size={48}
                            color={darkMode ? '#64748B' : '#9CA3AF'}
                        />
                    </View>
                    <Text style={[styles.emptyTitle, darkMode ? styles.darkText : null]}>
                        Geen resultaten
                    </Text>
                    <Text style={[styles.emptySubtitle, darkMode ? styles.darkSubText : null]}>
                        Probeer een andere zoekterm of verwijder filters
                    </Text>
                    <TouchableOpacity
                        style={[styles.clearFiltersButton, darkMode ? styles.darkClearFiltersButton : null]}
                        onPress={() => {
                            setSearchQuery('');
                            setShowOnlyFavorites(false);
                        }}
                    >
                        <Text style={[styles.clearFiltersText, darkMode ? styles.darkClearFiltersText : null]}>
                            Wis filters
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : null]}>
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingIconContainer}>
                        <Ionicons
                            name="pizza"
                            size={48}
                            color={darkMode ? "#F59E0B" : "#D97706"}
                        />
                    </View>
                    <Text style={[styles.loadingText, darkMode ? styles.darkText : null]}>
                        Pizzeria's laden...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <FlatList
                data={filteredPizzerias}
                renderItem={renderPizzeria}
                keyExtractor={(item) => item.name}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                bounces={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    darkContainer: {
        backgroundColor: '#0F172A',
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },

    // Header Section
    headerContainer: {
        paddingBottom: 8,
    },
    heroSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    darkHeroSection: {
        backgroundColor: '#1E293B',
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    heroText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    darkText: {
        color: '#F1F5F9',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    darkSubText: {
        color: '#94A3B8',
    },

    // Search Section
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    darkSearchContainer: {
        backgroundColor: '#1E293B',
    },
    searchIconContainer: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    darkSearchInput: {
        color: '#F1F5F9',
    },
    clearButton: {
        padding: 4,
    },

    // Filter Section
    filterSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    darkFilterChip: {
        backgroundColor: '#1E293B',
        borderColor: '#374151',
    },
    activeFilterChip: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    activeFilterChipText: {
        color: '#FFFFFF',
    },
    filterBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    activeFilterBadge: {
        backgroundColor: '#FFFFFF',
    },
    filterBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    activeFilterBadgeText: {
        color: '#EF4444',
    },
    resultInfo: {
        alignItems: 'flex-end',
    },
    resultCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // List Container
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // Pizzeria Cards
    pizzeriaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    darkPizzeriaCard: {
        backgroundColor: '#1E293B',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pizzeriaInfo: {
        flex: 1,
        marginRight: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    pizzeriaName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
    },
    favoriteIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    darkRatingBadge: {
        backgroundColor: '#451A03',
    },
    rating: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
    },
    darkRatingText: {
        color: '#FCD34D',
    },
    favoriteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    darkFavoriteButton: {
        backgroundColor: '#374151',
    },
    activeFavoriteButton: {
        backgroundColor: '#FEE2E2',
    },
    chevronContainer: {
        opacity: 0.5,
    },

    // Empty States
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    darkEmptyState: {
        backgroundColor: '#1E293B',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    clearFiltersButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    darkClearFiltersButton: {
        backgroundColor: '#60A5FA',
    },
    clearFiltersText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    darkClearFiltersText: {
        color: '#1E293B',
    },
});