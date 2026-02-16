import React, { useEffect, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const ViewButton = ({ onPress, label = "View", priority = "Low", status}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Priority config
    const getPriorityConfig = (level) => {
        switch (level) {
            case "Critical":
                return { color: "#ff0000", icon: "alert-octagon" };
            case "High":
                return { color: "#E74C3C", icon: "alert-circle" };
            case "Medium":
                return { color: "#F39C12", icon: "alert-triangle" };
            case "Low":
                return { color: "#2ECC71", icon: "check-circle" };
            default:
                return { color: "#9E9E9E", icon: "info" };
        }
    };

    const { color: priorityColor, icon: priorityIcon } = getPriorityConfig(priority);

    // Press animations
    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.96,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    };
    const taskCompStatus = status;

    // Critical animation
    useEffect(() => {
        if (priority === "Critical" && status) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [priority]);

    const pulseStyle = {
        ...StyleSheet.absoluteFillObject,
        borderRadius: wp(2),
        backgroundColor: "red",
        opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.7],
        }),
        shadowColor: "red",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.9],
        }),
        shadowRadius: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 20],
        }),
    };

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.priorityChip,
                    {
                        backgroundColor: `${priorityColor}18`,
                        borderColor: priorityColor,
                    },
                ]}
            >
                {priority === "Critical" && <Animated.View style={[pulseStyle, { zIndex: 9999 }]} />}
                <Icon
                    name={priorityIcon}
                    type="feather"
                    size={wp(3.8)}
                    color={priorityColor}
                />
                <Text style={[styles.priorityText, { color: priority === "Critical" ? "#ff0000" : priorityColor }]}>
                    {priority}
                </Text>
            </View>

            {/* -------- View Button -------- */}
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={styles.buttonWrapper}
            >
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    {/* Left Icon */}
                    <Icon
                        name="eye"
                        type="feather"
                        size={wp(4.8)}
                        color={COLORS.white}
                    />

                    {/* Label */}
                    <Text style={styles.buttonText}>{label}</Text>

                    {/* Arrow */}
                    <Icon
                        name="arrow-right"
                        type="feather"
                        size={wp(4.5)}
                        color={COLORS.white}
                    />
                </Animated.View>
            </Pressable>
        </View>
    );
};

export default ViewButton;

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp(1.8),
        justifyContent: "space-between",
    },
    priorityChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: hp(3.2),
        paddingVertical: hp(1.5),
        borderRadius: wp(3),
        marginRight: wp(3),
        borderWidth: wp(0.5),
        width: "45%",
    },
    priorityText: {
        marginLeft: wp(1.5),
        fontSize: wp(3),
        fontFamily: "Poppins_600SemiBold",
        letterSpacing: 0.6,
        textTransform: "uppercase", lineHeight: wp(4.5)
    },
    buttonWrapper: {
        flex: 1,
        borderRadius: wp(3),
        overflow: "hidden",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // center everything
        backgroundColor: COLORS.primary || "#3A7AFE",
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(5),
        borderRadius: wp(3),
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        width: "100%",
    },
    buttonText: {
        flex: 1,
        textAlign: "center", // center text
        color: COLORS.white,
        fontSize: wp(3.8),
        fontFamily: "Poppins_600SemiBold",
        letterSpacing: 0.5,
        marginHorizontal: wp(2),
    },
});
