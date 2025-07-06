// ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

//  Hiermee kan elke component in de app
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Hier slaan we op of dark mode aan staat (true) of uit (false)
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Laad dark mode-voorkeur zodra app start
        loadThemePreference();
    }, []);

    // darmode uit async halen
    const loadThemePreference = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('darkmode-preference');
            const savedDarkMode = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (savedDarkMode !== null) {
                setDarkMode(savedDarkMode);
            }
        } catch (error) {
            console.error("Could not load theme preference", error);
        }
    };

   // zet darkmode aan of uit
    const toggleDarkMode = async () => {
        try {
            const newDarkMode = !darkMode;
            setDarkMode(newDarkMode);
            const jsonValue = JSON.stringify(newDarkMode);
            await AsyncStorage.setItem('darkmode-preference', jsonValue);
        } catch (error) {
            console.error("Could not save theme preference", error);
        }
    };

    // - darkMode: true of false
    // - toggleDarkMode: functie om dark mode aan/uit te zetten
    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
