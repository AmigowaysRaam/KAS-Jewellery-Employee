import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

export default function SettingsScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <CommonHeader title="Settings" showBackButton onBackPress={() => { navigation?.goBack(); }} />
            <View style={styles.content}>
                <Text style={styles.text}>Settings are under development. Stay tuned!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || "#f9f9f9",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: wp(5),
    },
    text: {
        fontSize: wp(4),
        color: "#555",
        textAlign: "center",
    },
});
