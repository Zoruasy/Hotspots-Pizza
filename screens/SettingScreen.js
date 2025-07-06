import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from "react-native";
import React, { useContext, useState } from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { ThemeContext } from '../components/ThemeContext';
import { LanguageContext } from '../components/LanguageContext';
import { languageOptions } from '../translations/Languages';

export default function SettingsScreen() {
    // Haal dark mode state & toggle functie uit Themecontext
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);

    // Haal huidige taal en vertalingen op uit Languagecontext
    const { texts, currentLanguage, changeLanguage } = useContext(LanguageContext);

    // State om dropdown met talen te tonen/verbergen
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);


    const toggleLanguageSelector = () => {
        setShowLanguageSelector(!showLanguageSelector);
    };


    const selectLanguage = (languageCode) => {
        changeLanguage(languageCode);
        setShowLanguageSelector(false);
    };

    return (
        <ScrollView style={[styles.container, darkMode ? styles.darkContainer : null]}>
            {/* Titel van de pagina */}
            <Text style={[styles.heading, darkMode ? styles.darkText : null]}>
                {texts.settings}
            </Text>

            {/* Dark Mode Setting */}
            <View style={[styles.settingItem, darkMode ? styles.darkSettingItem : null]}>
                <View style={styles.settingInfo}>
                    <FontAwesome
                        name={darkMode ? "moon-o" : "sun-o"}
                        size={24}
                        color={darkMode ? "#fff" : "#000"}
                        style={styles.icon}
                    />
                    <Text style={[styles.settingText, darkMode ? styles.darkText : null]}>
                        {texts.darkMode}
                    </Text>
                </View>
                <Switch
                    value={darkMode}
                    onValueChange={toggleDarkMode}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
                />
            </View>

            {/* Taalkeuze Setting */}
            <TouchableOpacity
                style={[styles.settingItem, darkMode ? styles.darkSettingItem : null]}
                onPress={toggleLanguageSelector}
            >
                <View style={styles.settingInfo}>
                    <FontAwesome
                        name="language"
                        size={24}
                        color={darkMode ? "#fff" : "#000"}
                        style={styles.icon}
                    />
                    <Text style={[styles.settingText, darkMode ? styles.darkText : null]}>
                        {texts.language}
                    </Text>
                </View>
                <Text style={[styles.currentValueText, darkMode ? styles.darkText : null]}>
                    {/* Toon de naam van de huidige taal */}
                    {languageOptions.find(lang => lang.code === currentLanguage)?.label}
                </Text>
            </TouchableOpacity>

            {/* Dropdown met talen */}
            {showLanguageSelector && (
                <View style={[styles.languageSelector, darkMode ? styles.darkLanguageSelector : null]}>
                    {languageOptions.map((option) => (
                        <TouchableOpacity
                            key={option.code}
                            style={[
                                styles.languageOption,
                                darkMode ? styles.darkLanguageOption : null,
                                currentLanguage === option.code ? styles.selectedLanguage : null,
                                darkMode && currentLanguage === option.code ? styles.darkSelectedLanguage : null
                            ]}
                            onPress={() => selectLanguage(option.code)}
                        >
                            <Text style={[
                                styles.languageText,
                                darkMode ? styles.darkText : null,
                                currentLanguage === option.code ? styles.selectedLanguageText : null
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Opmerking onderaan */}
            <Text style={[styles.note, darkMode ? styles.darkNote : null]}>
                {texts.preferenceSaved}
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
        marginTop: 40
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginVertical: 10
    },
    darkSettingItem: {
        backgroundColor: '#333333'
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        marginRight: 10
    },
    settingText: {
        fontSize: 16
    },
    darkText: {
        color: '#ffffff'
    },
    note: {
        fontSize: 12,
        color: '#777',
        marginTop: 10,
        alignSelf: 'center'
    },
    darkNote: {
        color: '#aaa'
    },
    currentValueText: {
        fontSize: 14,
        color: '#666'
    },
    languageSelector: {
        backgroundColor: '#e8e8e8',
        borderRadius: 10,
        marginTop: -5,
        marginBottom: 15,
        overflow: 'hidden'
    },
    darkLanguageSelector: {
        backgroundColor: '#2a2a2a'
    },
    languageOption: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    darkLanguageOption: {
        borderBottomColor: '#444'
    },
    selectedLanguage: {
        backgroundColor: '#81b0ff40'
    },
    darkSelectedLanguage: {
        backgroundColor: '#81b0ff30'
    },
    languageText: {
        fontSize: 16
    },
    selectedLanguageText: {
        fontWeight: 'bold'
    }
});
