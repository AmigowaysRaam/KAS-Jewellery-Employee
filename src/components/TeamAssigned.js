import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Easing,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function TeamAssigned({ teamMembers }) {
    const [modalVisible, setModalVisible] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const { t } = useTranslation();

    const teamUsers = teamMembers || [];

    useEffect(() => { }, [teamUsers]);

    if (!teamUsers) return null;

    const openModal = () => {
        scaleAnim.setValue(0.8);
        opacityAnim.setValue(0);

        setModalVisible(true);

        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setModalVisible(false));
    };

    const maxVisible = 4;

    const horizontalData =
        teamUsers.length > maxVisible
            ? [
                ...teamUsers.slice(0, maxVisible - 1),
                {
                    isExtra: true,
                    extraCount: teamUsers.length - (maxVisible - 1),
                },
            ]
            : teamUsers;

    return (
        <View style={{ marginHorizontal: hp(0.1), marginBottom: wp(1), }}>
            <Text style={styles.modalTitle}>{t("members")}</Text>

            {/* Horizontal List */}
            <FlatList
                data={horizontalData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                    item.employee_id || index.toString()
                }
                renderItem={({ item }) => {
                    if (item.isExtra) {
                        return (
                            <Pressable onPress={openModal} style={styles.memberItem}>
                                <View style={styles.extraCircle}>
                                    <Text style={styles.extraText}>{`+${item.extraCount}`}</Text>
                                </View>
                                <Text style={styles.memberText}>View</Text>
                            </Pressable>
                        );
                    }

                    return (
                        <Pressable onPress={openModal} style={styles.memberItem}>
                            <Image source={{ uri: item.photo }} style={styles.memberImage} />
                            <Text style={styles.memberText} numberOfLines={1}>
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* Modal */}
            <Modal transparent visible={modalVisible} animationType="none">
                <View style={styles.modalOverlay}>

                    {/* background click */}
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={StyleSheet.absoluteFillObject} />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <Text style={styles.modalTitle}>{t("members")}</Text>
                        <FlatList
                            data={teamUsers}
                            keyExtractor={(item, index) =>
                                item.employee_id || index.toString()
                            }
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: hp(50) }}
                            renderItem={({ item }) => (
                                <View style={styles.modalItem}>
                                    <Image
                                        source={{ uri: item.photo }}
                                        style={styles.modalImage}
                                    />

                                    <View>
                                        <Text style={styles.modalText}>{item.name}</Text>
                                        <Text style={{ fontSize: wp(3.1) }}>
                                            {item.employee_id}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />

                        <Pressable onPress={closeModal} style={styles.closeButton}>
                            <Text style={{ color: "#fff", fontSize: wp(5) }}>
                                {t("close")}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    memberItem: {
        alignItems: "center",
        marginRight: wp(4),
        marginBottom: hp(1.5),
    },

    memberImage: {
        width: wp(13),
        height: wp(13),
        borderRadius: wp(6.5),
        borderColor: COLORS.primary,
        borderWidth: wp(0.4),
    },

    memberText: {
        fontSize: wp(3.5),
        marginTop: hp(0.5),
        textAlign: "center",
        maxWidth: wp(20),
        textTransform: "capitalize",
    },

    extraCircle: {
        width: wp(13),
        height: wp(13),
        borderRadius: wp(6.5),
        backgroundColor: COLORS.primary + "90",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: wp(0.4),
        borderColor: COLORS.primary,
    },

    extraText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: wp(4),
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        paddingHorizontal: wp(5),
    },

    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(3),
        padding: wp(4),
        height: hp(75),
        width: wp(95),
        alignSelf: "center",
    },

    modalTitle: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        marginBottom: hp(2),
    },

    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2),
    },

    modalImage: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: wp(3),
    },

    modalText: {
        fontSize: wp(5),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize",
    },

    closeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: hp(1.1),
        borderRadius: wp(2),
        marginTop: hp(2),
        alignItems: "center",
    },
});