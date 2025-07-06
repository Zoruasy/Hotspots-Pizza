import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../components/ThemeContext'
import { LanguageContext } from '../components/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'

// Breedte van het scherm ophalen voor eventueel responsive design
const { width } = Dimensions.get('window')

export default function HomeScreen({ navigation: propNavigation }) {
    // Ophalen van dark/light mode uit ThemeContext
    const { darkMode } = useContext(ThemeContext)

    // Ophalen van vertaalde teksten uit LanguageContext
    const { texts } = useContext(LanguageContext)

    // Navigatie object (van React Navigation)
    const navigation = useNavigation() || propNavigation

    // Alle pizzeria's uit de JSON
    const [pizzerias, setPizzerias] = useState([])

    // Alleen de pizzeria's die dichtbij de gebruiker zijn
    const [nearbyPizzerias, setNearbyPizzerias] = useState([])

    // Huidige locatie van de gebruiker
    const [userLocation, setUserLocation] = useState(null)

    // Wordt uitgevoerd wanneer het scherm laadt
    useEffect(() => {
        getUserLocation()
    }, [])

    // Wanneer userLocation beschikbaar is, haal de pizzeria's op
    useEffect(() => {
        if (userLocation) {
            fetchPizzerias()
        }
    }, [userLocation])

    // Vraag permissie en haal de locatie van de gebruiker op
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
                // Geen toestemming → gebruik Nederland als standaardlocatie
                setUserLocation({
                    latitude: 52.1326,
                    longitude: 5.2913,
                })
            }
        } catch (err) {
            console.error("Error getting location:", err)
            // Fallback naar Nederland bij een error
            setUserLocation({
                latitude: 52.1326,
                longitude: 5.2913,
            })
        }
    }

    // Bereken afstand in km tussen twee punten (Haversine formule)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Straal van de aarde in km
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

    // Graden omrekenen naar radialen
    const deg2rad = (deg) => {
        return deg * (Math.PI/180)
    }

    // Haal JSON op van github met alle pizzeria's
    const fetchPizzerias = async () => {
        try {
            const response = await fetch('https://zoruasy.github.io/pizzaria-hotspots/pizzarias.json');
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await response.json()

            // Voeg afstand en andere extra data toe aan elke pizzeria
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

            // Sorteer op afstand en pak de 3 dichtstbijzijnde
            const closest = pizzeriasWithDistance
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                .slice(0, 3)

            setPizzerias(pizzeriasWithDistance)
            setNearbyPizzerias(closest)
        } catch (err) {
            console.error('Error fetching pizzerias:', err)
        }
    }

    // Navigatie naar kaartscherm
    const goToMap = () => navigation.navigate('Map')

    // Navigatie naar lijstscherm
    const goToList = () => navigation.navigate('List')

    // Navigatie naar kaartscherm met geselecteerde pizzeria
    const goToPizzeriaOnMap = (pizzeria) => {
        navigation.navigate('Map', {
            selectedHall: pizzeria
        })
    }

    // Elke keer dat je terugkeert naar dit scherm, opnieuw laden
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
                {/* Hero header bovenaan */}
                <View style={[styles.heroContainer, darkMode ? styles.darkHeroContainer : null]}>
                    <View style={styles.heroContent}>
                        {/* Titel + iconen */}
                        <View style={styles.titleSection}>
                            <View style={styles.titleRow}>
                                <View style={styles.pizzaIconContainer}>
                                    <Ionicons
                                        name="pizza"
                                        size={28}
                                        color={darkMode ? "#FF6B6B" : "#EF4444"}
                                    />
                                </View>
                                <View style={styles.titleTextContainer}>
                                    <Text style={[styles.titleMain, darkMode ? styles.darkText : null]}>
                                        Pizzeria
                                    </Text>
                                    <Text style={[styles.titleAccent, darkMode ? styles.darkAccentText : null]}>
                                        Hotspots
                                    </Text>
                                </View>
                                <View style={styles.decorativeElements}>
                                    {/* Decoratieve bolletjes */}
                                    <View style={[styles.dot, { backgroundColor: darkMode ? '#FF6B6B' : '#EF4444' }]} />
                                    <View style={[styles.dot, { backgroundColor: darkMode ? '#34D399' : '#10B981' }]} />
                                    <View style={[styles.dot, { backgroundColor: darkMode ? '#F59E0B' : '#D97706' }]} />
                                </View>
                            </View>
                        </View>

                        {/* Ondertitel */}
                        <Text style={[styles.subtitle, darkMode ? styles.darkSubText : null]}>
                            Ontdek de beste pizza's in Nederland!
                        </Text>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, darkMode ? styles.darkAccentText : null]}>
                                    {pizzerias.length}+
                                </Text>
                                <Text style={[styles.statLabel, darkMode ? styles.darkSubText : null]}>
                                    Pizzeria's
                                </Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, darkMode ? styles.darkAccentText : null]}>
                                    4.5★
                                </Text>
                                <Text style={[styles.statLabel, darkMode ? styles.darkSubText : null]}>
                                    Gemiddeld
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Snelknoppen */}
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
                                name="pizza"
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

                {/* Overzicht van pizzeria's dichtbij */}
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

                    {/* Geen resultaten */}
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

                {/* Tip van de dag */}
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
                                Tip van de dag
                            </Text>
                            <Text style={[styles.tipSubtitle, darkMode ? styles.darkSubText : null]}>
                                Van onze chef-koks
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.tipText, darkMode ? styles.darkSubText : null]}>
                        Probeer eens een pizza met buffelmozzarella en verse basilicum voor de echte italiaanse smaak ;)
                    </Text>
                </View>

                {/* Onderkant witruimte */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    )
}
