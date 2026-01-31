import React, { useRef } from "react";
import {
    Animated, ImageBackground, Pressable, StyleSheet,
    Text, View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const ViewButton = ({ onPress, label = "View", priority = "Low" }) => {
    const bgImage = require("../../assets/bottomTabBg.png");
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const getPriorityConfig = (level) => {
        switch (level) {
            case "Critical":
                return { color: "#C0392B", icon: "x-octagon" }; // very urgent
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
    const { color: priorityColor, icon: priorityIcon } =
        getPriorityConfig(priority);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                speed: 25,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                speed: 20,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={styles.wrapper}>
            {/* Priority Badge */}
            <View
                style={[
                    styles.priorityBadge,
                    {
                        borderColor: priorityColor,
                        backgroundColor: `${priorityColor}15`,
                    },
                ]}
            >
                <Icon
                    name={priorityIcon}
                    type="feather"
                    size={wp(3.6)}
                    color={priorityColor}
                    style={styles.priorityIcon}
                />

                <Text
                    style={[
                        styles.priorityText,
                        { color: priorityColor },
                    ]}
                >
                    {priority}
                </Text>
            </View>

            {/* View Button */}
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "rgba(255,255,255,0.15)" }}
                style={styles.buttonWrapper}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }}
                >
                    <ImageBackground
                        source={bgImage}
                        resizeMode="stretch"
                        style={styles.buttonContainer}
                        imageStyle={styles.imageRadius}
                    >
                        {/* Overlays */}
                        <View style={styles.overlay} />
                        <View style={styles.highlightOverlay} />

                        {/* Left icon */}
                        <Icon
                            name="eye"
                            type="feather"
                            size={wp(5)}
                            color={COLORS.white}
                            style={styles.icon}
                        />

                        {/* Label */}
                        <Text style={styles.buttonText}>{label}</Text>

                        {/* Right arrow */}
                        <Icon
                            name="chevron-right"
                            type="feather"
                            size={wp(5)}
                            color={COLORS.white}
                            style={styles.arrowIcon}
                        />
                    </ImageBackground>
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
        marginTop: hp(2),
    },

    /* ---------------- Priority Badge ---------------- */

    priorityBadge: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: wp(3),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.7),
        borderRadius: wp(6),
        borderWidth: 1,
    },

    priorityIcon: {
        marginRight: wp(1.2),
    },

    priorityText: {
        fontSize: wp(3),
        fontFamily: "Poppins_500Medium",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    buttonWrapper: {
        flex: 1,
        borderRadius: wp(1),
        overflow: "hidden",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: wp(4.5),
        paddingVertical: hp(1.2),
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    imageRadius: {
        borderRadius: wp(1),
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.22)",
    },
    highlightOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    icon: {
        marginRight: wp(2),
    },
    arrowIcon: {
        marginLeft: wp(2),
        opacity: 0.9,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: wp(4),
        fontFamily: "Poppins_500Medium",
        letterSpacing: 0.7,
    },
});