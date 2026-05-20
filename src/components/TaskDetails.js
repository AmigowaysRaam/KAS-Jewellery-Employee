import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";

import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";

/* ---------------- MEDIA MODAL ---------------- */

const MediaViewerModal = ({ visible, uri, type, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBg}>
                <TouchableOpacity
                    style={styles.modalClose}
                    onPress={onClose}
                >
                    <Icon name="close" size={30} color="#fff" />
                </TouchableOpacity>

                {type === "image" ? (
                    <Image
                        source={{ uri }}
                        style={styles.fullMedia}
                        resizeMode="contain"
                    />
                ) : (
                    <Video
                        source={{ uri }}
                        style={styles.fullMedia}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay
                    />
                )}
            </View>
        </Modal>
    );
};

export default function TaskDetails() {

    const navigation = useNavigation();
    const { taskId } = useRoute().params || {};

    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );

    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState(null);

    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    const [media, setMedia] = useState(null);

    useEffect(() => {
        loadTask();
    }, []);

    /* ---------------- PRIORITY CONFIG ---------------- */

    const getPriorityConfig = (level) => {
        switch (level) {
            case "Critical":
                return {
                    color: "#E53935",
                    bg: "#FDECEC",
                    icon: "priority-high",
                };

            case "High":
                return {
                    color: "#FB8C00",
                    bg: "#FFF3E0",
                    icon: "warning",
                };

            case "Medium":
                return {
                    color: "#1E88E5",
                    bg: "#E8F1FD",
                    icon: "timeline",
                };

            case "Low":
                return {
                    color: "#43A047",
                    bg: "#EAF7EE",
                    icon: "check-circle",
                };

            default:
                return {
                    color: "#757575",
                    bg: "#F3F4F6",
                    icon: "info",
                };
        }
    };

    /* ---------------- LOAD TASK ---------------- */

    const loadTask = async () => {

        const lang = await getStoredLanguage();

        setLoading(true);

        try {

            const response = await fetchData(
                "app-employee-task-detail",
                "POST",
                {
                    id: taskId,
                    lang,
                    user_id: profileDetails?.id,
                }
            );

            const detail = response?.data?.ticket_detail;

            if (!detail) {
                navigation.goBack();
                return;
            }

            setTask(detail);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- STATUS COLOR ---------------- */

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "#3498db";

            case "Completed":
                return "#2ecc71";

            case "Overdue":
                return "#e74c3c";

            default:
                return "#999";
        }
    };

    /* ---------------- AUDIO ---------------- */

    const toggleAudio = async () => {

        if (!audioRef.current) return;

        const status = await audioRef.current.getStatusAsync();

        if (!status.isLoaded) return;

        if (status.isPlaying) {
            await audioRef.current.pauseAsync();
            setAudioPlaying(false);
        } else {
            await audioRef.current.playAsync();
            setAudioPlaying(true);
        }
    };

    /* ---------------- MEDIA LIST ---------------- */

    const mediaList = [
        ...(task?.image || []).map((img) => ({
            type: "image",
            uri: img?.image,
        })),

        ...(task?.video
            ? [{
                type: "video",
                uri: task?.video,
            }]
            : [])
    ];

    if (!task) return null;

    const priority = getPriorityConfig(task.priority);

    return (
        <View style={styles.container}>

            <CommonHeader
                title={task.title}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            {
                loading ?
                    <View style={styles.loader}>
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                        />
                    </View>
                    :
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.topCad}>
                            <View style={styles.badgeRow}>
                                {/* STATUS */}

                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                getStatusColor(task.status),
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="info"
                                        size={18}
                                        color="#fff"
                                    />

                                    <Text style={styles.statusText}>
                                        {task.status}
                                    </Text>
                                </View>

                                {/* PRIORITY */}

                                <View
                                    style={[
                                        styles.priorityBadge,
                                        {
                                            backgroundColor: priority.bg,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name={priority.icon}
                                        size={18}
                                        color={priority.color}
                                    />

                                    <Text
                                        style={[
                                            styles.priorityText,
                                            {
                                                color: priority.color,
                                            },
                                        ]}
                                    >
                                        {task.priority}
                                    </Text>
                                </View>

                            </View>

                        </View>

                        {/* DESCRIPTION */}

                        <View style={styles.card}>

                            <View style={styles.sectionHeader}>
                                <Icon
                                    name="description"
                                    size={20}
                                    color={COLORS.primary}
                                />

                                <Text style={styles.sectionTitle}>
                                    Description
                                </Text>
                            </View>

                            <Text style={styles.desc}>
                                {task.description}
                            </Text>

                        </View>

                        {/* DATE SECTION */}

                        <View style={styles.row}>

                            <View style={styles.infoBox}>

                                <View style={styles.infoIcon}>
                                    <Icon
                                        name="event-available"
                                        size={20}
                                        color="#2ecc71"
                                    />
                                </View>

                                <Text style={styles.label}>
                                    Assigned Date
                                </Text>

                                <Text style={styles.value}>
                                    {task.assigned_date}
                                </Text>

                            </View>

                            <View style={styles.infoBox}>

                                <View style={styles.infoIcon}>
                                    <Icon
                                        name="event-busy"
                                        size={20}
                                        color="#e74c3c"
                                    />
                                </View>

                                <Text style={styles.label}>
                                    Due Date
                                </Text>

                                <Text style={styles.value}>
                                    {task.due_date}
                                </Text>

                            </View>

                        </View>
                        {mediaList?.length > 0 && (
                            <View style={styles.card}>

                                <View style={styles.sectionHeader}>
                                    <Icon
                                        name="perm-media"
                                        size={20}
                                        color={COLORS.primary}
                                    />

                                    <Text style={styles.sectionTitle}>
                                        Media
                                    </Text>
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >

                                    {mediaList.map((item, index) => (

                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.8}
                                            style={styles.mediaItem}
                                            onPress={() =>
                                                setMedia({
                                                    uri: item.uri,
                                                    type: item.type,
                                                })
                                            }
                                        >

                                            {item.type === "image" ? (
                                                <Image
                                                    source={{ uri: item.uri }}
                                                    style={styles.media}
                                                />
                                            ) : (
                                                <View style={styles.videoWrapper}>

                                                    <Video
                                                        source={{ uri: item.uri }}
                                                        style={styles.media}
                                                        resizeMode="cover"
                                                        shouldPlay={false}
                                                        isMuted
                                                    />

                                                    <View style={styles.playOverlay}>
                                                        <Icon
                                                            name="play-circle-filled"
                                                            size={wp(10)}
                                                            color="#fff"
                                                        />
                                                    </View>

                                                </View>
                                            )}

                                        </TouchableOpacity>

                                    ))}

                                </ScrollView>

                            </View>
                        )}

                        {/* AUDIO */}

                        {task?.audio ? (

                            <View style={styles.card}>

                                <View style={styles.sectionHeader}>
                                    <Icon
                                        name="audiotrack"
                                        size={20}
                                        color={COLORS.primary}
                                    />

                                    <Text style={styles.sectionTitle}>
                                        Audio
                                    </Text>
                                </View>

                                <Video
                                    ref={audioRef}
                                    source={{ uri: task.audio }}
                                    style={{ width: 0, height: 0 }}
                                    shouldPlay={false}
                                />

                                <View style={styles.audioContainer}>

                                    <View style={{ flex: 1 }}>

                                        <Text style={styles.audioName}>
                                            🎧 {task.audio_name || "Audio File"}
                                        </Text>

                                        {audioPlaying && (
                                            <Text style={styles.playingText}>
                                                🔊 Playing...
                                            </Text>
                                        )}

                                    </View>

                                    <TouchableOpacity
                                        onPress={toggleAudio}
                                        style={[
                                            styles.playBtn,
                                            audioPlaying && {
                                                backgroundColor: "#2ecc71",
                                            },
                                        ]}
                                    >
                                        <Icon
                                            name={
                                                audioPlaying
                                                    ? "pause"
                                                    : "play-arrow"
                                            }
                                            size={30}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>

                                </View>

                            </View>

                        ) : null}

                    </ScrollView>
            }

            {/* MEDIA VIEWER */}

            <MediaViewerModal
                visible={!!media}
                uri={media?.uri}
                type={media?.type}
                onClose={() => setMedia(null)}
            />

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F6FA",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    content: {
        padding: wp(4),
        paddingBottom: hp(3),
    },

    /* TOP CARD */

    topCard: {
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    taskTitle: {
        fontSize: wp(5.2),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(1.5),
        textTransform: "capitalize",
    },

    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(5),
        marginRight: wp(2),
        marginBottom: hp(1),
    },

    statusText: {
        color: "#fff",
        marginLeft: wp(1.5),
        fontWeight: "600",
        fontSize: wp(3.3),
    },

    priorityBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(5),
    },

    priorityText: {
        marginLeft: wp(1.5),
        fontWeight: "700",
        fontSize: wp(3.3),
    },

    /* CARD */

    card: {
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5),
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(1.2),
    },

    sectionTitle: {
        fontSize: wp(4.1),
        fontWeight: "700",
        color: "#1E293B",
        marginLeft: wp(2),
    },

    desc: {
        fontSize: wp(3.5),
        lineHeight: hp(2.7),
        color: "#555",
    },

    /* ROW */

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: hp(1.5),
    },

    infoBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
        marginHorizontal: wp(1),
        elevation: 2,
    },

    infoIcon: {
        marginBottom: hp(1),
    },

    label: {
        fontSize: wp(3),
        color: "#94A3B8",
        marginBottom: hp(0.5),
    },

    value: {
        fontSize: wp(3.5),
        color: "#1E293B",
        fontWeight: "600",
    },

    /* PRIORITY CARD */

    priorityCard: {
        borderRadius: wp(3),
        padding: wp(4),
    },

    priorityMainText: {
        fontSize: wp(5),
        fontWeight: "700",
        marginBottom: hp(0.5),
    },

    prioritySubText: {
        fontSize: wp(3.3),
        color: "#555",
    },

    /* MEDIA */

    mediaItem: {
        width: wp(30),
        height: wp(30),
        borderRadius: wp(3),
        overflow: "hidden",
        marginRight: wp(3),
        backgroundColor: "#eee",
    },

    media: {
        width: "100%",
        height: "100%",
    },

    videoWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    playOverlay: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },

    /* AUDIO */

    audioContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    audioName: {
        fontSize: wp(3.6),
        fontWeight: "600",
        color: "#1E293B",
    },

    playBtn: {
        width: wp(13),
        height: wp(13),
        borderRadius: wp(7),
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },

    playingText: {
        marginTop: hp(0.5),
        color: "#2ecc71",
        fontWeight: "600",
        fontSize: wp(3),
    },

    /* MODAL */

    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.96)",
        justifyContent: "center",
        alignItems: "center",
    },

    fullMedia: {
        width: "100%",
        height: "80%",
    },

    modalClose: {
        position: "absolute",
        top: hp(6),
        right: wp(5),
        zIndex: 10,
    },

});