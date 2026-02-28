import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
export default function SelectTeamMembers({
    teamMembers, visible, onClose, onDone,
    preSelected = [],
}) {
    const { t } = useTranslation();
    const teamUsers = teamMembers?.team_users || [];
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Initialize selected users when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedUsers(preSelected || []);
        }
    }, [visible, preSelected]);

    if (!teamUsers || teamUsers.length === 0) return null;

    // Toggle user selection
    const toggleUser = (user) => {
        const exists = selectedUsers.some((u) => u.value === user.value);
        if (exists) {
            setSelectedUsers((prev) => prev.filter((u) => u.value !== user.value));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    // Select / unselect all
    const selectAllUsers = () => {
        if (selectedUsers.length === teamUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(teamUsers);
        }
    };

    const handleDone = () => {
        onDone && onDone(selectedUsers);
        onClose && onClose();
    };

    const handleCancel = () => {
        onClose && onClose();
    };

    const isAllSelected = selectedUsers.length === teamUsers.length;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={() => {
            }}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.modalTitle}>{t("members")}</Text>
                        <Pressable onPress={selectAllUsers}>
                            <Icon
                                name={isAllSelected ? "check-square" : "square"}
                                type="feather"
                                size={wp(7)}
                                color={COLORS.primary}
                            />
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.gridContainer}
                    >
                        {teamUsers?.map((item, index) => {
                            const isSelected = selectedUsers.some(
                                (u) => u.value === item.value
                            );
                            return (
                                <Pressable
                                    key={item?.value || `member-${index}`}
                                    style={[styles.gridItem, isSelected && styles.selectedCard]}
                                    onPress={() => toggleUser(item)}
                                >
                                    {/* Checkbox */}
                                    <View style={styles.checkbox}>
                                        <Icon
                                            name={isSelected ? "check-circle" : "circle"}
                                            type="feather"
                                            size={wp(5.5)}
                                            color={COLORS.primary}
                                        />
                                    </View>

                                    {/* Avatar */}
                                    <Image
                                        source={{ uri: item?.image }}
                                        style={[styles.memberImage, { borderColor: COLORS.accent }]}
                                    />

                                    {/* Name */}
                                    <Text
                                        style={[styles.memberName, isSelected && styles.selectedText]}
                                        numberOfLines={1}
                                    >
                                        {item?.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={handleCancel}
                            style={[styles.cancelButton]}
                        >
                            <Text style={styles.cancelText}>{t("cancel")}</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleDone}
                            style={[styles.doneButton]}
                        >
                            <Text style={styles.doneText}>
                                {t("confirm")} ({selectedUsers?.length})
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#f9f9f9",
        borderTopLeftRadius: wp(7),
        borderTopRightRadius: wp(7),
        padding: wp(5),
        maxHeight: hp(85),
        paddingBottom: hp(10),
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(2),
    },
    modalTitle: {
        fontSize: wp(5),
        fontFamily: "Poppins_600SemiBold",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: hp(2),
    },
    gridItem: {
        width: "48%",
        alignItems: "center",
        marginBottom: hp(2.5),
        backgroundColor: "#fafafa",
        paddingVertical: hp(2),
        borderRadius: wp(4),
    },
    selectedCard: {
        backgroundColor: COLORS.primary + "15",
        borderWidth: hp(0.2),
        borderColor: COLORS.primary,
    },
    checkbox: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    memberImage: {
        width: wp(15),
        height: wp(15),
        borderRadius: wp(7.5),
        marginBottom: hp(1),
        borderWidth: 1,
    },
    memberName: {
        fontSize: wp(3.1),
        fontFamily: "Poppins_500Medium",
        textAlign: "center",
        textTransform: "capitalize",
        paddingHorizontal: wp(1),
    },
    selectedText: {
        color: COLORS.primary,
        fontFamily: "Poppins_600SemiBold",
    },

    // Buttons row
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: hp(2),
    },
    doneButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: hp(1.6),
        borderRadius: wp(3),
        alignItems: "center",
        marginLeft: wp(1),
    },
    doneText: {
        color: "#fff",
        fontSize: wp(4.5),
        fontFamily: "Poppins_600SemiBold",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#ccc",
        paddingVertical: hp(1.6),
        borderRadius: wp(3),
        alignItems: "center",
        marginRight: wp(1),
    },
    cancelText: {
        color: "#333",
        fontSize: wp(4.5),
        fontFamily: "Poppins_600SemiBold",
    },
});