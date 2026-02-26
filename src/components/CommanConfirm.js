import React from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function CommanConfirmModal({
    visible,
    title = "Are you sure?",
    onConfirm,
    onClose,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
}) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title} numberOfLines={2}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.divider} />

                            {/* Actions */}
                            <View style={styles.actions}>

                                {/* Cancel Button */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.cancelButton,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={onClose}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelText}>
                                        {cancelText}
                                    </Text>
                                </Pressable>

                                {/* Confirm Button */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.confirmButton,
                                        loading && styles.disabledButton,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={onConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmText}>
                                            {confirmText}
                                        </Text>
                                    )}
                                </Pressable>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wp(6),
    },
    container: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: wp(5),
        paddingVertical: hp(2.5),
        paddingHorizontal: wp(5),
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        flex: 1,
        fontSize: wp(4.8),
        fontFamily: "Poppins_600SemiBold",
        color: "#222",
        marginRight: wp(2),
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: hp(2),
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cancelButton: {
        flex: 1,
        marginRight: wp(2),
        paddingVertical: hp(1.6),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
    },
    confirmButton: {
        flex: 1,
        marginLeft: wp(2),
        paddingVertical: hp(1.6),
        borderRadius: wp(3),
        alignItems: "center",
        backgroundColor: COLORS.primary,
    },
    disabledButton: {
        backgroundColor: "#999",
    },
    cancelText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        color: "#555",
    },
    confirmText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        color: "#fff",
    },
    buttonPressed: {
        opacity: 0.8,
    },
});