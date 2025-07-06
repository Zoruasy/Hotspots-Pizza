import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../components/ThemeContext'
import { LanguageContext } from '../components/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

export default function HomeScreen({ navigation: propNavigation }) {
    const { darkMode } = useContext(ThemeContext)
    const { texts } = useContext(LanguageContext)
    const navigation = useNavigation() || propNavigation
    const [pizzerias, setPizzerias] = useState([])
    const [nearbyPizzerias, setNearbyPizzerias] = useState([])
    const [userLocation, setUserLocation] = useState(null)

    useEffect(() => {
        getUserLocation()
    }, [])

    useEffect(() => {
        if (userLocation) {
            fetchPizzerias()
        }
    }, [userLocation])

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                })
            } else {
                setUserLocation({
                    latitude: 52.1326,
                    longitude: 5.2913,
                })
            }
        } catch (err) {
            console.error("Error getting location:", err)
            setUserLocation({
                latitude: 52.1326,
                longitude: 5.2913,
            })
        }
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371
        const dLat = deg2rad(lat2 - lat1)
        const dLon = deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c
        return distance
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI/180)
    }

    const fetchPizzerias = async () => {
        try {
            const response = await fetch('https://zoruasy.github.io/pizzaria-hotspots/pizzarias.json');
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await response.json()
            const pizzeriasWithDistance = data.hotspots.map(pizzeria => {
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    pizzeria.latitude,
                    pizzeria.longitude
                )
                return {
                    ...pizzeria,
                    distance: distance.toFixed(1),
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    city: "Rotterdam",
                    province: "Zuid-Holland"
                }
            })

            const closest = pizzeriasWithDistance
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                .slice(0, 3)

            setPizzerias(pizzeriasWithDistance)
            setNearbyPizzerias(closest)
        } catch (err) {
            console.error('Error fetching pizzerias:', err)
        }
    }

    const goToMap = () => navigation.navigate('Map')
    const goToList = () => navigation.navigate('List')
    const goToPizzeriaOnMap = (pizzeria) => {
        navigation.navigate('Map', {
            selectedHall: pizzeria
        })
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (userLocation) {
                fetchPizzerias()
            }
        })
        return unsubscribe
    }, [navigation, userLocation])

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
            >
                {/* Hero Header */}
                <View style={[styles.heroContainer, darkMode ? styles.darkHeroContainer : null]}>
                    <View style={styles.heroContent}>
                        <View style={styles.pizzaIconContainer}>
                            <Ionicons
                                name="pizza"
                                size={32}
                                color={darkMode ? "#FF6B6B" : "#EF4444"}
                            />
                        </View>
                        <Text style={[styles.title, darkMode ? styles.darkText : null]}>
                            Pizzeria Hotspots
                        </Text>
                        <Text style={[styles.subtitle, darkMode ? styles.darkSubText : null]}>
                            Ontdek de beste pizza's in Rotterdam! 🍕
                        </Text>
                    </View>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, darkMode ? styles.darkActionButton : null]}
                        onPress={goToMap}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconContainer, darkMode ? styles.darkActionIconContainer : null]}>
                            <Ionicons
                                name="map"
                                size={24}
                                color={darkMode ? "#60A5FA" : "#3B82F6"}
                            />
                        </View>
                        <Text style={[styles.actionText, darkMode ? styles.darkText : null]}>
                            Zoek op Kaart
                        </Text>
                        <Text style={[styles.actionSubtext, darkMode ? styles.darkSubText : null]}>
                            Interactieve kaart
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, darkMode ? styles.darkActionButton : null]}
                        onPress={goToList}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconContainer, darkMode ? styles.darkActionIconContainer : null]}>
                            <Ionicons
                                name="list"
                                size={24}
                                color={darkMode ? "#34D399" : "#10B981"}
                            />
                        </View>
                        <Text style={[styles.actionText, darkMode ? styles.darkText : null]}>
                            Bekijk Lijst
                        </Text>
                        <Text style={[styles.actionSubtext, darkMode ? styles.darkSubText : null]}>
                            Alle pizzeria's
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Nearby Pizzerias */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons
                                name="location"
                                size={20}
                                color={darkMode ? "#F59E0B" : "#D97706"}
                            />
                            <Text style={[styles.sectionTitle, darkMode ? styles.darkText : null]}>
                                In de buurt
                            </Text>
                        </View>
                        <TouchableOpacity onPress={goToList} style={styles.seeAllButton}>
                            <Text style={[styles.seeAll, darkMode ? styles.darkSeeAll : null]}>
                                Bekijk alles
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={darkMode ? "#60A5FA" : "#3B82F6"}
                            />
                        </TouchableOpacity>
                    </View>

                    {nearbyPizzerias.length === 0 ? (
                        <View style={[styles.emptyState, darkMode ? styles.darkEmptyState : null]}>
                            <Ionicons
                                name="search"
                                size={48}
                                color={darkMode ? "#6B7280" : "#9CA3AF"}
                            />
                            <Text style={[styles.noHallsText, darkMode ? styles.darkSubText : null]}>
                                Geen pizzeria's in de buurt gevonden
                            </Text>
                        </View>
                    ) : (
                        nearbyPizzerias.map((pizzeria, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.pizzeriaCard, darkMode ? styles.darkPizzeriaCard : null]}
                                onPress={() => goToPizzeriaOnMap(pizzeria)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.pizzeriaInfo}>
                                        <Text style={[styles.pizzeriaName, darkMode ? styles.darkText : null]}>
                                            {pizzeria.name}
                                        </Text>
                                        <View style={styles.locationRow}>
                                            <Ionicons
                                                name="location-outline"
                                                size={14}
                                                color={darkMode ? "#9CA3AF" : "#6B7280"}
                                            />
                                            <Text style={[styles.locationText, darkMode ? styles.darkSubText : null]}>
                                                {pizzeria.distance} km • {pizzeria.city}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardRight}>
                                        <View style={[styles.ratingBadge, darkMode ? styles.darkRatingBadge : null]}>
                                            <Ionicons
                                                name="star"
                                                size={12}
                                                color="#F59E0B"
                                            />
                                            <Text style={[styles.rating, darkMode ? styles.darkRatingText : null]}>
                                                {pizzeria.rating}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={darkMode ? "#6B7280" : "#9CA3AF"}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Today's Tip */}
                <View style={[styles.tipContainer, darkMode ? styles.darkTipContainer : null]}>
                    <View style={styles.tipHeader}>
                        <View style={[styles.tipIconContainer, darkMode ? styles.darkTipIconContainer : null]}>
                            <Ionicons
                                name="bulb"
                                size={20}
                                color={darkMode ? "#F59E0B" : "#D97706"}
                            />
                        </View>
                        <View style={styles.tipHeaderText}>
                            <Text style={[styles.tipTitle, darkMode ? styles.darkText : null]}>
                                Pizza Tip van de Dag
                            </Text>
                            <Text style={[styles.tipSubtitle, darkMode ? styles.darkSubText : null]}>
                                Van onze chef-koks
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.tipText, darkMode ? styles.darkSubText : null]}>
                        Probeer eens een pizza met buffelmozzarella en verse basilicum voor de ultieme Italiaanse ervaring! 🇮🇹
                    </Text>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    darkContainer: {
        backgroundColor: '#0F172A',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },

    // Hero Section
    heroContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginTop: 20,
        marginBottom: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    darkHeroContainer: {
        backgroundColor: '#1E293B',
    },
    heroContent: {
        alignItems: 'center',
    },
    pizzaIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    darkText: {
        color: '#F1F5F9',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    darkSubText: {
        color: '#94A3B8',
    },

    // Action Buttons
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    darkActionButton: {
        backgroundColor: '#1E293B',
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    darkActionIconContainer: {
        backgroundColor: '#1E3A8A',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionSubtext: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Section Headers
    sectionContainer: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAll: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 14,
    },
    darkSeeAll: {
        color: '#60A5FA',
    },

    // Pizzeria Cards
    pizzeriaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
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
    },
    pizzeriaName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
    },
    cardRight: {
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

    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    darkEmptyState: {
        backgroundColor: '#1E293B',
    },
    noHallsText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '500',
    },

    // Tip Container
    tipContainer: {
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    darkTipContainer: {
        backgroundColor: '#451A03',
        borderColor: '#92400E',
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    tipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkTipIconContainer: {
        backgroundColor: '#92400E',
    },
    tipHeaderText: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    tipSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    tipText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },

    bottomSpacing: {
        height: 20,
    },
});