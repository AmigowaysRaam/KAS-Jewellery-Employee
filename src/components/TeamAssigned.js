import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated, Easing, FlatList,
    Image, Modal, Pressable, ScrollView,
    StyleSheet, Text, TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function TeamAssigned({ teamMembers }) {
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    //    "employee_id": "EMP2",
    //    "name": "amigoways",
    //    "phone_number": "9943921242",
    //    "photo": "https://www.kasjewellery.com/assets/images/employees/user-thumb.png"

    const { t } = useTranslation();
    const teamUsers = teamMembers || [];
    useEffect(() => {
        console.log("Team Members:", JSON.stringify(teamMembers, null, 2));
    }, [teamUsers]);
    if (!teamUsers) return null;
    const openModal = () => {
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

    // Prepare data for horizontal list (show max 4, last one as +X if more)
    const maxVisible = 4;
    const horizontalData =
        teamUsers.length > maxVisible
            ? [...teamUsers.slice(0, maxVisible - 1), { isExtra: true, extraCount: teamUsers.length - (maxVisible - 1) }]
            : teamUsers;
    return (
        <View style={{ marginHorizontal: hp(0.1) }}>
            {/* Horizontal Scroll of team members */}
            <Text style={styles.modalTitle}>{t('team_members')}</Text>
            <FlatList
                data={horizontalData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item.value?.toString() || index.toString()}
                renderItem={({ item }) => {
                    if (item.isExtra) {
                        return (
                            <Pressable
                                onPress={openModal}
                                style={styles.memberImag}
                            >
                                <View style={styles.extraCircle}>
                                    <Text style={styles.extraText}>{`+${item.extraCount}`}</Text>
                                </View>
                                <Text style={styles.memberText} numberOfLines={1} ellipsizeMode="tail">
                                    {"View" /* Placeholder, can be "More" or similar */}
                                </Text>
                            </Pressable>
                        );
                    }
                    return (
                        <Pressable onPress={openModal} style={styles.memberItem}>
                            <Image
                                source={{ uri: item.photo }}
                                style={styles.memberImage}
                            />
                            <Text style={styles.memberText} numberOfLines={1} ellipsizeMode="tail">
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* Modal for full vertical list */}
            <Modal transparent visible={modalVisible} animationType="none">
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: opacityAnim,
                                    },
                                ]}
                            >
                                <Text style={styles.modalTitle}>{t('team_members')}</Text>
                                <ScrollView>
                                    {teamUsers.map((item, index) => (
                                        <View key={item.value?.toString() || index} style={styles.modalItem}>
                                            <Image source={{ uri: item.photo }} style={styles.modalImage} />
                                            <View>
                                                <Text style={styles.modalText}>{item.name}</Text>
                                                <Text style={{ fontSize: wp(3.1) }}>{item.employee_id}</Text>
                                            </View>


                                        </View>
                                    ))}
                                </ScrollView>
                                <Pressable onPress={closeModal} style={styles.closeButton}>
                                    <Text style={{ color: "#fff", fontSize: wp(5) }}>{t('close')}</Text>
                                </Pressable>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
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
    extraItem: {
        alignItems: "center",
        justifyContent: "center",
        marginRight: wp(3),
    },
    extraCircle: {
        width: wp(13),
        height: wp(13),
        borderRadius: wp(6.5),
        backgroundColor: COLORS.primary + 90,
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
        justifyContent: "center",
        paddingHorizontal: wp(5),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(3),
        padding: wp(4),
        maxHeight: hp(70),
        position: "absolute",
        width: wp(95),
        bottom: hp(8),
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
