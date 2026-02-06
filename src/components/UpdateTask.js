import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated, Easing, FlatList, Image,
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { Icon } from "react-native-elements";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { BASE_URL, fetchData } from "./api/Api";
import AttachmentModal from "./AttacthcModal";
import CommonHeader from "./CommonHeader";
import CustomDropdown from "./CustomDropDown";
import ImageViewerModal from "./ImageViewver";
import SpeechToTextModal from "./SpeechToTextMOdal";

export default function UpdateTask({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { id } = route?.params;
  const [currentLanguage, setcurrentLanguage] = useState(null);

  useEffect(() => {

    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordTime((t) => t + 1), 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [newErrors, setNewErrors] = useState({});
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  // 🎙 AUDIO STATE

  const [descAudio, setDescAudio] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [playbackSound, setPlaybackSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechTextModal, setspeechTextModal] = useState(false);
  const [speechFlag, setSpeechFlag] = useState('');


  // ---------------- AUDIO ----------------

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      setIsRecording(true);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);

      // Start interval to update time
      intervalRef.current = setInterval(async () => {
        if (recording) {
          const status = await recording.getStatusAsync();
          setRecordTime(Math.floor(status.durationMillis / 1000));
        }
      }, 200); // update 5 times per second for smooth timer

    } catch (err) {
      console.log(err);
      setIsRecording(false);
    }
  };
  const stopRecording = async () => {
    if (!recording) return;

    // Stop the live timer
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    // Stop recording
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // Get actual duration
    const status = await recording.getStatusAsync();
    const durationSeconds = Math.floor(status.durationMillis / 1000);

    // Store audio info including duration
    setDescAudio({
      uri,
      name: "DescriptionAudio",
      duration: durationSeconds, // store duration
    });

    setRecording(null);
    setIsRecording(false);
    setRecordTime(durationSeconds); // show final duration in UI
  };


  const playAudio = async () => {
    if (!descAudio) return;
    if (playbackSound) await playbackSound.unloadAsync();
    const { sound } = await Audio.Sound.createAsync({ uri: descAudio.uri }, { shouldPlay: true });
    setPlaybackSound(sound);
    setIsPlaying(true);
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.didJustFinish) setIsPlaying(false);
    });
  };

  const stopAudio = async () => {
    if (playbackSound) {
      await playbackSound.stopAsync();
      setIsPlaying(false);
    }
  };

  const deleteAudio = async () => {
    if (playbackSound) await playbackSound.unloadAsync();
    setDescAudio(null);
    setIsPlaying(false);
  };
  const intervalRef = useRef(null);

  const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
  const siteDetails = useSelector((state) => state.auth?.siteDetails?.data?.[0]);
  const { showToast } = useToast();

  const flatListRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const PlayingAnimation = ({ isPlaying }) => {
    const scale = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      if (isPlaying) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.9,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        scale.setValue(1);
      }
    }, [isPlaying]);

    return (
      <Animated.View
        style={[
          styles.playingDot,
          { transform: [{ scale }] },
        ]}
      />
    );
  };
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);

  const [fileModal, setfileModal] = useState(false);

  const openImageViewer = (uri) => {
    setViewerUri(uri);
    setViewerVisible(true);
  };

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load ticket details
  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      const lang = await getStoredLanguage();
      setcurrentLanguage(lang)
      try {
        const lang = await getStoredLanguage();
        const response = await fetchData("app-employee-task-detail", "POST", {
          id,
          lang,
          user_id: profileDetails?.id,
        });
        const ticket = response?.data?.ticket_detail;
        setTicketDetails(ticket);
        const plainText = ticket?.description?.replace(/<[^>]+>/g, "") || "";
        setDescription(plainText);
        setSelectedStatus(ticket?.statusv);
        setSelectedPriority(ticket?.priorityv);
        // Alert.alert(ticket?.priorityv)
        setDescAudio({ uri: ticket?.audio });
        setImages(
          ticket?.image?.map((uri) => ({ uri, source: "API" })) || []
        );
      } catch (err) {
        console.log(err);
        showToast(t("failed_to_load_task_details"), "error");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadTicket();
  }, [id]);
  // Validation
  const deleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    // if (!ticketDetails?.title?.trim()) errors.title = t("title_Required");
    if (!description.trim()) errors.description = t("desc_Required");
    if (!selectedStatus) errors.status = t("pls_selct_status");
    if (!selectedPriority) errors.priority = t("pls_selct_priotty");
    setErrors(errors);
    setNewErrors(errors)
    return Object.keys(errors).length === 0;
  };
  // Update task
  const handleUpdateTask = async () => {
    if (!validate()) {
      showToast(t("failed_to_update_task"), "error");
      return
    };
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", ticketDetails.id);
      formData.append("description", description);
      formData.append("status", selectedStatus);
      formData.append("priority", selectedPriority);
      formData.append("user_id", profileDetails?.id);
      images.forEach((img, index) => {
        const uriParts = img.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("image[]", {
          uri: img.uri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });
      if (descAudio) {
        formData.append("audio", {
          uri: descAudio.uri,
          type: descAudio.type || "audio/mpeg",
          name: `${descAudio.name}.mp3` || "DummyAudio.mp3",
        });
      }
      const response = await fetch(`${BASE_URL}app-employee-update-task`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();
      // Alert.alert(JSON.stringify(result))
      if (result?.success) {
        showToast(result.message || t("task_updated_successfully"), "success");
        navigation.goBack();
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
  // Pick from camera
  const pickCamera = async () => {
    setModalVisible(false);
    setfileModal(false);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const img = result.assets[0];
      setImages((prev) => [...prev, { ...img, source: "Camera" }]);
    }
  };
  // Pick from gallery
  const pickFile = async () => {
    setModalVisible(false);
    setfileModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const selected = result.assets.map((a) => ({ ...a, source: "Gallery" }));
      setImages((prev) => [...prev, ...selected]);
    }
  };
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const listData = ["title", "status", "priority", "description", "images", "button"];
  const renderItem = ({ item }) => {
    switch (item) {
      case "title":
        return (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("title")} *</Text>
            <Text style={styles.readOnlyText}>{ticketDetails?.title || "..."}</Text>
            {newErrors.title && <Text style={styles.errorText}>{newErrors.title}</Text>}
          </View>
        );
      case "status":
        return (
          <>
            <CustomDropdown
              title={t("task_status") + " *"}
              data={siteDetails?.ticketstatusList || []}
              placeholder={t("task_status")}
              selected={selectedStatus}
              onSelect={(item) => setSelectedStatus(item?.value)}
              Value={selectedStatus}
            />
            {newErrors.status && <Text style={styles.errorText}>{newErrors.status}</Text>}
          </>
        );
      case "priority":
        return (
          <>
            <CustomDropdown
              title={t("task_priority") + " *"}
              data={siteDetails?.prioritiesList || []}
              placeholder={t("choose_priority")}
              selected={selectedPriority}
              onSelect={(item) => setSelectedPriority(item?.value)}
            />
            {newErrors.priority && <Text style={styles.errorText}>{newErrors.priority}</Text>}
          </>
        );
      case "description":
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{t("description")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                style={styles.textInput}
                placeholder={t("description")}
              />
              {errors.description && <Text style={styles.error}>{errors.description}</Text>}
              {
                descAudio && (
                  <TouchableOpacity style={styles.mic}
                    // onPress={startRecording}
                    onPress={() => {
                      setspeechTextModal(true),
                        setSpeechFlag('description')
                    }}
                  >
                    <Icon name="mic" type="feather" size={wp(5)} color={COLORS.gray} />
                  </TouchableOpacity>
                )}
            </View>
            {/*  */}
            <View style={{ width: wp(90), marginVertical: hp(1.5) }}>
              {descAudio ? (
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
                  {/* 🎵 File name + animation */}
                  <View style={styles.audioInfo}>
                    <PlayingAnimation isPlaying={isPlaying} />
                    <Text numberOfLines={1} style={styles.audioName}>
                      {descAudio.name || "DescriptionAudio.mp3"}
                    </Text>
                    {descAudio.duration && (
                      <Text style={styles.audioName}>{`(${descAudio.duration}s)`}</Text>
                    )}
                  </View>

                  {/* ▶️ Play / Pause */}
                  <TouchableOpacity onPress={isPlaying ? stopAudio : playAudio}>
                    <Icon
                      name={isPlaying ? "pause" : "play-arrow"}
                      size={wp(7)}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>

                  {/* ❌ Delete */}
                  <TouchableOpacity onPress={deleteAudio}>
                    <Icon name="x-circle" type="feather" size={wp(7)} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    {
                      justifyContent: "flex-start", // Align content to start
                      borderWidth: wp(0.3),
                      borderColor: "#ccc",
                      borderRadius: wp(2),
                      paddingVertical: wp(0.5),
                      paddingHorizontal: wp(2), // Add some left padding
                      height: hp(6),
                      alignItems: "center",
                      flexDirection: "row",
                      width: "100%",
                    },
                  ]}
                  onPress={startRecording} // function to start recording
                >
                  <Icon
                    name={"mic"}
                    size={wp(6)}
                    color={COLORS.gray}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Poppins_400Regular",
                      color: COLORS?.gray,
                      fontSize: wp(3.5),
                      marginLeft: wp(2), // Space between icon and text
                    }}
                    ellipsizeMode="tail"
                  >
                    {t("add_description_audio")}
                  </Text>
                </TouchableOpacity>

              )}
            </View>


          </View>
        );


      case "images":
        return (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t("images")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: wp(2) }}>
              {/* Render existing images */}
              {images?.map((img, idx) => (
                <Pressable
                  onPress={() => openImageViewer(img?.uri)}
                  key={idx}
                  style={{
                    position: "relative",
                    width: wp(26),
                    height: hp(14),
                    marginRight: wp(2),
                    marginBottom: hp(1),
                  }}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={{ width: "100%", height: "100%", borderRadius: wp(2) }}
                    resizeMode="cover"
                  />

                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      flexDirection: "row",
                      gap: wp(1),
                      zIndex: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => deleteImage(idx)}
                      style={{
                        backgroundColor: "#ddd",
                        borderRadius: wp(5),
                        padding: wp(1.5),
                      }}
                    >
                      <Ionicons name="trash" size={wp(6)} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ))}

              {/* Show Add Image button only if images < 3 */}
              {images.length < 3 && (
                <TouchableOpacity
                  onPress={() => setfileModal(true)}
                  style={{
                    width: wp(26),
                    height: hp(14),
                    backgroundColor: "#eee",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: wp(2),
                    marginRight: wp(2),
                    marginBottom: hp(1),
                  }}
                >
                  <Ionicons name="add" size={wp(10)} color={COLORS.primary} />
                  <Text style={{ marginTop: 5, color: COLORS.primary }}>{t("add_image")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case "button":
        return (
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateTask} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>{t("update_task")}</Text>}
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <CommonHeader title={t("update_task")} showBackButton onBackPress={() => navigation.goBack()} />
      {loading ? (
        <FlatList
          style={styles.container}
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <View style={[styles.skeletonBox, { width: "100%", height: hp(7), marginBottom: hp(1.5) }]} />}
          keyExtractor={(item, index) => `skeleton-${index}`}
          ListFooterComponent={<ActivityIndicator size={wp(8)} color={COLORS?.primary} />}
          contentContainerStyle={{ padding: wp(5), flexGrow: 1 }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.container}
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            padding: wp(5),
            paddingBottom: isKeyboardOpen ? hp(40) : wp(5),
          }}
        />
      )}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              {/* Camera */}
              <TouchableOpacity
                onPress={pickCamera}
                style={[styles.iconButton, { backgroundColor: "#E3F2FD" }]}
              >
                <Icon
                  name="camera"
                  type="feather"
                  size={wp(7)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              {/* Gallery */}
              <TouchableOpacity
                onPress={pickFile}
                style={[styles.iconButton, { backgroundColor: "#E8F5E9" }]}
              >
                <Icon
                  name="image"
                  type="feather"
                  size={wp(7)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.iconButton, {
                backgroundColor: "#FDECEA",
                alignSelf: "center", marginTop: hp(2)
              }]}
            >
              <Icon
                name="x-circle"
                type="feather"
                size={wp(7)}
                color="red"
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal transparent visible={isRecording}>
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingBox}>
            <Text style={styles.recordingText}>{`${t('recording')}...`}</Text>
            <Text style={styles.recordingTime}>{recordTime}s</Text>
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Text style={{ color: "#fff" }}>{t('stop')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ImageViewerModal
        visible={viewerVisible}
        uri={viewerUri}
        onClose={() => setViewerVisible(false)}
      />
      <SpeechToTextModal
        visible={speechTextModal}
        title={speechFlag == 'title' ? 'add_title' : 'add_description'}
        onClose={() => setspeechTextModal(false)}
        currentLanguage={currentLanguage}
        onResult={(value) =>
          speechFlag === 'title'
            ? setTitle((prev) => prev + value)
            : setDescription((prev) => prev + value)
        }
      />
      <AttachmentModal
        visible={fileModal}
        onClose={() => setfileModal(false)}
        onCamera={pickCamera}
        onFile={pickFile}
        // onAudioRecorded={handleAudioRecorded}
        hideMic={true}
      />
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  skeletonBox: { backgroundColor: "#e0e0e0", borderRadius: wp(1), marginVertical: hp(0.5) },
  fieldContainer: { marginBottom: hp(2) },
  label: { fontSize: wp(4), fontFamily: "Poppins_400Regular", color: "#000", marginBottom: hp(0.5) },
  readOnlyText: { fontSize: wp(4), fontFamily: "Poppins_500Medium", color: "#333", backgroundColor: "#eee", padding: wp(3), borderRadius: wp(2) },
  textInput: { fontSize: wp(4), fontFamily: "Poppins_400Regular", color: "#111", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: wp(2), padding: wp(3), minHeight: hp(12), textAlignVertical: "top" },
  audioRow: {
    marginTop: hp(1),
    borderRadius: wp(20),
  }, audioInfo: {
    flexDirection: "row", alignItems: "center", gap: wp(2), flex: 1,

  }, audioName: { fontSize: wp(3), lineHeight: hp(3), fontFamily: "Poppins_400Regular", color: COLORS.black, }, playingDot: {
    width: wp(2.5), height: wp(2.5), borderRadius: wp(1.25), backgroundColor: COLORS.primary,
  },
  updateButton: { backgroundColor: COLORS.primary, paddingVertical: hp(1.5), borderRadius: wp(2), alignItems: "center", marginTop: hp(2) },
  updateButtonText: { color: "#fff", fontSize: wp(4.5), fontFamily: "Poppins_600SemiBold" },
  errorText: { color: "red", marginTop: hp(0.5), fontSize: wp(3.5) },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", padding: hp(5), borderTopLeftRadius: wp(5), borderTopRightRadius: wp(5) },
  modalButton: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center",
    gap: wp(3), paddingVertical: hp(2),
  },
  mic: { position: "absolute", right: wp(3), top: hp(1.5) }, audioRow: { flexDirection: "row", gap: wp(4), marginTop: hp(1), paddingHorizontal: wp(2) }, btn: { backgroundColor: COLORS.primary, padding: wp(3), borderRadius: wp(2), alignItems: "center" }, btnText: { color: "#fff", fontSize: wp(4.5) }, error: { color: "red", marginTop: hp(0.5) }, recordingOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }, recordingBox: { width: wp(80), height: wp(80), borderRadius: wp(40), backgroundColor: "#fff", alignItems: "center", justifyContent: "center", }, recordingText: { fontSize: wp(4) }, recordingTime: { fontSize: wp(5), marginVertical: hp(2) }, stopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: wp(6), paddingVertical: hp(1), borderRadius: wp(2) },
  iconButton: {
    width: wp(16), height: wp(16),
    borderRadius: wp(8), alignItems: "center", justifyContent: "center",
    elevation: 5, // Android shadow    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  modalButtonText: { fontSize: wp(4.2), textAlign: "center", fontFamily: "Poppins_500Medium" },
});
