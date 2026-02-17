import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated, Dimensions, Pressable,
    StyleSheet, Text, View
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
export default function TaskCard({ task, loadData }) {
    const { t } = useTranslation();
    const siteDetails = useSelector(
        (state) => state.auth?.siteDetails?.data[0]
    );
    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );
    const { showToast } = useToast();

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    /** STATUS COLOR */
    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "#3498db";        // Blue
            case "Inprogress":
                return "#f39c12";        // Orange
            case "Waiting for QC":
                return "#9b59b6";        // Purple
            case "Completed":
                return "#2ecc71";        // Green
            default:
                return COLORS.primary;   // Fallback
        }
    };
    /** PRIORITY STYLE */
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "Critical":
                return { bg: "#FDECEA", color: "#C0392B" };
            case "High":
                return { bg: "#FDECEA", color: "#E74C3C" };
            case "Medium":
                return { bg: "#FFF4E5", color: "#F39C12" };
            case "Low":
                return { bg: "#EAF7EE", color: "#2ECC71" };
            default:
                return { bg: "#F2F2F2", color: "#999" };
        }
    };
    const priorityStyle = getPriorityStyle(task?.priority);
    /** OPEN DETAIL MODAL */
    const openDetailModal = () => {
        setShowDetailModal(true);
        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    const [loading, setLoading] = useState(false);

    /** CLOSE DETAIL MODAL */
    const closeDetailModal = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 280,
            useNativeDriver: true,
        }).start(() => setShowDetailModal(false));
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
                loadData()
                showToast(result.message || t("task_updated_successfully"), "success");
            } else {
                showToast(result?.message || t("failed_to_update_task"), "error");
            }
        } catch (err) {
            console.log(err);
            showToast(t("something_went_wrong"), "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {/* ================= TASK CARD ================= */}
            <Pressable
                onPress={openDetailModal}
                style={[
                    styles.card,
                    {
                        backgroundColor: priorityStyle.bg,
                        borderColor: priorityStyle.color,
                    },
                ]}
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Pressable
                        disabled={loading}
                        onPress={() => setShowStatusModal(true)}
                        style={[
                            styles.statusBtn,
                            {
                                backgroundColor: getStatusColor(task?.status),
                                width: wp(43),
                                paddingVertical: hp(1.8),
                            },
                        ]}
                    >
                        {
                            loading ?
                                <ActivityIndicator size={wp(4.5)} color="#fff" style={{ marginLeft: wp(2), }} />
                                :
                                <>
                                    <Text style={styles.statusText}>{task?.status}</Text>
                                    <Icon name="edit" size={wp(4.8)} color="#fff" />
                                </>
                        }
                    </Pressable>
                    <Pressable
                        disabled={loading}
                        onPress={() => openDetailModal()}
                        style={[
                            styles.statusBtn,
                            { backgroundColor: COLORS?.primary, width: wp(43),justifyContent:"space-between" ,
                                paddingVertical: hp(1.8),
                            },
                        ]}
                    >
                        <Text style={styles.statusText}>{t('view')}</Text>
                        <Icon name="arrow-forward-ios" size={wp(4.8)} color="#fff" />
                    </Pressable>

                </View>
                {/* <View style={styles.footer}>
                    <View style={[styles.priorityBadge, {
                        borderColor: priorityStyle.color
                    }]}>
                        <Text style={{ color: priorityStyle.color, fontWeight: "700" }}>
                            {task?.priority}
                        </Text>
                    </View>
                </View> */}
            </Pressable>
            <StatusSelectModal
                currentStatus={task?.status}
                visible={showStatusModal}
                statuses={siteDetails?.ticketstatusnooverdueList || []}
                onClose={() => setShowStatusModal(false)}
                onSelect={(status) => {
                    handleUpdateStatus(status);
                }}
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
        width: wp(95), borderRadius: wp(3), padding: wp(2),
        elevation: 4, shadowColor: "#000", shadowOpacity: 0.1,
        shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
        marginVertical: hp(0.7), borderWidth: wp(0.5),
    }, title: {
        fontSize: wp(4.2), fontWeight: "600",
        marginBottom: hp(1), textTransform: "capitalize", maxWidth: wp(44)
    }, statusBtn: {
        flexDirection: "row", alignItems: "center",justifyContent:"space-between",
        alignSelf: "flex-start", paddingHorizontal: wp(5),
        paddingVertical: hp(1), borderRadius: wp(2),
    }, statusText: {
        color: "#fff", fontSize: wp(4.5),
        marginRight: wp(2), fontWeight: "600",
    },
    footer: {
        flexDirection: "row", justifyContent: "space-between",
        marginTop: hp(1.5),
    }, priorityBadge: {
        backgroundColor: "#fff", paddingHorizontal: wp(3),
        paddingVertical: hp(0.6), borderRadius: wp(4),
        borderWidth: wp(0.3),
    }, viewBtn: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: COLORS.primary, paddingHorizontal: wp(6),
        height: hp(4.2),
        borderRadius: wp(2),
    }, viewText: {
        color: "#fff", fontSize: wp(3.6),
        fontWeight: "600", lineHeight: hp(4.2)
    },
});