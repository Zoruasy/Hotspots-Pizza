import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import { ThemeContext } from '../components/ThemeContext';

export default function MapScreen({ route, navigation }) {
    const [pizzerias, setPizzerias] = useState([]);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const mapRef = useRef(null);
    const { darkMode } = useContext(ThemeContext);

    const selectedPizzeria = route.params?.selectedHall;

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermission(status === 'granted');

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });

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

    const fetchPizzerias = async () => {
        try {
            const response = await fetch('https://zoruasy.github.io/pizzaria-hotspots/pizzarias.json');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

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

    const initialRegion = userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }
        : {
            latitude: 52.1326,
            longitude: 5.2913,
            latitudeDelta: 3.0,
            longitudeDelta: 3.0,
        };

    return (
        <View style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={locationPermission}
                showsCompass={true}
                showsMyLocationButton={true}
                userInterfaceStyle={darkMode ? 'dark' : 'light'}
            >
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
                        <Callout>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{pizzeria.name}</Text>
                                <Text>{pizzeria.city}, {pizzeria.province}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
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
