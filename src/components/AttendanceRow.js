// AttendanceRow.js
import dayjs from "dayjs";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const DETAIL_ITEMS = [
    { key: "login_time", label: "Log In Time", icon: require("../../assets/loginicon.png"), bgColor: "#008000", tColor: "#fff" },
    { key: "logout_time", label: "Log Out Time", icon: require("../../assets/logouticon.png"), bgColor: "#B81A19", tColor: "#fff" },
    { key: "morning_tea_break", label: "Morning Tea Break", icon: require("../../assets/morgnteaBreak.png.png"), bgColor: "#FE7E5B", tColor: "#fff" },
    { key: "lunch_break", label: "Lunch Break", icon: require("../../assets/lBreak.png"), bgColor: "#FF4433", tColor: "#fff" },
    { key: "evening_tea_break", label: "Evening Tea Break", icon: require("../../assets/eveningteaBreak.png"), bgColor: "#FF5A58", tColor: "#fff" },
    { key: "today_working_hour", label: "Today Working Hour", icon: require("../../assets/totalWork.png"), bgColor: "#A40033", tColor: "#fff" },
];

export default function AttendanceRow({ item, expandedItem, setExpandedItem, onRowPress }) {
    const isExpanded = expandedItem === item.date;

    const handlePress = () => {
        setExpandedItem(isExpanded ? null : item.date);
        if (onRowPress) {
            onRowPress(item.date); // notify parent
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Present": return "#2E7D32";
            case "Late": return "#F57C00";
            default: return "#D32F2F";
        }
    };

    const rowOpacity = expandedItem && !isExpanded ? 0.6 : 1;

    return (
        <View style={{
            marginHorizontal: wp(2),
            marginTop: wp(2),
            opacity: rowOpacity,
            transform: [{ scale: isExpanded ? 1.03 : 1 }],
        }}>
            <View
                style={{
                    borderBottomWidth: isExpanded ? 0 : wp(0.3),
                    borderBottomColor: "#ccc",
                    borderRadius: isExpanded ? wp(2) : 0,
                    overflow: "hidden",
                }}
            >
                <Pressable
                    onPress={handlePress}  // row press triggers parent scroll
                    style={{
                        flexDirection: "row",
                        paddingVertical: hp(1.5),
                        backgroundColor: isExpanded ? "#FFE4DE" : "#FFF",
                        borderWidth: isExpanded ? wp(0.5) : 0,
                        borderColor: COLORS.primary,
                        borderRadius: isExpanded ? wp(2) : 0,
                    }}
                >
                    <Text style={styles.cell}>{dayjs(item.date).format("DD MMM")}</Text>
                    <Text style={styles.cell}>{dayjs(item.date).format("ddd")}</Text>
                    <Text style={styles.cell}>{item.login}</Text>
                    <Text style={styles.cell}>{item.logout}</Text>
                    <Text style={[styles.cell, {
                        color: getStatusColor(item.status),
                        textShadowColor: "#555",
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 0.5,
                    }]}>{item.status}</Text>
                </Pressable>
            </View>

            {isExpanded && (
                <View style={[styles.expandedContainer]}>
                    <View style={styles.gridContainer}>
                        {DETAIL_ITEMS.map((detail) => (
                            <View key={detail.key} style={[styles.detailRow, { backgroundColor: detail.bgColor }]}>
                                <Image source={detail.icon} style={{ width: wp(8), height: wp(8), marginRight: wp(2) }} />
                                <View>
                                    <Text style={[styles.detailLabel, { color: detail?.tColor }]}>{detail.label}</Text>
                                    <Text style={[styles.detailValue, { color: detail?.tColor || COLORS.black }]}>{item.details[detail.key]}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cell: { flex: 1, textAlign: "center", fontSize: wp(3.5), color: COLORS.black, fontFamily: "Poppins_400Regular" },
    expandedContainer: { paddingHorizontal: wp(2), paddingVertical: hp(0.5), backgroundColor: "#F9F9F9", borderRadius: wp(2), marginTop: hp(0.5) },
    gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: wp(1) },
    detailRow: {
        width: "49%",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hp(1),
        paddingHorizontal: wp(0.5),
        borderRadius: wp(2),
        borderWidth: wp(0.4),
        borderColor: "#c9c9c9"
    },
    detailLabel: { flex: 1, fontSize: wp(3), color: COLORS.black, fontFamily: "Poppins_400Regular" },
    detailValue: { fontSize: wp(3.5), fontFamily: "Poppins_600SemiBold" },
});