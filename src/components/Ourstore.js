import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions"; // adjust path if needed
import CommonHeader from "./CommonHeader";

export default function OurStoreScreen() {
    const navigation = useNavigation()
    const { t } = useTranslation();
    return (
        <>
            <CommonHeader
                title={t('Our Store')}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ padding: wp(5) }}>
                <Text style={styles.header}>KAS Jewellery</Text>
                <Text style={styles.subHeader}>
                    Explore our exclusive collections and offerings for our valued customers.
                </Text>

                {/* Collection Items */}
                <View style={styles.menuItem}>
                    <Text style={styles.menuTitle}>Gold Jewelry</Text>
                    <Text style={styles.menuDesc}>Elegant gold necklaces, bangles, and rings crafted to perfection.</Text>
                </View>

                <View style={styles.menuItem}>
                    <Text style={styles.menuTitle}>Diamond Collection</Text>
                    <Text style={styles.menuDesc}>Premium diamond rings, pendants, and earrings for special occasions.</Text>
                </View>

                <View style={styles.menuItem}>
                    <Text style={styles.menuTitle}>Platinum & Silver</Text>
                    <Text style={styles.menuDesc}>High-quality platinum and silver jewelry for everyday elegance.</Text>
                </View>

                <View style={styles.menuItem}>
                    <Text style={styles.menuTitle}>Wedding & Engagement</Text>
                    <Text style={styles.menuDesc}>Exclusive rings, sets, and bridal collections for weddings and engagements.</Text>
                </View>

                <View style={styles.menuItem}>
                    <Text style={styles.menuTitle}>Custom Designs</Text>
                    <Text style={styles.menuDesc}>Work with our expert designers to create personalized jewelry pieces.</Text>
                </View>

                <Text style={styles.footer}>
                    Employees can view product details, track inventory, and assist customers effectively.
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
    menuItem: {
        backgroundColor: "#fff",
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuTitle: {
        fontSize: wp(4.5),
        fontWeight: "600",
        color: COLORS.primary || "#222",
        marginBottom: hp(0.5),
    },
    menuDesc: {
        fontSize: wp(3.5),
        color: "#555",
    },
    footer: {
        marginTop: hp(3),
        fontSize: wp(3.8),
        color: "#777",
        textAlign: "center",
    },
});
