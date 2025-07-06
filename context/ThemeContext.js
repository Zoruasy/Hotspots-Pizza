import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('darkMode');
                if (storedTheme !== null) {
                    setIsDarkMode(JSON.parse(storedTheme));
                }
            } catch (error) {
                console.error('Failed to load theme from storage', error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        try {
            const newValue = !isDarkMode;
            setIsDarkMode(newValue);
            await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);