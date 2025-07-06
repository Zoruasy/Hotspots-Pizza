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
    // Alle pizzeria's uit de JSON
    const [pizzerias, setPizzerias] = useState([]);

    // Gefilterde lijst (op zoekterm of favorieten)
    const [filteredPizzerias, setFilteredPizzerias] = useState([]);

    // Eventuele foutmelding bij ophalen
    const [error, setError] = useState(null);

    // Favoriete pizzeria-namen
    const [favorites, setFavorites] = useState([]);

    // Filter voor alleen favorieten aan/uit
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    // Huidige zoekterm
    const [searchQuery, setSearchQuery] = useState('');

    // Loading indicator
    const [isLoading, setIsLoading] = useState(true);

    // Dark mode ophalen uit ThemeContext
    const { darkMode } = useContext(ThemeContext);

    // Vertalingen ophalen uit LanguageContext
    const { texts } = useContext(LanguageContext);

    // Haal pizzeria's én favorieten uit opslag zodra scherm opent
    useEffect(() => {
        fetchPizzerias();
        loadFavorites();
    }, []);

    // Filterlijst bij elke verandering van input of filters
    useEffect(() => {
        filterPizzerias();
    }, [pizzerias, favorites, showOnlyFavorites, searchQuery]);

    // Favorieten ophalen uit AsyncStorage
    const loadFavorites = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('favorite-pizzerias');
            const savedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
            setFavorites(savedFavorites);
        } catch (error) {
            console.error('Could not load favorites', error);
        }
    };

    // Favorieten opslaan naar AsyncStorage
    const saveFavorites = async (newFavorites) => {
        try {
            const jsonValue = JSON.stringify(newFavorites);
            await AsyncStorage.setItem('favorite-pizzerias', jsonValue);
        } catch (error) {
            console.error('Could not save favorites', error);
        }
    };

    // Favoriet toevoegen of verwijderen
    const toggleFavorite = (pizzeriaName) => {
        let newFavorites;
        if (favorites.includes(pizzeriaName)) {
            // Verwijderen uit favorieten
            newFavorites = favorites.filter((name) => name !== pizzeriaName);
        } else {
            // Toevoegen aan favorieten
            newFavorites = [...favorites, pizzeriaName];
        }
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    // Filter alleen favorieten aan- of uitzetten
    const toggleFavoritesFilter = () => {
        setShowOnlyFavorites(!showOnlyFavorites);
    };

    // Filter alle pizzeria's op zoekterm én favorieten
    const filterPizzerias = () => {
        let result = [...pizzerias];

        // Eerst filteren op favorieten
        if (showOnlyFavorites) {
            result = result.filter((pizzeria) =>
                favorites.includes(pizzeria.name)
            );
        }

        // Daarna filteren op zoekterm
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

    // Haal pizzeria's op uit JSON-bestand
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

            // Voeg extra gegevens toe zoals rating en locatie
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

    // Render één item in de lijst
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
                    {/* Linkerzijde met naam en locatie */}
                    <View style={styles.pizzeriaInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.pizzeriaName, darkMode ? styles.darkText : null]}>
                                {item.name}
                            </Text>
                            {/* Sterretje als het een favoriet is */}
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

                    {/* Rechterzijde met rating, hartje en chevron */}
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

    // Render bovenkant van de lijst
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Hero blok bovenaan */}
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
                            Ontdek {pizzerias.length} heerlijke pizza's :)
                        </Text>
                    </View>
                </View>
            </View>

            {/* Zoekbalk */}
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
                {/* Wis knopje */}
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

            {/* Filter chips */}
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

    // Toon lege state indien geen resultaten
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

    // Toon laadscherm
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

    // Render de hele lijst
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
