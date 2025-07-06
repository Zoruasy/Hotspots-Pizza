import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import { ThemeContext } from '../components/ThemeContext';

export default function MapScreen({ route, navigation }) {
    // State voor pizzeria's
    const [pizzerias, setPizzerias] = useState([]);

    // Eventuele foutmeldingen
    const [error, setError] = useState(null);

    // Locatie van de gebruiker
    const [userLocation, setUserLocation] = useState(null);

    // Toestemming voor locatie
    const [locationPermission, setLocationPermission] = useState(false);

    // Ref naar de MapView, om bijvoorbeeld te kunnen animeren
    const mapRef = useRef(null);

    // Dark mode context ophalen
    const { darkMode } = useContext(ThemeContext);

    // Pizzeria die eventueel vanuit een andere pagina geselecteerd is
    const selectedPizzeria = route.params?.selectedHall;

    // Bij laden van de component → locatie ophalen en pizzeria's ophalen
    useEffect(() => {
        (async () => {
            try {
                // Vraag toestemming voor locatie
                const { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermission(status === 'granted');

                if (status === 'granted') {
                    // Haal huidige locatie op
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });

                    // Als er geen geselecteerde pizzeria is, zoom dan in op de huidige locatie
                    if (!selectedPizzeria && mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }, 1000);
                    }
                }
            } catch (err) {
                console.error("Error getting location:", err);
                setError('Failed to get your location: ' + err.message);
            }
        })();

        fetchPizzerias();
    }, []);

    // Als er een geselecteerde pizzeria is → zoom daarnaar
    useEffect(() => {
        if (selectedPizzeria && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: selectedPizzeria.latitude,
                longitude: selectedPizzeria.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    }, [selectedPizzeria, pizzerias]);

    /**
     * Haal alle pizzeria's op uit de externe JSON
     */
    const fetchPizzerias = async () => {
        try {
            const response = await fetch('https://zoruasy.github.io/pizzaria-hotspots/pizzarias.json');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Voeg extra velden toe (stad en provincie)
            const pizzeriasWithExtras = data.hotspots.map((pizzeria) => ({
                ...pizzeria,
                city: 'Rotterdam',
                province: 'Zuid-Holland'
            }));

            setPizzerias(pizzeriasWithExtras);
            setError(null);
        } catch (err) {
            console.error('Error fetching pizzerias:', err);
            setError(err.message);
        }
    };

    // Bepaal het initiële gebied op de kaart
    const initialRegion = userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }
        : {
            latitude: 52.1326,          // Centrum van Nederland
            longitude: 5.2913,
            latitudeDelta: 3.0,
            longitudeDelta: 3.0,
        };

    return (
        <View style={[styles.container, darkMode ? styles.darkContainer : null]}>
            {/* Kaart component */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={locationPermission}
                showsCompass={true}
                showsMyLocationButton={true}
                userInterfaceStyle={darkMode ? 'dark' : 'light'}
            >
                {/* Markers tekenen voor elke pizzeria */}
                {pizzerias.map((pizzeria, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: pizzeria.latitude,
                            longitude: pizzeria.longitude,
                        }}
                        title={pizzeria.name}
                        description={pizzeria.description}
                        pinColor={darkMode ? "#FF5733" : "#FF0000"}
                    >
                        {/* Info venster als je op de marker tikt */}
                        <Callout>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{pizzeria.name}</Text>
                                <Text>{pizzeria.city}, {pizzeria.province}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Toon een foutmelding indien aanwezig */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, darkMode ? styles.darkText : null]}>
                        {error}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    callout: {
        width: 150,
        padding: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    errorContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        padding: 10,
        backgroundColor: '#FFCDD2',
        borderRadius: 8,
    },
    errorText: {
        color: '#B71C1C',
        textAlign: 'center',
        fontSize: 14,
    },
    darkText: {
        color: '#ffffff',
    },
});
