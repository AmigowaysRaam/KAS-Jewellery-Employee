import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions"; // adjust path if needed
import CommonHeader from "./CommonHeader";

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <>
            <CommonHeader
                title={t('Privacy Policy')}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ padding: wp(5) }}>
                <Text style={styles.header}>KAS Jewellery - Privacy Policy</Text>
                <Text style={styles.subHeader}>
                    Your privacy is important to us. This policy explains how we handle employee and customer data in the KAS Jewellery Employee App.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Information Collection</Text>
                    <Text style={styles.sectionText}>
                        We collect only the data necessary to perform your employee duties, such as product information, customer interactions, and app usage.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Use of Information</Text>
                    <Text style={styles.sectionText}>
                        The collected data is used to improve operations, assist customers, and track inventory. Employee data is used internally for management purposes only.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Data Protection</Text>
                    <Text style={styles.sectionText}>
                        We implement security measures to protect data against unauthorized access, alteration, or disclosure. Personal employee data is kept confidential.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Sharing of Data</Text>
                    <Text style={styles.sectionText}>
                        Employee and customer data will not be shared with third parties except as required by law or approved by management.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Updates</Text>
                    <Text style={styles.sectionText}>
                        This privacy policy may be updated periodically. Employees are responsible for reviewing the latest version within the app.
                    </Text>
                </View>

                <Text style={styles.footer}>
                    By using the KAS Jewellery Employee App, you agree to this Privacy Policy.
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
