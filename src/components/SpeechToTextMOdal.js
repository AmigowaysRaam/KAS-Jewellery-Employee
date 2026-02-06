import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function SpeechToTextModal({
    visible,
    title = "Hold to speak", onClose, onResult, currentLanguage = "en",
}) {
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);

    const webViewRef = useRef(null);
    const scrollRef = useRef(null);
    const { t } = useTranslation();

    const htmlContent = `
  <!DOCTYPE html>
  <html>
    <body>
      <script>
        let recognition;
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "${!currentLanguage || currentLanguage === "en"
            ? "en-US"
            : currentLanguage}";

          recognition.onresult = (event) => {
            let text = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              text += event.results[i][0].transcript;
            }
            window.ReactNativeWebView.postMessage(text);
          };
        } else {
          window.ReactNativeWebView.postMessage("Speech recognition not supported");
        }

        window.startRecognition = () => recognition && recognition.start();
        window.stopRecognition = () => recognition && recognition.stop();
      </script>
    </body>
  </html>
`;

    /* 🎙 Start recording */
    const startRecording = () => {
        setTranscript("");
        setListening(true);
        webViewRef.current?.injectJavaScript(
            `window.startRecognition && window.startRecognition(); true;`
        );
    };

    /* ✋ Stop recording */
    const stopRecording = () => {
        webViewRef.current?.injectJavaScript(
            `window.stopRecognition && window.stopRecognition(); true;`
        );
        setListening(false);
    };

    /* ✅ Confirm result */
    const confirmResult = () => {
        onResult?.(transcript);
        onClose?.();
        resetState();
    };

    /* 🔁 Reset state */
    const resetState = () => {
        setTranscript("");
        setListening(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{t(title)}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={wp(6)} />
                        </TouchableOpacity>
                    </View>

                    {/* Transcript */}
                    <View style={styles.transcriptBox}>
                        {listening && (
                            <>
                                {/* <ActivityIndicator size="large" color={COLORS.primary} /> */}
                                <Text style={styles.listeningText}>{`${'listening'}`}</Text>
                            </>
                        )}

                        {/* Editable transcript */}
                        {(!listening || transcript.length > 0) ? (
                            <ScrollView
                                ref={scrollRef}
                                style={styles.scrollBox}
                                onContentSizeChange={() =>
                                    scrollRef.current?.scrollToEnd({ animated: true })
                                }
                            >
                                <TextInput
                                    style={styles.transcriptText}
                                    value={transcript}
                                    onChangeText={setTranscript}
                                    placeholderTextColor={COLORS?.primary}
                                    multiline
                                    placeholder={t('your_speechwillappear_here')}
                                />
                            </ScrollView>
                        ) : (
                            <Text style={styles.hintText}>
                            {t('hold_to_speak_hint')}
                            </Text>
                        )}
                    </View>

                    {/* WebView (hidden) */}
                    <WebView
                        ref={webViewRef}
                        originWhitelist={["*"]}
                        source={{ html: htmlContent }}
                        onMessage={(e) => setTranscript(e.nativeEvent.data)}
                        style={{ height: 0, width: 0 }}
                    />

                    {/* Actions */}
                    {transcript.length === 0 ? (
                        // Mic button if transcript is empty
                        <TouchableOpacity
                            style={[
                                styles.micBtn,
                                listening && { backgroundColor: "#e74c3c" },
                            ]}
                            onPressIn={startRecording}
                            onPressOut={stopRecording}
                            activeOpacity={0.8}
                        >
                            <Icon name="mic" size={wp(8)} color="#fff" />
                            <Text style={styles.micText}>
                                {listening ? t('rleasetoStop') : t('holdTospeak')}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        // Cancel & Confirm if transcript exists
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.retakeBtn} onPress={resetState}>
                                <Text style={styles.btnText}>{t('cancel')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmResult}>
                                <Text style={styles.btnText}>{t('confirm')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: wp(90),
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(2),
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: "600",
        color: COLORS.primary,
    },
    transcriptBox: {
        minHeight: hp(22),
        backgroundColor: "#F5F7FB", borderRadius: wp(3),
        padding: wp(3), justifyContent: "center", alignItems: "center",
    }, scrollBox: {
        maxHeight: hp(25), width: "100%",
    },
    transcriptText: {
        fontSize: wp(4), color: "#333", lineHeight: hp(3), textAlign: "left",
        padding: wp(2),
    }, listeningText: {
        marginTop: hp(1), color: COLORS.primary,
        fontWeight: "600",
    }, hintText: {
        color: "#666", textAlign: "center",
    }, micBtn: {
        marginTop: hp(2), backgroundColor: COLORS.primary, paddingVertical: hp(2),
        borderRadius: wp(18), alignItems: "center", width: wp(36),
        height: wp(36), justifyContent: "center", alignSelf: "center",
    },
    micText: {
        color: "#fff", marginTop: hp(0.5), fontWeight: "600",
    }, actionRow: {
        flexDirection: "row", justifyContent: "space-between",
        marginTop: hp(2),
    }, retakeBtn: {
        flex: 1,
        marginRight: wp(2), backgroundColor: "#7f8c8d", paddingVertical: hp(1.5),
        borderRadius: wp(3), alignItems: "center",
    },
    confirmBtn: {
        flex: 1, backgroundColor: COLORS?.primary, paddingVertical: hp(1.5),
        borderRadius: wp(3),
        alignItems: "center",
    }, btnText: {
        color: "#fff",
        fontWeight: "600",
    },
});
