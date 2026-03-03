import React from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList, Image, Modal, Pressable, StyleSheet, Text,
    View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function ConfirmTaskModal({ visible,
    onClose, taskDetails, selectedUsers = [], onConfirm, loading = false,
}) {
    const { t } = useTranslation();
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{taskDetails?.title}</Text>
                        <Pressable onPress={onClose}>
                            <Icon name="x" type="feather" size={wp(6)} color={COLORS.primary} />
                        </Pressable>
                    </View>
                    {/* <Text style={styles.title}>{JSON.stringify(selectedUsers)}</Text> */}
                    {/* selectedUsers */}
                    {/* FlatList with Header */}
                    <FlatList
                        data={selectedUsers}
                        keyExtractor={(item, index) => item?.value?.toString() || index.toString()}
                        showsVerticalScrollIndicator={true}
                        ListHeaderComponent={
                            <View style={styles.detailsSection}>
                                {/* <Text style={styles.label}>{t("title")}:</Text>
                                <Text style={styles.value}>{taskDetails?.title || "-"}</Text> */}
                                <Text style={styles.label}>{t("description")}:</Text>
                                <Text style={styles.value}>{taskDetails?.description || "-"}</Text>

                                <Text style={styles.label}>{t("priority")}:</Text>
                                <Text style={styles.value}>{taskDetails?.priority || "-"}</Text>

                                <Text style={styles.label}>{t("due_date_and_time")}:</Text>
                                <Text style={styles.value}>
                                    {taskDetails?.due_date || "-"} {t("at")} {taskDetails?.due_time || "-"}
                                </Text>

                                <Text style={[styles.label, { marginTop: hp(2), marginBottom: hp(0.1) }]}>
                                    {taskDetails?.assignType}:
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.userCard}>
                                <Image source={{ uri: item?.image }} style={styles.userImage} />
                                <Text style={styles.userName} numberOfLines={1}>
                                    {item?.label || "-"}
                                    {/* {JSON.stringify(item)} */}
                                </Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={{ textAlign: "center", color: "#999", marginTop: hp(2) }}>
                                {t("no_data")}
                            </Text>
                        }
                        style={{ maxHeight: hp(60) }}
                        contentContainerStyle={{ paddingBottom: hp(1) }}
                    />

                    {/* Fixed Bottom Buttons */}
                    <View style={styles.actions}>
                        <Pressable
                            style={[styles.button, { backgroundColor: "#ccc" }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{t("cancel")}</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: loading ? "#999" : COLORS.primary },
                            ]}
                            onPress={() => onConfirm && onConfirm()}
                            disabled={loading}
                        >
                            <Text style={[styles.buttonText, { color: "#fff" }]}>
                                {loading ? t("loading") : t("confirm")}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end",
    },
    container: {
        width: "100%", maxHeight: hp(90),
        backgroundColor: "#fff", borderTopLeftRadius: wp(7), borderTopRightRadius: wp(7),
        paddingHorizontal: wp(5), paddingTop: hp(2), paddingBottom: hp(8),
        marginBottom: hp(2)
    }, header: {
        flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        marginBottom: hp(1.5),
    }, title: {
        fontSize: wp(4.2), fontFamily: "Poppins_600SemiBold",
    },
    detailsSection: {
        marginBottom: hp(1),
    }, label: {
        fontSize: wp(3.9), fontFamily: "Poppins_500Medium",
        marginTop: hp(1),
        textTransform: "capitalize",
    }, value: {
        fontSize: wp(4.5), fontFamily: "Poppins_400Regular",
        marginBottom: hp(0.5), flexWrap: "wrap",
        flexShrink: 1, color: "#333",
    },
    usersScroll: {
        maxHeight: hp(50), marginBottom: hp(2),
    }, userCard: {
        flexDirection: "row", alignItems: "center", marginBottom: hp(1),
    }, userImage: {
        width: wp(6), height: wp(6), borderRadius: wp(3),
        marginRight: wp(3), borderWidth: 1, borderColor: COLORS.accent,
    }, userName: {
        fontSize: wp(4.5), flexShrink: 1, textTransform: "capitalize", maxWidth: wp(80),
        lineHeight: wp(5),
    }, actions: {
        flexDirection: "row",
        justifyContent: "space-between", paddingTop: hp(1),
        borderTopWidth: 1, borderTopColor: "#eee",
    }, button: {
        flex: 1, marginHorizontal: wp(1),
        paddingVertical: hp(1.5), borderRadius: wp(3),
        alignItems: "center",
    }, buttonText: {
        fontSize: wp(4), fontFamily: "Poppins_600SemiBold",
        textAlign: "center",
    },
});