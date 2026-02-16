import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { BASE_URL, fetchData } from "./api/Api";
import AttachmentModal from "./AttacthcModal";
import CommentList from "./Commentlist";
import CommonHeader from "./CommonHeader";
import MediaViewerModal from "./MediaView";

export default function TaskMessages({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { task } = route?.params || {};
  const { t } = useTranslation();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [vidoe, setVideo] = useState([]);
  const [audioAttachment, setAudioAttachment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const flatListRef = useRef(null);

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        150
      );
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const openMediaViewer = (item) => {
    setSelectedMedia(item);
    setViewerVisible(true);
  };

  const loadCommentsD = async () => {
    const lang = await getStoredLanguage();
    setLoading(true);
    try {
      const response = await fetchData("app-employee-task-detail", "POST", {
        id: task?.id,
        lang,
        user_id: profileDetails?.id,
      });
      setTicketDetails(response?.data?.ticket_detail);
      setComments(response?.data?.ticket_comments || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const removeMedia = (index, isVideo) => {
    if (isVideo) {
      setVideo([]);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };


  // Load comments when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!task?.id) return;
      loadCommentsD();
    }, [task])
  );

  // Unified media picker
  const pickMedia = async (source) => {
    setModalVisible(false);
    // Request permissions
    let permissionResult;
    if (source === "camera") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult?.granted) return;

    const options = {
      mediaTypes:
        mediaType === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    };

    if (mediaType === "image" && source === "gallery") {
      options.allowsMultipleSelection = true;
      options.selectionLimit = 3 - images.length;
    }

    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets?.length > 0) {
      if (mediaType === "video") {
        const selectedVideo = {
          ...result.assets[0],
          source: source === "camera" ? "Camera" : "Gallery",
        };

        setVideo([selectedVideo]); // store in video state
      } else {
        const selectedImages = result.assets.map((a) => ({
          ...a,
          source: source === "camera" ? "Camera" : "Gallery",
        }));

        setImages((prev) => [...prev, ...selectedImages]);
      }
    }
  };
  const handleAudioRecorded = (audio) => setAudioAttachment(audio);
  const removeAudioAttachment = () => setAudioAttachment(null);

  const handleSend = async () => {
    if (!text.trim() && images.length === 0 && !audioAttachment && !vidoe.length) {
      showToast(
        "Please write a comment, select an image, or record audio",
        "error"
      );
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
        formData.append("image[]", {
          uri: img.uri,
          name: `comment_${Date.now()}_${index}.jpg`,
          type: img.mimeType || "image/jpeg",
        });
      });
      vidoe.forEach((img, index) => {
        formData.append("video", {
          uri: img.uri,
          name: `comment_${Date.now()}_${index}`,
          type: img.mimeType || "mp4",
        });
      });
      if (audioAttachment) {
        formData.append("audio", {
          uri: audioAttachment.uri,
          name: `audio_${Date.now()}.m4a`,
          type: "audio/m4a",
        });
      }

      const response = await fetch(`${BASE_URL}app-employee-add-task-comment`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const resultJson = await response.json();

      if (resultJson?.success || resultJson?.text === "Success") {
        showToast(resultJson?.message || "Comment sent", "success");
        setComments((prev) => [
          ...prev,
          {
            id: Date.now(),
            user_name: profileDetails?.name,
            comment: text.trim(),
            images: images.map((i) => i.uri),
            audio: audioAttachment?.uri,
          },
        ]);
        setText("");
        setImages([]);
        setAudioAttachment(null);
        setVideo([]);
        loadCommentsD();
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
  const mediaList = [...images, ...vidoe];

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: isKeyboardOpen ? hp(5) : 0,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CommonHeader
        title={task?.title}
        onBackPress={() => navigation.goBack()}
      />
      <CommentList
        comments={comments}
        loading={loading}
        ticketDetails={ticketDetails}
        task={task}
        flatListRef={flatListRef}
        openImageViewer={(uri) => openMediaViewer({ uri, type: "image" })}
        openVideoViewer={(uri) => openMediaViewer({ uri, type: "video" })} loadData={loadCommentsD}
      />
      <View style={styles.inputWrapper}>
        {audioAttachment && (
          <View style={styles.audioPreviewContainer}>
            <Text style={{ marginRight: wp(2) }}>🎤 Audio Attached</Text>
            <TouchableOpacity onPress={removeAudioAttachment}>
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
        {mediaList.length > 0 && (
          <View style={styles.selectedImagesContainer}>
            {mediaList.map((item, index) => {
              const isVideo = item.type?.includes("video");
              return (
                <View key={index} style={styles.selectedImageWrapper}>
                  <TouchableOpacity
                    onPress={() => openMediaViewer(item)}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.selectedImage}
                    />

                    {/* Show play icon if video */}
                    {isVideo && (
                      <View style={styles.playIconContainer}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeMedia(index, isVideo)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}


        <View style={styles.bottomRow}>
          <View style={styles.textInputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={`${t("write_a_comment")} ...`}
              style={styles.textInput}
              placeholderTextColor="#666"
              multiline
            />
            <TouchableOpacity
              onPress={() => {
                setMediaType("image");
                setModalVisible(true);
              }}
              style={styles.inlineIcon}
            >
              <FontAwesome name="image" size={wp(7)} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMediaType("video");
                setModalVisible(true);
              }}
              style={styles.inlineIcon}
            >
              <Ionicons name="videocam-outline" size={wp(7)} color="#000" />
            </TouchableOpacity>
          </View>

          {sending ? (
            <ActivityIndicator color={COLORS?.primary} size={wp(8)} style={{ alignSelf: "center", marginHorizontal: wp(2) }} />
          ) : text.trim() || audioAttachment || mediaList.length > 0 ? (
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, {
                left: hp(0.1),
                bottom: hp(0.2),
              }]}
              disabled={sending}
            >
              <Ionicons
                name="send"
                size={wp(8.8)}
                color={COLORS.primary}
                style={{ marginRight: wp(2) }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setMediaType("mic");
                setModalVisible(true);
              }}
              style={[styles.attachButton, {
                left: hp(0.5),
                bottom: hp(0.9),
              }]}
            >
              <Ionicons name="mic" size={wp(9)} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <AttachmentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCamera={() => pickMedia("camera")}
        onFile={() => pickMedia("gallery")}
        onAudioRecorded={handleAudioRecorded}
        hideMic={mediaType !== "mic"}
        mediaType={mediaType}
        setmediaType={setMediaType}
      />
      <MediaViewerModal
        visible={viewerVisible}
        uri={selectedMedia?.uri}
        type={
          selectedMedia?.type?.includes("video") ? "video" : "image"
        }
        onClose={() => {
          setViewerVisible(false);
          setSelectedMedia(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  inputWrapper: {
    padding: wp(1), backgroundColor: "#fff", borderTopWidth: 1,
    borderTopColor: "#ddd",
  }, playIconContainer: {
    position: "absolute", top: hp(0.5), left: wp(3),
    borderRadius: wp(10),
    padding: wp(1),
  }, playIcon: {
    color: "#ccc",
    fontSize: wp(8),
  },
  bottomRow: {
    flexDirection: "row", alignItems: "flex-end",
  }, textInputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f0f0f0", borderRadius: wp(8),
    paddingHorizontal: wp(4), marginHorizontal: wp(1), borderWidth: wp(0.3), borderColor: "#999",
    maxHeight: hp(15),
    width: wp(83),
  }, textInput: {
    flex: 1,
    paddingVertical: hp(1.9), fontSize: wp(3.6), fontFamily: "Poppins_400Regular", lineHeight: wp(5.5),
    color: "#000",
  }, inlineIcon: {
    marginLeft: wp(4),
  }, attachButton: {
    justifyContent: "center",
    alignItems: "center", position: "relative",
    bottom: hp(0.5), marginHorizontal: wp(1),
  }, sendButton: {
    paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(20),
    justifyContent: "center", alignItems: "center",
  },
  selectedImagesContainer: {
    flexDirection: "row", flexWrap: "wrap", marginVertical: hp(1),
  }, selectedImageWrapper: {
    marginRight: wp(2), marginBottom: hp(1),
    position: "relative",
  }, selectedImage: { width: wp(16), height: wp(16), borderRadius: wp(2) },
  removeImageButton: {
    position: "absolute", top: -wp(2), right: -wp(2),
    backgroundColor: "#fff", borderRadius: wp(3), padding: 0,
  }, removeImageText: { fontSize: wp(6), color: "red" }, audioPreviewContainer: {
    flexDirection: "row",
    alignItems: "center", marginVertical: hp(1),
  },
});
