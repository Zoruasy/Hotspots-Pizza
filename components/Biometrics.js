import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

/**
 * Voert biometrische authenticatie uit.
 * - Checkt eerst of je toestel biometrische hardware heeft.
 * - Checkt of er biometrische gegevens zijn ingesteld (vingerafdruk, FaceID, etc.).
 * - Vraagt de gebruiker om authenticatie.
 * Geeft true terug als authenticatie slaagt, anders false.
 */
export const authenticateWithBiometrics = async () => {
    try {
        // Check of toestel biometrische hardware heeft (bijv. vingerafdrukscanner of FaceID)
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        // Check of gebruiker biometrische gegevens heeft ingesteld
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            // Er is geen biometrische hardware, of gebruiker heeft niks ingesteld
            Alert.alert('Biometrische beveiliging niet beschikbaar');
            return false;
        }

        // Probeer gebruiker te authenticeren
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Bevestig je identiteit',      // Tekst die in de biometrische prompt verschijnt
            fallbackLabel: 'Voer toegangscode in',        // Alternatieve tekst als biometrie faalt
        });

        if (result.success) {
            // Authenticatie is geslaagd
            return true;
        } else {
            // Authenticatie is niet gelukt
            Alert.alert('Authenticatie mislukt', result.error);
            return false;
        }
    } catch (error) {
        // Iets ging fout, geeft error message
        Alert.alert('Fout tijdens authenticatie', error.message);
        return false;
    }
};
