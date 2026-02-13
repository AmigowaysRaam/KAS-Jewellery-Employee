import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { hp, wp } from "../../app/resources/dimensions";
import ViewButton from "./ViewBtn";
// Dummy avatar image
const avatar = require("../../assets/menu.png");
const AssignedTaskCard = ({
    item,
    t,
    navigation,
    openTaskModal,
    getStatusColor,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Dummy Assigned By Data
    const assignedBy = {
        name: "John Anderson",
        avatar: avatar,
    };
    useEffect(() => {
        console.log(item.priority == 'Critical')
    }, [])
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };
    return (
        <Animated.View
            style={[
                styles.animatedContainer,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <Pressable
                android_ripple={{ color: "#eee" }}
                onPress={() => openTaskModal(item)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.card,
                    {
                        borderLeftColor: getStatusColor(item.status),
                    },
                ]}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <Text numberOfLines={1} style={styles.taskTitle}>
                        {item.title || t("Untitled Task")}
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(item.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                {/* Assigned By Section */}
                <View style={styles.assignedRow}>
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        <Image source={assignedBy.avatar} style={styles.avatar} />
                        <View>
                            <Text style={styles.assignedText}>
                                {assignedBy.name}
                            </Text>
                            <Text style={{ fontSize: wp(2.9) }}>
                                {'Emp-id: 12345'}
                            </Text>
                        </View>
                    </View>

                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Date Section */}
                <View style={styles.dateRow}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>{t("assigned_date")}</Text>
                        <Text numberOfLines={1} style={styles.dateText}>
                            {item.assigned_date}
                        </Text>
                    </View>

                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>{t("due_date")}</Text>
                        <Text numberOfLines={1} style={styles.dateText}>
                            {item.due_date}
                        </Text>
                    </View>
                </View>
                {/* Button */}
                <View style={{ marginTop: hp(1.5) }}>
                    <ViewButton
                        priority={item.priority}
                        onPress={() =>
                            navigation?.navigate("TasKDetailById", { task: item })
                        }
                        label={t("View")}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
};
export default React.memo(AssignedTaskCard);
const styles = StyleSheet.create({
    animatedContainer: {
        marginHorizontal: wp(4), marginBottom: hp(2),
    },
    card: {
        backgroundColor: "#fff", padding: wp(4),
        borderRadius: wp(3), borderLeftWidth: wp(1), shadowColor: "#000", shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 }, shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
    taskTitle: {
        fontSize: wp(4.2), fontFamily: "Poppins_600SemiBold", flex: 1, color: "#1e1e1e",
        marginRight: wp(2),
    }, statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.6), borderRadius: wp(5),
        minWidth: wp(18), alignItems: "center",
    },

    statusText: {
        color: "#fff",
        fontSize: wp(3),
        fontFamily: "Poppins_500Medium",lineHeight: wp(4)
    },

    assignedRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp(1.2),
    },

    avatar: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        marginRight: wp(2),
    },

    assignedText: {
        fontSize: wp(3.2),
        color: "#555",
        fontFamily: "Poppins_400Regular",
    },

    divider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginVertical: hp(1.5),
    },

    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    dateBox: {
        backgroundColor: "#f8f9fb",
        padding: wp(3),
        borderRadius: wp(2),
        flex: 1,
        marginRight: wp(2),
    },

    dateLabel: {
        fontSize: wp(3),
        color: "#777",
        marginBottom: hp(0.5),
        fontFamily: "Poppins_400Regular",
    },

    dateText: {
        fontSize: wp(3.5),
        color: "#333",
        fontFamily: "Poppins_500Medium",
    },
});
