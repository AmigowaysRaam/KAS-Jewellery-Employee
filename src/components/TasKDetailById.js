import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard, KeyboardAvoidingView,
  Platform, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { fetchData } from "./api/Api";
import AttachmentModal from "./AttacthcModal";
import CommentList from "./Commentlist";
import CommonHeader from "./CommonHeader";
import ImageViewerModal from "./ImageViewver";

export default function TaskMessages({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { task } = route?.params || {};
  const { t } = useTranslation()

  const profileDetails = useSelector(state => state?.auth?.profileDetails?.data);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false); // header/task loader
  const [sending, setSending] = useState(false); // sending comment
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [audioAttachment, setAudioAttachment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const [ticketDetails, setticketDetails] = useState(null);
  const flatListRef = useRef(null);
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const openImageViewer = (uri) => {
    setViewerUri(uri);
    setViewerVisible(true);
  };

  // Fetch task comments/details
  useEffect(() => {
    const loadComments = async () => {
      const lang = await getStoredLanguage();
      setLoading(true);
      try {
        const response = await fetchData("app-employee-task-detail", "POST", {
          id: task?.id,
          lang: lang,
          user_id: profileDetails?.id
        });
        setticketDetails(response?.data?.ticket_detail);
        // Alert.alert('TEST', JSON.stringify(response?.data?.ticket_detail?.image))
        setComments(response?.data?.comments || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (task?.id) loadComments();
  }, [task]);
  const pickCamera = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const img = result.assets[0];
      setImages(prev => [...prev, { ...img, source: "Camera" }]);
    }
  };

  const pickFile = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length
    });
    if (!result.canceled && result.assets?.length > 0) {
      const selected = result.assets.map(a => ({ ...a, source: "Gallery" }));
      setImages(prev => [...prev, ...selected]);
    }
  };

  const handleAudioRecorded = (audio) => setAudioAttachment(audio);
  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
  const removeAudioAttachment = () => setAudioAttachment(null);

  // --- SEND COMMENT ---
  const handleSend = async () => {
    if (!text.trim() && images.length === 0 && !audioAttachment) {
      showToast("Please write a comment, select an image, or record audio", "error");
      return;
    }
    if (!profileDetails?.id || !task?.id) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("user_id", profileDetails.id.toString());
      formData.append("task_id", task.id.toString());
      formData.append("description", text.trim());
      images.forEach((img, index) => {
        formData.append("images[]", {
          uri: img.uri,
          name: `comment_${Date.now()}_${index}.jpg`,
          type: img.mimeType || "image/jpeg",
        });
      });
      if (audioAttachment) {
        formData.append("audio", {
          uri: audioAttachment.uri,
          name: `audio_${Date.now()}.m4a`,
          type: "audio/m4a",
        });
      }
      const response = await fetch("https://kasjewellery.in/app-employee-add-task-comment", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const resultJson = await response.json();
      if (resultJson?.success || resultJson?.text === "Success") {
        showToast(resultJson?.message || "Comment sent", "success");
        setComments(prev => [
          ...prev,
          {
            id: Date.now(),
            user_name: profileDetails?.name,
            comment: text.trim(),
            images: images.map(i => i.uri),
            audio: audioAttachment?.uri,
          },
        ]);
        setText("");
        setImages([]);
        setAudioAttachment(null);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      } else {
        showToast(resultJson?.message || "Failed to send comment", "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Something went wrong while sending comment", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff", paddingBottom: isKeyboardOpen ? hp(5) : 0 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CommonHeader title={t("h_task_details")} onBackPress={() => navigation.goBack()} />
      {/* COMMENT LIST */}
      <CommentList
        comments={comments}
        loading={loading}
        ticketDetails={ticketDetails}
        task={task}
        flatListRef={flatListRef}
        openImageViewer={openImageViewer}
      />

      {/* INPUT AREA */}
      <View style={styles.inputContainer}>
        {audioAttachment && (
          <View style={styles.audioPreviewContainer}>
            <Text style={{ marginRight: wp(2) }}> {`🎤 ${'audio_attatched'}`}</Text>
            <TouchableOpacity onPress={removeAudioAttachment}>
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
        {images.length > 0 && (
          <View style={styles.selectedImagesContainer}>
            {images.map((img, index) => (
              <View key={index} style={styles.selectedImageWrapper}>
                <TouchableOpacity onPress={() => openImageViewer(img.uri)}>
                  <Image source={{ uri: img.uri }} style={styles.selectedImage} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`${t('write_a_comment')} ...`}
            style={styles.textInput}
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.attachButton}>
            <Text style={styles.attachText}>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: COLORS.primary }]} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={wp(4)} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>

      <AttachmentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCamera={pickCamera}
        onFile={pickFile}
        onAudioRecorded={handleAudioRecorded}
      />
      <ImageViewerModal
        visible={viewerVisible}
        uri={viewerUri}
        onClose={() => setViewerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", margin: hp(1), color: COLORS.primary, lineHeight: hp(4) },
  inputContainer: { paddingHorizontal: wp(3), paddingVertical: hp(1), borderTopWidth: 1, borderTopColor: "#ddd", backgroundColor: "#fff" },
  inputRow: { flexDirection: "row", alignItems: "center", position: "relative" },
  textInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: wp(2), paddingHorizontal: wp(3), paddingVertical: hp(1), fontFamily: "Poppins_400Regular", fontSize: wp(3.5), maxHeight: hp(12) },
  attachButton: { marginHorizontal: wp(2) },
  attachText: { fontSize: wp(6) },
  sendButton: { paddingHorizontal: wp(4), paddingVertical: hp(1.5), borderRadius: wp(2), justifyContent: "center", alignItems: "center" },
  selectedImagesContainer: { flexDirection: "row", flexWrap: "wrap", marginVertical: hp(1) },
  selectedImageWrapper: { marginRight: wp(2), marginBottom: hp(1), position: "relative" },
  selectedImage: { width: wp(16), height: wp(16), borderRadius: wp(2) },
  removeImageButton: { position: "absolute", top: -wp(2), right: -wp(2), backgroundColor: "#fff", borderRadius: wp(3), padding: 0 },
  removeImageText: { fontSize: wp(6), color: "red" },
  audioPreviewContainer: { flexDirection: "row", alignItems: "center", marginVertical: hp(1) },
});