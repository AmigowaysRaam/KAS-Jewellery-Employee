import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

// Summary Card Component with Icon and Animation
const SummaryCard = ({ title, value, color, icon, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
    const translateY = useRef(new Animated.Value(20)).current; // Start slightly down

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: index * 150, // stagger animation
            useNativeDriver: true,
        }).start();
        Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            delay: index * 150,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: color + "20" },
                { opacity: fadeAnim, transform: [{ translateY }] },
            ]}
        >
            <Text style={[styles.cardTitle, { color }]}>{title}</Text>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {icon}
                <Text style={[styles.cardValue, { color }]}>{value}</Text>
            </View>
        </Animated.View>
    );
};

// Main Attendance Summary
export default function AttendanceSummary({ summary }) {
    const data = [
        {
            title: "Present",
            value: summary.present,
            color: "#4CAF50",
            icon: <Ionicons name="checkmark-circle" size={wp(7)} color="#4CAF50" />,
        },
        {
            title: "Late",
            value: summary.late,
            color: "#FF9800",
            icon: <MaterialIcons name="access-time" size={wp(7)} color="#FF9800" />,
        },
        {
            title: "Absent",
            value: summary.absent,
            color: "#F44336",
            icon: <FontAwesome5 name="times-circle" size={wp(7)} color="#F44336" />,
        },
        {
            title: "Total Days",
            value: summary.total,
            color: COLORS.primary,
            icon: <Ionicons name="calendar" size={wp(7)} color={COLORS?.primary} />,
        },
    ];

    return (
        <View style={styles.summaryContainer}>
            {data.map((item, index) => (
                <SummaryCard
                    key={index}
                    title={item.title}
                    value={item.value}
                    color={item.color}
                    icon={item.icon}
                    index={index}
                />
            ))}
        </View>
    );
}
const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%", // smaller card
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: wp(3),
        marginBottom: hp(2),
    },
    cardValue: {
        fontSize: wp(8), // smaller font
        fontFamily: "Poppins_600SemiBold",
        marginVertical: hp(0.5),
    },
    cardTitle: {
        fontSize: wp(3.9), // smaller font
        fontFamily: "Poppins_600SemiBold",
    },
});
