import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function AttachmentModal({ visible, onClose, onCamera, onFile, onAudioRecorded, hideMic = false }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [recordTime, setRecordTime] = useState(0);
    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { t } = useTranslation();

    // Request microphone permission on mount
    useEffect(() => {
        Audio.requestPermissionsAsync();
    }, []);

    // Increment recording time while recording
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => setRecordTime((t) => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const [isPreparing, setIsPreparing] = useState(false);

    const startRecording = async () => {
        if (isRecording || isPreparing) return; // prevent double-tap
        setIsPreparing(true);
        try {
            // Stop previous recording if exists
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }
            setIsRecording(true);
            setRecordTime(0);
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );

            setRecording(newRecording);
        } catch (err) {
            console.log("Recording error:", err);
            setIsRecording(false);
        } finally {
            setIsPreparing(false);
        }
    };


    // Stop recording
    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        setAudioUri(uri);

        const status = await recording.getStatusAsync();
        setRecordTime(Math.floor(status.durationMillis / 1000));

        setRecording(null);
    };

    // Play / Pause audio
    const togglePlayback = async () => {
        if (!audioUri) return;

        if (isPlaying) {
            await sound?.pauseAsync();
            setIsPlaying(false);
        } else {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setRecordTime(Math.floor(status.positionMillis / 1000));
                    if (status.didJustFinish) setIsPlaying(false);
                }
            });
        }
    };

    // Confirm recorded audio
    const confirmRecording = () => {
        if (audioUri && onAudioRecorded) {
            onAudioRecorded({ uri: audioUri });
        }
        cleanup();
        onClose();
    };

    // Cleanup recording & sound
    const cleanup = async () => {
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
            } catch (err) {
                console.log("Error stopping recording during cleanup:", err);
            }
            setRecording(null);
        }

        if (sound) {
            try {
                await sound.unloadAsync();
            } catch (err) {
                console.log("Error unloading sound during cleanup:", err);
            }
            setSound(null);
        }

        setIsPlaying(false);
        setAudioUri(null);
        setRecordTime(0);
        setIsRecording(false);
    };

    // Close modal safely
    const handleClose = async () => {
        await cleanup();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header */}
                            <View style={styles.headerRow}>
                                <Text style={styles.title}>{t("select_attachment") || "Select Attachment"}</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Icons Row */}
                            {!audioUri && !isRecording && (
                                <View style={styles.iconRow}>
                                    {
                                        hideMic &&
                                        <>
                                            < View style={styles.iconItem}>
                                                <TouchableOpacity style={styles.iconButton} onPress={onCamera}>
                                                    <Ionicons name="camera" size={32} color="#fff" />
                                                </TouchableOpacity>
                                                <Text style={styles.iconLabel}>{t("camera") || "Camera"}</Text>
                                            </View>

                                            {/* File */}
                                            <View style={styles.iconItem}>
                                                <TouchableOpacity style={styles.iconButton} onPress={onFile}>
                                                    <MaterialIcons name="insert-drive-file" size={32} color="#fff" />
                                                </TouchableOpacity>
                                                <Text style={styles.iconLabel}>{t("file") || "File"}</Text>
                                            </View>
                                        </>
                                    }


                                    {!hideMic && (
                                        <View style={styles.iconItem}>
                                            <TouchableOpacity
                                                style={styles.iconButton}
                                                onPress={startRecording}
                                                disabled={isRecording}
                                            >
                                                <FontAwesome name="microphone" size={32} color="#fff" />
                                            </TouchableOpacity>
                                            <Text style={styles.iconLabel}>{t("audio") || "Audio"}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            {isRecording && (
                                <View style={styles.recordingContainer}>
                                    <Text style={styles.recordingText}>{`${t("recording") || "Recording"} ...`}</Text>
                                    <Text style={styles.recordTime}>{recordTime}s</Text>
                                    <TouchableOpacity
                                        style={[styles.stopButton, { marginTop: wp(4), backgroundColor: "#ff0000" }]}
                                        onPress={stopRecording}
                                    >
                                        <Text style={styles.stopButtonText}>{`${t("stop") || "Stop"}`}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {audioUri && (
                                <View style={styles.recordingContainer}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                                            <FontAwesome name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.recordTime}>{recordTime}s</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", marginTop: hp(2) }}>
                                        <TouchableOpacity style={styles.confirmButton} onPress={confirmRecording}>
                                            <Text style={styles.confirmText}>{`${t("confirm") || "Confirm"}`}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.stopButton} onPress={cleanup}>
                                            <Text style={styles.stopButtonText}>{`${t("delete") || "Delete"}`}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback >
        </Modal >
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        paddingTop: hp(3),
        paddingBottom: hp(4),
        paddingHorizontal: wp(5),
        borderTopLeftRadius: wp(5),
        borderTopRightRadius: wp(5),
        alignItems: "center",
        height: hp(35),
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        marginBottom: hp(3),
    },
    title: {
        fontSize: wp(5),
        fontWeight: "600",
        color: "#333",
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginVertical: hp(2),
    },
    iconItem: {
        alignItems: "center",
    },
    iconButton: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    iconLabel: {
        marginTop: hp(1),
        fontSize: wp(3.2),
        color: "#111",
        textAlign: "center",
        textTransform: "capitalize",
    },
    recordingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp(2),
    },
    recordingText: {
        fontSize: wp(4),
        fontWeight: "600",
        color: COLORS.primary,
        marginBottom: hp(1),
    },
    recordTime: {
        fontSize: wp(5),
        marginHorizontal: wp(2),
    },
    stopButton: {
        backgroundColor: "#ff4d4d",
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        marginHorizontal: wp(2),
    },
    stopButtonText: {
        color: "#fff",
        fontSize: wp(4.2),
        fontWeight: "600",
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        marginHorizontal: wp(2),
    },
    confirmText: {
        color: "#fff",
        fontSize: wp(4.2),
        fontWeight: "600",
    },
    playButton: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(2),
    },
});
