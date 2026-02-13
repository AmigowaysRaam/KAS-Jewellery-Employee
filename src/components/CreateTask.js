import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { Audio, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image, Keyboard, KeyboardAvoidingView,
  Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, View
} from "react-native";
import { Icon } from "react-native-elements";
import { ActivityIndicator } from "react-native-paper";
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
import CustomSingleDatePickerModal from "./SingleDateSelect";
import SpeechToTextModal from "./SpeechToTextMOdal";
import TeamMembersView from "./TeamMemView";
import UserCustomDropdown from "./UserSelect";
export default function CreateTask() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { showToast } = useToast();
  // -------- TEXT STATES --------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // -------- AUDIO STATES --------
  const [titleAudio, setTitleAudio] = useState(null);
  const [descAudio, setDescAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFor, setRecordingFor] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [playbackSoundTitle, setPlaybackSoundTitle] = useState(null);
  const [playbackSoundDesc, setPlaybackSoundDesc] = useState(null);
  const [isPlayingTitle, setIsPlayingTitle] = useState(false);
  const [isPlayingDesc, setIsPlayingDesc] = useState(false);
  const [playPositionTitle, setPlayPositionTitle] = useState(0);
  const [playPositionDesc, setPlayPositionDesc] = useState(0);
  const [playDurationTitle, setPlayDurationTitle] = useState(0);
  const [playDurationDesc, setPlayDurationDesc] = useState(0);
  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [dropDownData, setdropDownData] = useState({ teams: [], users: [] });
  const [mediaModal, setmediaModal] = useState(false);
  const [assignedBy, setAssignedBy] = useState(null);
  const [assignType, setAssignType] = useState("individual");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [priority, setpriority] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { t } = useTranslation()
  const [errors, setErrors] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setloading] = useState(false);
  const [speechTextModal, setspeechTextModal] = useState(false);
  const [speechFlag, setSpeechFlag] = useState('');
  const [currentLanguage, setcurrentLanguage] = useState(null);
  const [mediaTypes, setmediaTypes] = useState('video');
  const [images, setImages] = useState([]);
  const [video, setvideo] = useState(null);

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    fetchDropDownData();
  }, [selectedTeam, assignType, assignedBy, priority]);

  useEffect(() => {
    setErrors({});
  }, [title, description]);
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordTime((t) => t + 1), 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const fetchDropDownData = async () => {
    if (!profileDetails?.id) return;
    setloading(true);
    try {
      const lang = await getStoredLanguage();
      setcurrentLanguage(lang)
      const response = await fetchData(
        "app-employee-team-members",
        "POST",
        {
          user_id: profileDetails.id,
          lang: lang ?? "en",
          team_id: selectedTeam ? selectedTeam?.value : null,
          assignType: assignType,
          assignedBy: assignedBy ? assignedBy?.value : null,
          priority: priority ? priority?.value : null
        }
      );
      if (response?.data) {
        setdropDownData(response.data);
        setDueDate(response.data?.max_date ? dayjs(response.data.max_date).toDate() : null)
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setloading(false);
    }
  };

  const ensureAudioPermission = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Audio.requestPermissionsAsync();

        if (newStatus !== "granted") {
          showToast("Microphone permission is required", "error");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.log("Permission error:", err);
      return false;
    }
  };

  const titleRef = useRef(null);
  const descRef = useRef(null);

  // -------- AUDIO RECORDING -------- 
  const startRecording = async (forField) => {
    try {
      const hasPermission = await ensureAudioPermission();
      if (!hasPermission) return;
      setRecordingFor(forField);
      setIsRecording(true);
      // await Audio.setAudioModeAsync({ 
      //   allowsRecordingIOS: true, 
      //   playsInSilentModeIOS: true, 
      //   staysActiveInBackground: false, 
      //   interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, 
      // }); 
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.log("Recording error:", err);
      setIsRecording(false);
    }
  };

  const pickMedia = async (source) => {
    setmediaModal(false);
    // Request permission based on source
    let hasPermission = false;
    if (source === "camera") {
      hasPermission = await requestCameraPermission();
    } else if (source === "gallery") {
      hasPermission = await requestGalleryPermission();
    }

    if (!hasPermission) return;

    // Picker options based on media type
    const options = {
      mediaTypes:
        mediaTypes === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    };

    // Allow multiple selection for images from gallery
    if (mediaTypes === "image" && source === "gallery") {
      options.allowsMultipleSelection = true;
      options.selectionLimit = 3 - images.length;
    }

    // Launch camera or gallery
    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options);
    } else if (source === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets?.length > 0) {
      if (mediaTypes === "video") {
        // Single video: replace previous
        setvideo([{ ...result.assets[0], source: source === "camera" ? "Camera" : "Gallery" }]);
      } else {
        // Images: append selected images
        const selectedImages = result.assets.map(a => ({
          ...a,
          source: source === "camera" ? "Camera" : "Gallery",
        }));
        setImages(prev => [...prev, ...selectedImages]);
      }
    }
  };


  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const { sound, status } = await Audio.Sound.createAsync({ uri });
      const duration = status.durationMillis
        ? Math.floor(status.durationMillis / 1000)
        : 0;
      await sound.unloadAsync();

      const audioData = {
        uri,
        name: recordingFor === "title" ? "TitleAud" : "DescAud",
        duration,
      };
      if (recordingFor === "title") setTitleAudio(audioData);
      else setDescAudio(audioData);

      setRecording(null);
      setRecordingFor(null);
    } catch (err) {
      console.log("Stop recording error:", err);
    }
  };
  const playAudio = async (audio, type) => {
    if (!audio) return;
    try {
      if (type === "title") {
        if (playbackSoundTitle) await playbackSoundTitle.unloadAsync();
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: audio.uri },
          { shouldPlay: true }
        );
        setPlaybackSoundTitle(sound);
        setIsPlayingTitle(true);
        setPlayDurationTitle(status.durationMillis || 0);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlayPositionTitle(status.positionMillis);
            setPlayDurationTitle(status.durationMillis || 0);
            if (status.didJustFinish) setIsPlayingTitle(false);
          }
        });
      } else {
        if (playbackSoundDesc) await playbackSoundDesc.unloadAsync();
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: audio.uri },
          { shouldPlay: true }
        );
        setPlaybackSoundDesc(sound);
        setIsPlayingDesc(true);
        setPlayDurationDesc(status.durationMillis || 0);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlayPositionDesc(status.positionMillis);
            setPlayDurationDesc(status.durationMillis || 0);
            if (status.didJustFinish) setIsPlayingDesc(false);
          }
        });
      }
    } catch (err) {
      console.log("Playback error:", err);
    }
  };
  const stopAudio = async (type) => {
    if (type === "title" && playbackSoundTitle) {
      await playbackSoundTitle.stopAsync();
      setIsPlayingTitle(false);
    } else if (type === "desc" && playbackSoundDesc) {
      await playbackSoundDesc.stopAsync();
      setIsPlayingDesc(false);
    }
  };
  const deleteAudio = (field) => {
    if (field === "title") {
      setTitleAudio(null);
      if (playbackSoundTitle) playbackSoundTitle.unloadAsync();
      setIsPlayingTitle(false);
    } else {
      setDescAudio(null);
      if (playbackSoundDesc) playbackSoundDesc.unloadAsync();
      setIsPlayingDesc(false);
    }
  };
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  // -------- VALIDATION & SUBMIT --------
  const validate = () => {
    // Alert.alert()
    const newErrors = {};
    if (!title.trim()) newErrors.title = t('title_Required');
    if (!description.trim()) newErrors.description = t('desc_Required');
    if (!priority?.value.trim()) newErrors.priority = t('priority_required');
    if (!assignedBy && dropDownData?.canAssign) newErrors.assignedBy = t('pls_Selct_user');
    if (
      // assignType === "group" && 
      !selectedTeam)
      newErrors.selectedTeam = t('pls_Selct_team');
    if (!dueDate) newErrors.dueDate = t('pls_Selct_due_date');
    if (!dueTime) newErrors.dueTime = t('pls_Selct_due_time');
    // Focus first invalid field
    if (newErrors.title) {
      titleRef.current?.focus();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (newErrors.description) {
      descRef.current?.focus();
      scrollRef.current?.scrollTo({ y: 1, animated: true });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const [lang, setLang] = useState(null);


  const handleSubmit = async () => {

    if (!validate()) return;

    const combinedDateTime = dayjs(dueDate)
      .hour(dueTime.getHours())
      .minute(dueTime.getMinutes())
      .second(0);

    if (!profileDetails?.id) return;
    setloading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", profileDetails.id.toString());
      formData.append("assign_to_type", assignType);
      formData.append("assign_to", selectedTeam?.value?.toString() || "");
      formData.append("title", title);
      formData.append("description", description);
      formData.append("assign_by", profileDetails.id.toString());
      formData.append("priority", priority?.value?.toString() || "1");
      formData.append("due_date", combinedDateTime.format("YYYY-MM-DD"));
      formData.append("due_time", combinedDateTime.format("HH:mm")); // 24-hour format
      images.forEach((img, index) => {
        formData.append("image[]", {
          uri: img.uri,
          name: `task${Date.now()}_${index}.jpg`,
          type: img.mimeType || "image/jpeg",
        });
      });
      if (video?.length > 0) {
        console.log("Appending video to FormData:", video[0]);
        formData.append("video", {
          uri: video[0].uri,
          name: video[0].fileName || `video_${Date.now()}.mp4`,
          type: video[0].mimeType || "video/mp4",
        });
      }
      if (descAudio) {
        formData.append("audio", {
          uri: descAudio.uri,
          type: descAudio.type || "audio/mpeg",
          name: `${descAudio.name}.mp3` || "DummyAudio.mp3",
        });
      }
      const response = await fetch(`${BASE_URL}app-employee-create-task`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const resultJson = await response.json();
      console.log("Parsed Result:", resultJson);

      if (resultJson?.success) {
        showToast(resultJson.message, 'success');
        navigation?.goBack();
      } else {
        showToast(resultJson?.message || "Failed to create task", 'error');
      }

    } catch (error) {
      console.error("API Error:", error);
      showToast("Something went wrong while creating task", 'error');
    } finally {
      setloading(false);
    }
  };
  const openImageViewer = (uri) => {
    setViewerUri(uri);
    setViewerVisible(true);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showToast(t("camera_permission_required"), "error");
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast(t("gallery_permission_required"), "error");
      return false;
    }
    return true;
  };
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", }} pointerEvents={loading ? "none" : "auto"}>
      <CommonHeader
        title={t('create_task')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {/* {loading && <ActivityIndicator color={COLORS?.primary} style={{
        marginTop: hp(5), opacity: 3
      }} />} */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              padding: wp(4),
              paddingBottom: isKeyboardVisible ? keyboardHeight + hp(0) : hp(1), // increase more if keyboard is open
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* -------- TITLE -------- */}
            <View style={styles.inputContainer}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: wp(0.5) }}>
                <Text style={styles.label}>{`${t("title")} *`}</Text>

              </View>
              <TextInput
                ref={titleRef}
                maxLength={30}
                style={styles.input}
                placeholder={t('enter_task_title')}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={'#777'}
              />
              <Icon
                name="mic"
                type="feather"
                size={wp(5)}
                color={COLORS.gray}
                containerStyle={[styles.inputIcon, {
                  top: hp(5.5)
                }]}
                onPress={() => {
                  setspeechTextModal(true),
                    setSpeechFlag('title')
                }}
              />
            </View>
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            {/* -------- DESCRIPTION -------- */}
            <View style={styles.inputContainer}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: wp(0.5) }}>
                <Text style={styles.label}>{`${t("description")} *`}</Text>
              </View>
              <TextInput
                ref={descRef}
                style={[styles.input, { height: hp(15), textAlignVertical: "top", paddingRight: wp(12) }]} // Add right padding for mic
                placeholder={t('enter_task_desc')}
                value={description}
                onChangeText={setDescription}
                multiline
                onFocus={scrollToBottom}
                placeholderTextColor={'#777'}
              />
              {errors.description && (
                <Text style={[styles.errorText, {
                  marginTop: wp(2)
                }]}>{errors.description}</Text>
              )}
              {
                !descAudio &&
                <Pressable
                  onPress={() => startRecording("desc")}
                  // onPress={() => {
                  //   setspeechTextModal(true),
                  //     setSpeechFlag('description')
                  // }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: wp(0.3), borderColor: COLORS?.gray, paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: wp(1), gap: wp(2), height: hp(6), marginVertical: hp(2)
                  }}
                >
                  <Icon
                    name={"mic"}
                    size={wp(7)}
                    color={"#777"}
                  />
                  <Text numberOfLines={1} style={{ fontFamily: "Poppins_400Regular", color: "#777", fontSize: wp(4) }} ellipsizeMode="tail">
                    {t("add_description_audio")}
                  </Text>
                </Pressable>
              }
              {
                descAudio ? (
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center", justifyContent: "space-between",
                    borderWidth: wp(0.3), borderColor: COLORS?.gray, paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: wp(2), gap: wp(2), height: hp(6), marginVertical: hp(2)
                  }}>
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: wp(3.5),
                        marginRight: wp(1),
                        lineHeight: wp(6)

                      }}
                    >
                      {descAudio.name} (
                      {descAudio.duration
                        ? formatTime(descAudio.duration * 1000)
                        : recordTime > 0
                          ? formatTime(recordTime * 1000)
                          : "0:00"}
                      ){isPlayingDesc ? t('playing') : ''}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() =>
                          isPlayingDesc
                            ? stopAudio("desc")
                            : playAudio(descAudio, "desc")
                        }
                      >
                        <Icon
                          name={isPlayingDesc ? "pause" : "play-arrow"}
                          size={wp(10)}
                          color={COLORS.green}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteAudio("desc")}
                      >
                        <Icon
                          name="x-circle"
                          type="feather"
                          size={wp(8)}
                          color={COLORS.red}
                        />
                      </TouchableOpacity>
                      {/* <TouchableOpacity
                        onPress={() => saveLocalAudioToDownloads(descAudio?.uri, descAudio?.name || "audio.mp3")}
                        style={{ marginLeft: wp(2) }}
                      >
                        {isDownloading ? (
                          <ActivityIndicator color={COLORS.primary} />
                        ) : (
                          <Icon name="download" size={wp(6)} color={COLORS.primary} />
                        )}
                      </TouchableOpacity> */}

                    </View>
                  </View>
                ) : (
                  null
                )}
              <TouchableOpacity
                style={styles.micIconContainer} // Absolute inside TextInput
                // onPress={() => startRecording("desc")}
                onPress={() => {
                  setspeechTextModal(true),
                    setSpeechFlag('description')
                }}
              >
                <Icon name="mic" type="feather" size={wp(5)} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: wp(4) }}>
              <Text style={styles.label}>{t("images")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: wp(2) }}>
                {images.map((img, idx) => (
                  <View key={idx} style={{ position: "relative", width: wp(26), height: hp(15), marginRight: wp(2), marginBottom: hp(1) }}>
                    <Pressable onPress={() => openImageViewer(img.uri)} >
                      <Image source={{ uri: img.uri }} style={{ width: "100%", height: wp(26), borderRadius: wp(2) }} resizeMode="contain" />
                    </Pressable>
                    <Pressable
                      onPress={() => removeImage(idx)}
                      style={{ position: "absolute", top: -wp(2), right: -wp(2), backgroundColor: "red", borderRadius: wp(3), padding: wp(1) }}
                    >
                      <Icon name="trash" type="feather" size={wp(4)} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {images.length < 3 && (
                  <Pressable
                    // onPress={() => setmediaModal(true)}
                    onPress={() => { setmediaTypes('image'), setmediaModal(true) }}
                    style={{ borderWidth: wp(0.4), height: wp(28), width: wp(25), alignItems: "center", justifyContent: "center", borderRadius: wp(2), borderColor: COLORS?.primary, backgroundColor: "#f9f9f9" }}
                  >
                    <Icon name="plus" type="feather" size={wp(5.5)} color={COLORS.primary} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={{ marginBottom: wp(4) }}>
              <Text style={styles.label}>{t("video")}</Text>
              <View style={{ flexDirection: "column", gap: wp(2) }}>

                {/* Add new video button (only show if no video) */}
                {!video && (
                  <Pressable
                    onPress={() => {
                      setmediaTypes("video");
                      setmediaModal(true);
                    }}
                    style={{
                      borderWidth: wp(0.4),
                      height: wp(35), // taller button for full-width
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: wp(2),
                      borderColor: COLORS?.primary,
                      backgroundColor: "#f9f9f9",
                      borderStyle: "dashed",
                      marginBottom: wp(2),
                    }}
                  >
                    <Icon name="plus" type="feather" size={wp(7)} color={COLORS.primary} />
                  </Pressable>
                )}
                {/* Video preview (full width) */}
                {video && (
                  <View
                    style={{
                      width: "100%",
                      height: wp(35), // same height as button
                      position: "relative",
                      marginBottom: wp(2),
                      borderWidth: wp(0.4), borderColor: COLORS?.gray, borderRadius: wp(2)
                    }}
                  >
                    <Video
                      source={{ uri: video[0].uri }}
                      style={{ width: "95%", height: "90%", borderRadius: wp(2), alignSelf: 'center', marginTop: hp(1) }}
                      resizeMode="cover"
                      useNativeControls
                      usePoster={true}
                      isLooping={true}
                    />
                    {/* Remove button */}
                    <Pressable
                      onPress={() => setvideo(null)}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderRadius: 16,
                        padding: 4,
                        zIndex: 10,
                      }}
                    >
                      <Icon name="trash" type="feather" size={wp(5)} color="#ff0000" />
                    </Pressable>
                    {/* <Text>{JSON.stringify(video)}</Text> */}
                  </View>
                )}
              </View>
            </View>
            <Modal transparent visible={isRecording} animationType="fade">
              <View style={styles.recordingOverlay}>
                <View style={styles.recordingPopup}>
                  <Text style={[styles.recordingText, {
                    fontSize: wp(lang == 'ta' ? 2.5 : 3.5)
                  }]}>
                    {`${t('recording')}`} {recordingFor === "title" ? t('title') : t('descption')}...
                  </Text>
                  <Text style={styles.recordingTime}>{recordTime}s</Text>
                  <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                    <Text style={styles.stopButtonText}>{t('stop')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            {
              dropDownData?.canAssign &&
              <CustomDropdown
                title={`${t('assignBy')} *`}
                data={dropDownData?.users}
                placeholder={`${t('select_user')}`}
                onSelect={(item) => setAssignedBy(item)}
                selected={assignedBy?.label}
              />
            }
            {/* <Text style={styles.label}>{JSON.stringify(assignedBy?.value)}</Text> */}
            {errors.assignedBy && <Text style={styles.errorText}>{errors.assignedBy}</Text>}
            <Text style={styles.label}>{`${t('assignto')} *`}</Text>
            <View style={styles.radioContainer}>
              <Pressable
                style={styles.radioButton}
                onPress={() => setAssignType("individual")}
              >
                <Icon
                  name={assignType === "individual" ? "check-circle" : "circle"}
                  type="feather"
                  size={wp(5.5)}
                  color={COLORS.primary}
                  style={{ marginRight: hp(1) }}
                />
                <Text style={styles.radioLabel}>{`${t('individual')}`}</Text>
              </Pressable>
              <Pressable
                style={styles.radioButton}
                onPress={() => setAssignType("group")}
              >
                <Icon
                  name={assignType === "group" ? "check-circle" : "circle"}
                  type="feather"
                  size={wp(5.5)}
                  color={COLORS.primary}
                  style={{ marginRight: hp(1) }}
                />
                <Text style={styles.radioLabel}>{`${t('group')}`}</Text>
              </Pressable>
            </View>
            {
              assignType && (
                <UserCustomDropdown
                  loading={loading}
                  assignType={assignType}
                  title={`${t(assignType == 'group' ? 'select_team' : "select_user")} *`}
                  data={assignType == 'group' ? dropDownData?.teams : dropDownData?.individual_users}
                  placeholder={`${t(assignType == 'group' ? 'select_team' : "select_user")}`}
                  // onSelect={(item) => setSelectedTeam(item)}
                  selected={selectedTeam?.value} // pass selected item
                  onSelect={(item) => setSelectedTeam(item)} // update selected item
                />
              )}
            {
              errors.selectedTeam && <Text style={styles.errorText}>{`${t(assignType == 'group' ? 'select_team' : "select_user")}`}</Text>
            }
            {assignType === "group" && selectedTeam?.value &&
              <View>
                <TeamMembersView teamMembers={dropDownData} />
              </View>}
            <CustomDropdown
              title={`${t('task_priority')} *`}
              data={siteDetails?.prioritiesList || []}
              placeholder={`${t('choose_priority')}`}
              onSelect={(item) => setpriority(item)}
              selected={priority?.value}
            />
            {errors?.priority && (
              <Text style={styles.errorText}>{errors?.priority}</Text>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: hp(0) }}>
              <View style={{ width: wp(44) }}>
                <Text style={styles.label}>{`${t('due_date')}*`}</Text>
                <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                  <Text numberOfLines={1} style={[styles.dateText, {
                    fontSize: wp(lang == 'ta' && !dueDate ? 2.5 : 3.5)
                  }]}>
                    {dueDate ? dayjs(dueDate).format("DD/MM/YYYY") : t('select_date')}
                  </Text>
                </Pressable>
                {errors.dueDate && <Text style={[styles.errorText, {
                  marginTop: wp(2)
                }]}>{errors.dueDate}</Text>}
              </View>
              <View style={{ width: wp(44) }}>
                <Text style={styles.label}>{`${t('due_time')} *`}</Text>
                <Pressable onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
                  <Text style={[styles.dateText, {
                  }]}>
                    {dueTime ? dayjs(dueTime).format("hh:mm A") : "Select Time"}
                  </Text>
                </Pressable>
                {errors.dueTime && <Text style={[styles.errorText, {
                  marginTop: wp(4)
                }]}>{errors.dueTime}</Text>}
              </View>
            </View>
            <CustomSingleDatePickerModal
              title={t('select_date')}
              disablePastDates={true}
              visible={showDatePicker}
              initialDate={dueDate}
              onClose={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                // Alert.alert('',JSON.stringify(date))
                setDueDate(date);
                setShowDatePicker(false);
              }}
            />
            {showTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={(_, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setDueTime(selectedTime);
                }}
              />
            )}
            <TouchableOpacity disabled={loading} style={styles.submitButton} onPress={handleSubmit}>
              {loading ?
                <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{`${t('create_task')}`}</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
        <AttachmentModal
          visible={mediaModal}
          onClose={() => setmediaModal(false)}
          hideMic={true}
          onCamera={() => pickMedia("camera")}
          onFile={() => pickMedia("gallery")}
        />
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
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  inputContainer: { marginBottom: hp(2), position: "relative" },
  input: { borderWidth: 1, borderColor: COLORS.gray, borderRadius: wp(1), padding: wp(3), fontSize: wp(3.5), fontFamily: "Poppins_400Regular", color: COLORS.black, }, inputIcon: { position: "absolute", right: wp(3), top: hp(1.5) }, audioPreview: {
    flexDirection: "row", marginTop: hp(1),
    justifyContent: "space-around", borderWidth: wp(0.4), paddingHorizontal: wp(1), maxWidth: wp(48), alignItems: "center", borderRadius: wp(24), borderColor: COLORS?.primary
  }, errorText: {
    color: "red", fontSize: wp(3), marginTop: hp(-0.8),
    fontFamily: 'Poppins_400Regular', fontWeight: "600", marginHorizontal: wp(2)
  }, recordingOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center",
    alignItems: "center",
  }, recordingPopup: {
    backgroundColor: "#fff", borderRadius: wp(3),
    alignItems: "center", width: wp(80), height: wp(80), borderRadius: wp(40), alignItems: "center", justifyContent: "center", borderWidth: wp(1), borderColor: COLORS?.primary
  }, recordingText: {
    fontSize: wp(3.5), marginBottom: hp(1), fontFamily: "Poppins_400Regular",
  }, recordingTime: {
    fontSize: wp(5), marginBottom: hp(2), fontFamily: "Poppins_400Regular",
  }, stopButton: { backgroundColor: COLORS.primary, paddingHorizontal: wp(6), paddingVertical: hp(1), borderRadius: wp(2), }, stopButtonText: { color: "#fff", fontSize: wp(4.5), fontFamily: "Poppins_400Regular", },
  label: { fontSize: wp(4), fontFamily: "Poppins_400Regular", marginBottom: hp(0.5) },
  radioContainer: { flexDirection: "row", marginBottom: hp(2) },
  radioButton: { flexDirection: "row", alignItems: "center", marginRight: wp(4) },
  radioCircle: {
    width: wp(4), height: wp(4), borderRadius: wp(2), borderWidth: 1, borderColor: COLORS.gray, marginRight: wp(1.5),
  },
  radioLabel: { fontSize: wp(3.8), fontFamily: "Poppins_400Regular", lineHeight: hp(4) },
  dateButton: { borderWidth: 1, borderRadius: wp(1), padding: wp(3), },
  micIconContainer: {
    position: "absolute", right: wp(3), top: hp(5.2), margin: wp(1),
    zIndex: 10,
  }, dateText: { fontSize: wp(3.5), fontFamily: "Poppins_400Regular", color: COLORS.black }, submitButton: {
    backgroundColor: COLORS.primary, padding: wp(3),
    borderRadius: wp(2), marginVertical: hp(2), alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: wp(4.5), fontFamily: "Poppins_600SemiBold", lineHeight: hp(4) },
});