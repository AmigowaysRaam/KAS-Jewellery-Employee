import React, { createContext, useContext, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { hp, wp } from "../app/resources/dimensions";
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const slideAnim = useRef(new Animated.Value(-hp(10))).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const showToast = (message, type = "info", duration = 2000) => {
        setToast({ message, type });

        // Show animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: hp(6),
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Hide animation
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -hp(10),
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setToast(null));
        }, duration);
    };

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return "checkmark-circle";
            case "error":
                return "close-circle";
            default:
                return "information-circle";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toast,
                        styles[toast.type],
                        {
                            transform: [{ translateY: slideAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    <Icon
                        name={getIcon(toast.type)}
                        size={wp(5)}
                        color="#fff"
                        style={styles.icon}
                    />
                    <Text numberOfLines={1} style={styles.text}>{toast.message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingVertical: wp(2),
        borderRadius: wp(10),
        zIndex: 9999,
        maxWidth: wp(90),
        // Shadow
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    text: {
        color: "#fff",
        fontSize: wp(3.6),
        fontFamily: "Poppins_400Regular",
        lineHeight: wp(6),
        maxWidth: wp(65),
    },
    icon: {
        marginRight: wp(2),
    },
    success: {
        backgroundColor: "#2ecc71",
    },
    error: {
        backgroundColor: "#e74c3c",
    },
    info: {
        backgroundColor: "#34495e",
    },
});
