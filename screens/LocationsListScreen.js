import React, {useContext, useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LibrariesContext} from '../components/Libraries';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from "../components/NavBar";

export default function LocationsListScreen() {
    // Haal de lijst met bibliotheken
    const {libraries} = useContext(LibrariesContext);

    // React n hook om te navigeren
    const navigation = useNavigation();

    // Favoriete bibliotheek-ID's
    const [favorites, setFavorites] = useState([]);

    // Bij laden van het scherm: haal opgeslagen favorieten op uit Asyncstorage
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const storedFavorites = await AsyncStorage.getItem('favorites');
                if (storedFavorites) {
                    setFavorites(JSON.parse(storedFavorites));
                }
            } catch (e) {
                console.error('Fout bij laden favorieten', e);
            }
        };
        loadFavorites();
    }, []);


    const toggleFavorite = async (id) => {
        let updatedFavorites = [];

        if (favorites.includes(id)) {
            // Als bibliotheek al favoriet is: verwijder uit favorieten
            updatedFavorites = favorites.filter((favId) => favId !== id);
        } else {
            // Anders: voeg toe aan favorieten
            updatedFavorites = [...favorites, id];
        }

        setFavorites(updatedFavorites);
        // Bewaar de nieuwe lijst in Asyncstorage
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            {/* Header met terugknop */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#333"/>
                    <Text style={styles.backText}>Terug naar kaart</Text>
                </TouchableOpacity>
            </View>

            {/* ScrollView met alle bibliotheken */}
            <ScrollView contentContainerStyle={styles.container}>
                {libraries.map((item) => {
                    // Controleer of bibliotheek favoriet is
                    const isFavorite = favorites.includes(item.id);

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemContainer}
                            onPress={() => navigation.navigate('Map', {selectedLibrary: item})}
                        >
                            <View style={styles.itemHeader}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.address}>{item.address}</Text>
                                </View>
                                {/* Harticoon om favoriet aan/uit te zetten */}
                                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                                    <Icon
                                        name="heart"
                                        size={24}
                                        color={isFavorite ? 'red' : '#ccc'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Navigatiebalk onderaan */}
            <NavBar/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#79a78b',
        backgroundColor: '#79a78b',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#1d140d',
    },
    container: {
        padding: 16,
        paddingBottom: 40,
        marginBottom: 40,
        backgroundColor: '#70665a',
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});
