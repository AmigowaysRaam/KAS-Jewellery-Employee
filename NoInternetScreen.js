import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    Linking, Platform,
    StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { wp } from "./app/resources/dimensions";
const NoInternetScreen = ({ onRetry }) => {
    const openNetworkSettings = async () => {
        try {
            if (Platform.OS === "ios") {
                // Opens WiFi settings (most reliable for iOS)
                await Linking.openURL("App-Prefs:root=WIFI");
            } else {
                // Opens Internet / Network settings on Android
                await Linking.sendIntent("android.settings.WIRELESS_SETTINGS");
            }
        } catch (error) {
            console.log("Error opening network settings:", error);
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="wifi-off" size={60} color="#FF4D4D" />
                </View>

                <Text style={styles.title}>No Internet Connection</Text>

                <Text style={styles.subtitle}>
                    Your device is not connected to the internet.
                    Please check your WiFi or mobile data settings.
                </Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={openNetworkSettings}>
                        <Text style={styles.settingsText}>Open Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
export default NoInternetScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ff0000" + '90',
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    card: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 25,
        alignItems: "center",
        // Shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow (Android)
        elevation: 6,
    },

    iconContainer: {
        backgroundColor: "#FFE5E5",
        padding: 20,
        borderRadius: wp(20),
        marginBottom: 20,
        borderWidth: wp(1), borderColor: "#FF0000"
    },

    title: {
        fontSize: 20,
        fontFamily: "Poppins_600SemiBold",
        color: "#D8000C",
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "#666",
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 20,
    },

    buttonRow: {
        width: "100%",
    },

    retryButton: {
        backgroundColor: "#D8000C",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },

    retryText: {
        color: "#FFF",
        fontFamily: "Poppins_500Medium",
        fontSize: 14,
    },

    settingsButton: {
        borderWidth: 1,
        borderColor: "#D8000C",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    settingsText: {
        color: "#D8000C",
        fontFamily: "Poppins_500Medium",
        fontSize: 14,
    },
});