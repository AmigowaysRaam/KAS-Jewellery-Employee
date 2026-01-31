import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions"; // adjust path if needed
import CommonHeader from "./CommonHeader";

export default function TermsScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <>
            <CommonHeader
                title={t('Terms & Conditions')}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ padding: wp(5) }}>
                <Text style={styles.header}>KAS Jewellery - Terms & Conditions</Text>
                <Text style={styles.subHeader}>
                    Please read these terms and conditions carefully before using the KAS Jewellery Employee App.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Use of App</Text>
                    <Text style={styles.sectionText}>
                        Employees are granted access to the app solely for internal purposes. Misuse or unauthorized access is prohibited.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Data Privacy</Text>
                    <Text style={styles.sectionText}>
                        All customer and product data accessed through this app must be handled confidentially and in compliance with company policies.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Intellectual Property</Text>
                    <Text style={styles.sectionText}>
                        All content, images, and information provided in the app are the property of KAS Jewellery and may not be reproduced without permission.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Liability</Text>
                    <Text style={styles.sectionText}>
                        KAS Jewellery is not responsible for any personal devices or data misuse outside the app’s intended use.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Updates</Text>
                    <Text style={styles.sectionText}>
                        Terms may be updated periodically. Employees are responsible for reviewing the latest version.
                    </Text>
                </View>

                <Text style={styles.footer}>
                    By using the KAS Jewellery Employee App, you agree to these Terms & Conditions.
                </Text>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || "#f9f9f9",
    },
    header: {
        fontSize: wp(6),
        fontWeight: "700",
        color: COLORS.primary || "#222",
        marginBottom: hp(1),
    },
    subHeader: {
        fontSize: wp(4),
        fontWeight: "500",
        color: "#555",
        marginBottom: hp(3),
    },
    section: {
        backgroundColor: "#fff",
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: "600",
        color: COLORS.primary || "#222",
        marginBottom: hp(0.5),
    },
    sectionText: {
        fontSize: wp(3.5),
        color: "#555",
        lineHeight: hp(2.2),
    },
    footer: {
        marginTop: hp(3),
        fontSize: wp(3.8),
        color: "#777",
        textAlign: "center",
    },
});
