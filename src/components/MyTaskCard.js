import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ViewButton from "./ViewBtn";
// Dummy avatar image
const TaskCard = ({
    item,
    t,
    navigation,
    openTaskModal,
    getStatusColor,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    // "assigned_by_employee_photo": "",
    // "assigned_by_employee_name": "testinuser",
    // "assigned_by_employee_phone_number": "9999999999",
    // "assigned_by_employee_id": "EMP6",
    useEffect(() => {
        console.log(JSON.stringify(item, null, 2), "MyTaskCard");
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
                        <Image source={{ uri: item?.assigned_by_employee_photo }} style={styles.avatar} />
                        <View>
                            <Text style={styles.assignedText}>
                                {item?.assigned_by_employee_name}{item?.assigned_by_employee_id ?
                                    ` (${item.assigned_by_employee_id})` : ""}
                            </Text>
                            <Text style={{ fontSize: wp(2.9) }}>
                                {item?.assigned_by_employee_phone_number || t("No Phone")}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.divider} />
                {/* Date Section */}
                {/* Dates */}
                <View style={styles.dateRow}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>
                            {t("assigned_date")}
                        </Text>
                        <Text numberOfLines={1} style={styles.dateText}>
                            {item.assigned_date?.split(" ")[0]}
                        </Text>
                    </View>

                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>
                            {t("due_date")}
                        </Text>
                        <Text numberOfLines={1} style={styles.dateText}>
                            {item.due_date?.split(" ")[0]}
                        </Text>
                    </View>
                </View>
                {/* Button */}
                <View style={{ marginTop: hp(0.5) }}>
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
export default React.memo(TaskCard);
const styles = StyleSheet.create({
    animatedContainer: { marginHorizontal: wp(4), marginBottom: hp(2), }, card: {
        backgroundColor: "#fff", padding: wp(4),
        borderRadius: wp(3), borderLeftWidth: wp(1), shadowColor: "#000", shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 }, shadowRadius: 8, elevation: 4,
    }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
    taskTitle: {
        fontSize: wp(4.2), fontFamily: "Poppins_600SemiBold", flex: 1, color: "#1e1e1e",
        marginRight: wp(2),
    }, statusBadge: {
        paddingHorizontal: wp(3), paddingVertical: hp(0.6), borderRadius: wp(5),
        minWidth: wp(18), alignItems: "center",
    }, statusText: {
        color: "#fff", fontSize: wp(3), fontFamily: "Poppins_500Medium", lineHeight: wp(4)
    }, assignedRow: { flexDirection: "row", alignItems: "center", marginTop: hp(1.2), },
    avatar: {
        width: wp(10), height: wp(10), borderRadius: wp(5),
        marginRight: wp(2), backgroundColor: "#ccc",
    }, assignedText: { fontSize: wp(3.2), color: "#555", fontFamily: "Poppins_400Regular", },
    divider: {
        height: 1, backgroundColor: COLORS?.primary + '80',
        marginVertical: hp(1.5),
    }, dateRow: {
        flexDirection: "row", justifyContent: "space-between",
    }, dateBox: {
        backgroundColor: "#f8f9fb", padding: wp(3),
        borderRadius: wp(2), flex: 1, marginRight: wp(2),
    },
    dateLabel: {
        fontSize: wp(3), color: "#777", marginBottom: hp(0.5),
        fontFamily: "Poppins_400Regular", alignSelf: "center"
    },
    dateText: {
        fontSize: wp(4.5), color: "#333",
        fontFamily: "Poppins_700Bold", alignSelf: "center", lineHeight: wp(5.8)
    },
});
