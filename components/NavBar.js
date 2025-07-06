import { Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Tab = createBottomTabNavigator();

const getIconName = (routeName, focused) => {
    const icons = {
        Home: focused ? 'home' : 'home-outline',
        List: focused ? 'pizza' : 'pizza-outline',
        Map: focused ? 'map' : 'map-outline',
    };
    return icons[routeName];
};

export default function NavBar({ navigation }) {
    const { darkMode } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons name={getIconName(route.name, focused)} size={size} color={color} />
                ),
                tabBarStyle: [styles.tabBar, darkMode ? styles.darkTabBar : null],
                tabBarActiveTintColor: darkMode ? '#FF6B6B' : '#FF4444',
                tabBarInactiveTintColor: darkMode ? '#888' : '#888',
                headerStyle: [styles.header, darkMode ? styles.darkHeader : null],
                headerTitleStyle: darkMode ? styles.darkHeaderTitle : null,
                headerRight: () => (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Settings');
                        }}
                        style={({ pressed }) => [
                            {
                                marginRight: 15,
                                opacity: pressed ? 0.7 : 1,
                            },
                        ]}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color={darkMode ? "#fff" : "black"}
                        />
                    </Pressable>
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    headerTitle: 'Pizzeria Hotspots',
                }}
            />
            <Tab.Screen
                name="List"
                component={ListScreen}
                options={{
                    tabBarLabel: 'Pizza\'s',
                    headerTitle: 'Alle Pizzeria\'s',
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    tabBarLabel: 'Kaart',
                    headerTitle: 'Pizzeria\'s op de kaart',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#ddd',
        height: 80,
        paddingTop: 5,
        paddingBottom: 5,
    },
    darkTabBar: {
        backgroundColor: '#1f1f1f',
        borderTopColor: '#333',
    },
    header: {
        backgroundColor: '#fff',
    },
    darkHeader: {
        backgroundColor: '#1f1f1f',
    },
    darkHeaderTitle: {
        color: '#fff',
    },
});