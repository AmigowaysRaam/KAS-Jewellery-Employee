import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const DescriptionFormSection = ({
    t,
    description,
    setDescription,
    errors,
    styles,
    setspeechTextModal,
    setSpeechFlag,
    descAudio,
    isPlaying,
    stopAudio,
    playAudio,
    deleteAudio,
    isDownloading,
    saveAudioToDownloads,
    startRecording,
    PlayingAnimation, descriptionInputRef
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
    }, [descAudio]);
    const handleDelete = () => {
        setModalVisible(false);
        deleteAudio(); // call the actual delete function passed as prop
    };
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{`${t("description")} *`}</Text>
            <View style={styles.inputWrap}>
                <TextInput
                    ref={descriptionInputRef}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={[styles.textInput, { paddingRight: wp(8) }]}
                    placeholder={t("description")}
                />
                {errors.description && description == '' && (
                    <Text style={styles.error}>{errors.description}</Text>
                )}
                <TouchableOpacity
                    style={[styles.mic, {
                        marginHorizontal: wp(0.5), zIndex: 9999,
                        // , backgroundColor: "red",
                        padding: wp(2),
                    }]}
                    onPress={() => {
                        setspeechTextModal(true);
                        setSpeechFlag("description");
                    }}
                >
                    <Icon name="mic" type="feather" size={wp(6)} color={COLORS.gray} />
                </TouchableOpacity>
            </View>
            <View style={{ width: wp(90), marginVertical: hp(1.5) }}>
                {descAudio?.uri ? (
                    <View
                        style={[
                            styles.audioRow,
                            {
                                borderWidth: wp(0.3),
                                borderColor: "#ccc",
                                borderRadius: wp(2),
                                paddingVertical: wp(0.5),
                                height: hp(6),
                                alignItems: "center",
                            },
                        ]}
                    >
                        <View style={styles.audioInfo}>
                            <PlayingAnimation isPlaying={isPlaying} />
                            <Text numberOfLines={1} style={styles.audioName}>
                                {descAudio.name || "DescriptionAudio.mp3"}
                            </Text>
                            {descAudio.duration && (
                                <Text style={styles.audioName}>
                                    {`(${descAudio.duration}s)`}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity onPress={isPlaying ? stopAudio : playAudio}>
                            <Icon
                                name={isPlaying ? "pause" : "play-arrow"}
                                size={wp(7)}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Icon
                                name="trash"
                                type="feather"
                                size={wp(6)}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={isDownloading}
                            onPress={() =>
                                saveAudioToDownloads(descAudio?.uri, "Dscaudio.mp3")
                            }
                        >
                            {isDownloading ? (
                                <ActivityIndicator size={wp(6)} color={COLORS.primary} />
                            ) : (
                                <Icon
                                    name="download"
                                    type="feather"
                                    size={wp(7)}
                                    color={COLORS.primary}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={{
                            justifyContent: "flex-start",
                            borderWidth: wp(0.3),
                            borderColor: "#ccc",
                            borderRadius: wp(2),
                            paddingVertical: wp(0.5),
                            paddingHorizontal: wp(2),
                            height: hp(6),
                            alignItems: "center",
                            flexDirection: "row",
                            width: "100%",
                        }}
                        onPress={startRecording}
                    >
                        <Icon name="mic" size={wp(6)} color={COLORS.gray} />
                        <Text
                            numberOfLines={1}
                            style={{
                                fontFamily: "Poppins_400Regular",
                                color: COLORS.gray,
                                fontSize: wp(3.5),
                                marginLeft: wp(2),
                            }}
                        >
                            {t("add_description_audio")}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContainer}>
                        <Icon name="warning" size={wp(10)} color={'#FF0000'} style={{ marginBottom: wp(4) }} />
                        <Text style={modalStyles.modalTitle}>{t("delete_audio")}</Text>
                        <Text style={modalStyles.modalMessage}>
                            {t("confirm_delete_audio")}
                        </Text>
                        <View style={modalStyles.modalButtons}>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={modalStyles.cancelText}>{t("cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.confirmButton]}
                                onPress={handleDelete}
                            >
                                <Text style={modalStyles.confirmText}>{t("delete")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: wp(3),
        padding: wp(5),
        alignItems: "center",
        elevation: 5,
    },
    modalTitle: {
        fontSize: wp(5),
        fontWeight: "700",
        marginBottom: hp(1),
        color: "#333",
    },
    modalMessage: {
        fontSize: wp(4),
        color: "#666",
        marginBottom: hp(2),
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        flex: 1,
        paddingVertical: hp(1.5),
        marginHorizontal: wp(1),
        borderRadius: wp(2),
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#eee",
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        color: "#333",
        fontWeight: "600",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default DescriptionFormSection;
