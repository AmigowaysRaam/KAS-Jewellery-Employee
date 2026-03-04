import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { BASE_URL } from "./api/Api";
import StatusSelectModal from "./statusSelectModal";
import TaskDetailModal from "./TaskDetailModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TaskCard({ task, loadData, statusList }) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    /* ---------------- STATUS COLOR ---------------- */
    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "#3498db";
            case "Inprogress":
                return "#f39c12";
            case "Waiting for QC":
                return "#9b59b6";
            case "Completed":
                return "#2ecc71";
            case "Overdue":
                return "#D32F2F";
            default:
                return COLORS.primary;
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "Critical":
                return { bg: "#FDECEA", color: "#C0392B" };
            case "High":
                return { bg: "#FFF0F0", color: "#E74C3C" };
            case "Medium":
                return { bg: "#FFF8E6", color: "#F39C12" };
            case "Low":
                return { bg: "#EAF7EE", color: "#27AE60" };
            default:
                return { bg: "#F5F5F5", color: "#999" };
        }
    };

    const priorityStyle = getPriorityStyle(task?.priority);
    const openDetailModal = () => {
        setShowDetailModal(true);
        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    const closeDetailModal = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setShowDetailModal(false);
            loadData();
        });
    };
    const handleUpdateStatus = async (sta) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("id", task.id);
            formData.append("status", sta);
            formData.append("user_id", profileDetails?.id);

            const response = await fetch(`${BASE_URL}app-employee-update-task`, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            const result = await response.json();

            if (result?.success) {
                loadData();
                showToast(result.message || t("task_updated_successfully"), "success");
            } else {
                showToast(result?.message || t("failed_to_update_task"), "error");
            }
        } catch (err) {
            console.log(err);
            showToast(t("something_went_wrong"), "error");
        } finally {
            setLoading(false);
            setShowStatusModal(false);
        }
    };

    return (
        <>
            <Pressable
                style={[
                    styles.card,
                    {
                        backgroundColor: priorityStyle.bg,
                        borderLeftColor: priorityStyle.color,
                    },
                ]}
                onPress={openDetailModal}
            >
                <View style={styles.buttonRow}>
                    <Pressable
                        disabled={loading}
                        onPress={() => setShowStatusModal(true)}
                        style={[
                            styles.actionButton,
                            { backgroundColor: getStatusColor(task?.status) },
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator size={wp(4.5)} color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonLabel}>
                                    {t("change_status")}
                                </Text>
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>{task?.status}</Text>
                                    <Icon name="edit" size={wp(5)} color="#fff" />
                                </View>
                            </>
                        )}
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                        onPress={openDetailModal}
                    >
                        <Text style={styles.buttonLabel}>{t("task")}</Text>
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonText}>{t("view")}</Text>
                            <Icon name="arrow-forward-ios" size={wp(5)} color="#fff" />
                        </View>
                    </Pressable>
                </View>
            </Pressable>
            <Text style={[styles.buttonLabel, {
                alignSelf: "center",
                fontFamily: "Poppins_600SemiBold",
                color: "#fff",
                fontSize: wp(4.5),
                textShadowColor: "#000",
                textShadowOffset: { width: wp(0.5), height: wp(0.5) },
                textShadowRadius: 2,
                textTransform: "capitalize"
            }]}>
                {t("chats")}
            </Text>
            <StatusSelectModal
                currentStatus={task?.status}
                visible={showStatusModal}
                statuses={statusList || []}
                onClose={() => setShowStatusModal(false)}
                onSelect={(status) => handleUpdateStatus(status)}
            />
            <TaskDetailModal
                visible={showDetailModal}
                task={task}
                translateY={translateY}
                onClose={closeDetailModal}
                getStatusColor={getStatusColor}
            />
        </>
    );
}
const styles = StyleSheet.create({
    card: {
        width: wp(95),
        borderRadius: wp(4),
        padding: wp(4),
        marginVertical: hp(1),
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        borderLeftWidth: wp(1.2),
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(1.5),
    },

    title: {
        fontSize: wp(4.5),
        fontWeight: "700",
        flex: 1,
        marginRight: wp(2),
    },

    priorityBadge: {
        paddingHorizontal: wp(3), paddingVertical: hp(0.6),
        borderRadius: wp(4),
        borderWidth: 1,
        backgroundColor: "#fff",
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButton: {
        width: "48%", paddingVertical: hp(1.8), paddingHorizontal: wp(3),
        borderRadius: wp(3),
    },

    buttonLabel: {
        color: "#fff", fontSize: wp(3.9),
        marginBottom: hp(0.5), fontWeight: "500",
    },
    buttonContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: wp(4),
        fontWeight: "700",
    },
});