import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function AttachmentModal({ visible, onClose, onCamera, onFile, onAudioRecorded,
    hideMic = false
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [recordTime, setRecordTime] = useState(0);
    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { t } = useTranslation();
    // Request microphone permission
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

    // Start recording
    const startRecording = async () => {
        try {
            setIsRecording(true);
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
            setRecordTime(0);
        } catch (err) {
            console.log("Recording error:", err);
            setIsRecording(false);
        }
    };

    // Stop recording
    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);

        // Get actual duration
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

            // Update recordTime in real-time
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setRecordTime(Math.floor(status.positionMillis / 1000));
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                    }
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

    // Remove audio
    const removeAudio = () => {
        cleanup();
    };

    // Cleanup state
    const cleanup = () => {
        setAudioUri(null);
        setRecording(null);
        setIsRecording(false);
        setRecordTime(0);
        sound && sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* <Text style={styles.title}>{t('select')}</Text> */}
                            {/* Icons Row */}
                            {!audioUri && !isRecording && (
                                <View style={styles.iconRow}>
                                    <TouchableOpacity style={styles.iconButton} onPress={onCamera}>
                                        <Ionicons name="camera" size={32} color="#fff" />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.iconButton} onPress={onFile}>
                                        <MaterialIcons name="insert-drive-file" size={32} color="#fff" />
                                    </TouchableOpacity>
                                    {
                                        !hideMic &&
                                        <TouchableOpacity style={styles.iconButton} onPress={startRecording}>
                                            <FontAwesome name="microphone" size={32} color="#fff" />
                                        </TouchableOpacity>
                                    }
                                </View>
                            )}
                            {/* Recording View */}
                            {isRecording && (
                                <View style={styles.recordingContainer}>
                                    <Text style={styles.recordingText}>{`${'recording'} ...`}</Text>
                                    <Text style={styles.recordTime}>{recordTime}s</Text>
                                    <TouchableOpacity
                                        style={[styles.stopButton, { marginTop: wp(4), backgroundColor: "#ff0000" }]}
                                        onPress={stopRecording}
                                    >
                                        <Text style={styles.stopButtonText}>{`${'stop'}`}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Audio Playback Preview */}
                            {audioUri && (
                                <View style={styles.recordingContainer}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                                            <FontAwesome name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.recordTime}>{recordTime}s</Text>
                                        <TouchableOpacity onPress={removeAudio} style={{ marginLeft: wp(3) }}>
                                            <Ionicons name="trash" size={28} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: "row", marginTop: hp(2) }}>
                                        <TouchableOpacity style={styles.confirmButton} onPress={confirmRecording}>
                                            <Text style={styles.confirmText}>{`${'confirm'}`}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.stopButton} onPress={cleanup}>
                                            <Text style={styles.stopButtonText}>{`${'cancel'}`}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={28} color={COLORS.primary} />
                            </TouchableOpacity>
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
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: "600",
        marginBottom: hp(2),
        color: "#333",
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginVertical: hp(2),
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
    closeButton: {
        marginTop: hp(2),
        backgroundColor: "#f2f2f2",
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: "center",
        alignItems: "center",
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
