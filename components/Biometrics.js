import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export const authenticateWithBiometrics = async () => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            Alert.alert('Biometrische beveiliging niet beschikbaar');
            return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Bevestig je identiteit',
            fallbackLabel: 'Voer toegangscode in',
        });

        if (result.success) {
            return true;
        } else {
            Alert.alert('Authenticatie mislukt', result.error);
            return false;
        }
    } catch (error) {
        Alert.alert('Fout tijdens authenticatie', error.message);
        return false;
    }
};