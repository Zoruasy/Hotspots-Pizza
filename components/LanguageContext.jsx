import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../translations/Languages';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Hier onthouden we welke taal op dit moment actief is
    const [currentLanguage, setCurrentLanguage] = useState('en');

    // Hier staan de teksten (vertalingen) van de gekozen taal
    const [texts, setTexts] = useState(translations.en);

    useEffect(() => {
        // Bij opstarten: laad eventueel eerder opgeslagen taalvoorkeur
        const loadLanguagePreference = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('app-language');
                if (savedLanguage !== null) {
                    setCurrentLanguage(savedLanguage);
                    setTexts(translations[savedLanguage]);
                }
            } catch (error) {
                console.error('Failed to load language preference', error);
            }
        };

        loadLanguagePreference();
    }, []);

    const changeLanguage = async (languageCode) => {
        try {
            // Check of deze taal wel bestaat in onze vertalingen
            if (!translations[languageCode]) {
                console.error('Invalid language code:', languageCode);
                return;
            }

            // Pas de taal in de state aan
            setCurrentLanguage(languageCode);
            setTexts(translations[languageCode]);

            // Sla de keuze op zodat die behouden blijft na afsluiten app
            await AsyncStorage.setItem('app-language', languageCode);
        } catch (error) {
            console.error('Failed to save language preference', error);
        }
    };

    return (
        <LanguageContext.Provider
            value={{
                texts,             // Alle vertaalde teksten
                currentLanguage,   // Huidige taalcode ('en', 'nl', etc.)
                changeLanguage     // Functie om taal te wijzigen
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};
