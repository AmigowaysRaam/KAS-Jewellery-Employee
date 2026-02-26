import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated, Easing, FlatList,
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from "react-native";
import { Video as VideoCompress } from "react-native-compressor";
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
import DescriptionFormSection from "./DescriptionFormSection";
import ImagesFormSection from "./ImagesFormSection";
import ImageViewerModal from "./ImageViewver";
import CustomSingleDatePickerModal from "./SingleDateSelect";
import SpeechToTextModal from "./SpeechToTextMOdal";
import TaskPriority from "./TaskPriority";
import VideoFormSection from "./VideoForm";

export default function UpdateTask({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { id } = route?.params;
  const [currentLanguage, setcurrentLanguage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [dueTime, setDueTime] = useState(null); // dayjs object for time



  const saveAudioToDownloads = async (audioUri, fileName = 'audio.mp3') => {
    try {
      setIsDownloading(true);
      // Step 1: Ensure local file
      let localUri = audioUri;
      if (audioUri.startsWith('http')) {
        const downloadPath = FileSystem.cacheDirectory + fileName;
        const download = await FileSystem.downloadAsync(audioUri, downloadPath);
        localUri = download.uri;
      }
      // Step 2: Get Downloads folder URI
      let directoryUri = await AsyncStorage.getItem('DOWNLOADS_URI');
      if (!directoryUri) {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          alert("Permission denied");
          return;
        }
        directoryUri = permission.directoryUri;
        await AsyncStorage.setItem('DOWNLOADS_URI', directoryUri);
      }
      // Step 3: Create SAF file
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'audio/mpeg',
        { replace: true }
      );

      // Step 4: Read local file as Base64
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 5: Write to SAF file
      await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      showToast(`Audio saved as ${fileName}`, "success");
    } catch (err) {
      console.error("❌ Save Local Audio Error:", err);
      alert("❌ Failed to save audio. Only works on Android.");
    } finally {
      setIsDownloading(false);
    }
  };

  const [dueDate, setDueDate] = useState(null); // dayjs object
  const [dueDateText, setDueDateText] = useState(""); // "DD/MM/YYYY HH:mm"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const today = dayjs();
  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false); // hide picker
    if (!selectedTime) return; // user canceled

    const parsedTime = dayjs(selectedTime); // selected time
    const referenceDate = dueDate ? dayjs(dueDate) : dayjs(); // reference date
    // Merge selected time into the reference date
    const combinedDateTime = referenceDate
      .hour(parsedTime.hour())
      .minute(parsedTime.minute())
      .second(0)
      .millisecond(0);

    const now = dayjs();

    // Prevent selecting past datetime
    if (combinedDateTime.isBefore(now)) {
      // Set inline error instead of toast
      setErrors(prev => ({
        ...prev,
        dueTime: t("cannot_select_past_time")
      }));
      setDueTime(null); // optional: clear previous invalid time
      return;
    }

    // Valid time: clear error and save
    setErrors(prev => ({ ...prev, dueTime: undefined }));
    setDueTime(parsedTime); // store time separately if needed
    setDueDate(combinedDateTime); // save combined datetime
  };
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

  const [mediaTypes, setmediaTypes] = useState('video');
  const [video, setvideo] = useState(null);

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
    setLoading(true);
    // Alert.alert("jk");
    try {
      const response = await fetchData("app-employee-remove-task-media", "POST", {
        id,
        user_id: profileDetails?.id,
        "delete_audio": "1",
      });
      if (response) {
        showToast(response?.message, "success");
        setDescAudio(null);
        setIsPlaying(false);
        setLoading(false);
      }
    }
    catch (err) {
      console.log(err);
      setLoading(false);
      showToast(t("failed_to_delete_video"), "error");
    }
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
  const [dateLoader, setdateLoader] = useState(false);
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

  const loadTicket = async () => {
    setLoading(true);
    try {
      const lang = await getStoredLanguage();
      const response = await fetchData("app-employee-task-detail", "POST", {
        id,
        lang,
        user_id: profileDetails?.id,
      });

      const ticket = response?.data?.ticket_detail;
      setTicketDetails(ticket);

      // DUE DATE/TIME
      const initialDueDate = ticket?.due_date
        ? dayjs(ticket.due_date, "DD-MM-YYYY hh:mm A")
        : null;
      setDueDate(initialDueDate);
      setDueDateText(initialDueDate ? initialDueDate.format("DD/MM/YYYY") : "");
      setDueTime(initialDueDate ? initialDueDate : null);

      // EXTENDED DATE/TIME (use ticket, not ticketDetails)
      if (ticket?.extend_date && ticket?.extend_time) {
        const parsedDate = dayjs(ticket.extend_date, "DD-MM-YYYY hh:mm A");
        const parsedTime = dayjs(ticket.extend_time, "hh:mm A");
        setExtendedDueDate(parsedDate);
        setExtendedDueTime(parsedTime);
        setExtendedDueDateText(parsedDate.format("DD/MM/YYYY hh:mm A"));
      }

      // DESCRIPTION
      const plainText = ticket?.description?.replace(/<[^>]+>/g, "") || "";
      setDescription(plainText);

      // STATUS & PRIORITY
      setSelectedStatus(ticket?.statusv);
      setSelectedPriority(ticket?.priorityv);

      // AUDIO
      if (ticket?.audio) {
        setDescAudio({
          uri: ticket.audio,
          source: "API",
          name: ticket?.audio_name || "description_audio.mp3",
        });
      }

      // VIDEO
      if (ticket?.video) {
        setvideo([
          {
            uri: ticket.video,
            source: "API",
            fileName: ticket.video_name || ticket.video.split("/").pop(),
            mimeType: "video/mp4",
          },
        ]);
      }
      // IMAGES
      const formattedImages = ticket?.image.map((img) => ({
        id: img.id,
        uri: img.image,
        source: "API",
      }));
      setImages(formattedImages);

    } catch (err) {
      console.log(err);
      showToast(t("failed_to_load_task_details"), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const deleteImage = async (selectedItem) => {
    if (!selectedItem) return;
    const { id, source, index } = selectedItem;
    setLoading(true);
    // If image is local (not from API), just remove from state
    if (source !== "API") {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setLoading(false);
      return;
    }
    try {
      const response = await fetchData("app-employee-remove-task-media", "POST", {
        id, // image id from API
        user_id: profileDetails?.id,
        delete_image: "1",
        image_id: id,
      });
      // Alert.alert("Delete Response", JSON.stringify(response));
      if (response?.success) {
        // Remove from state
        setImages((prev) => prev.filter((img) => img.id !== id));
        showToast(t("image_deleted_success"), "success");
        loadTicket(); // Refresh ticket data from server
      } else {
        showToast(t("failed_to_delete_image"), "error");
      }
    } catch (err) {
      console.log(err);
      showToast(t("failed_to_delete_image"), "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    // if (!ticketDetails?.title?.trim()) errors.title = t("title_Required");
    if (!description.trim()) {
      errors.description = t("desc_Required")
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus();
      }
      if (flatListRef.current) {
        // Assuming the description input is at index N (e.g., index 2)
        const indexOfDescription = 2; // change this according to your list
        flatListRef.current.scrollToIndex({
          index: indexOfDescription,
          viewPosition: 0.1, // 0.5 means middle of the view
          animated: true,
        });
      }
    };
    if (!selectedStatus) errors.status = t("pls_selct_status");
    if (!selectedPriority) errors.priority = t("pls_selct_priotty");
    setErrors(errors);
    setNewErrors(errors)

    return Object.keys(errors).length === 0;
  };

  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const compressVideoFast = async (videoUri) => {
    try {
      setIsCompressing(true);
      setCompressionProgress(0);
      const compressedVideoUri = await VideoCompress.compress(
        videoUri,
        {
          compressionMethod: "manual", // manual allows setting quality
          bitrate: Number.MAX_SAFE_INTEGER,          // very low bitrate for small file
          maxSize: 480,                // max resolution 360p for fast upload
        },
        (progress) => {
          setCompressionProgress(progress); // progress 0 -> 1
        }
      );
      console.log("✅ Compressed video URI:", compressedVideoUri);
      return compressedVideoUri;
    } catch (error) {
      console.log("❌ Compression error:", error);
      return videoUri; // fallback to original if compression fails
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };
  const handleUpdateTask = async () => {
    if (!validate()) {
      showToast(t("failed_to_update_task"), "error");
      return;
    }

    setLoading(true);
    showToast(t("uploading_please_wait"), "info");

    // Combine due date/time
    const dueDateObj = dueDate ? dayjs(dueDate) : null;
    const dueTimeObj = dueTime ? dayjs(dueTime, "HH:mm") : dayjs("00:00", "HH:mm");
    const combinedDueDateTime = dueDateObj
      ? dueDateObj.hour(dueTimeObj.hour()).minute(dueTimeObj.minute()).second(0)
      : null;

    // Combine extended/assign date/time
    const extendedDateObj = extendedDueDate ? dayjs(extendedDueDate) : null;
    const extendedTimeObj = extendedDueTime ? dayjs(extendedDueTime, "HH:mm") : dayjs("00:00", "HH:mm");
    const combinedExtendedDateTime = extendedDateObj
      ? extendedDateObj.hour(extendedTimeObj.hour()).minute(extendedTimeObj.minute()).second(0)
      : null;

    try {
      const formData = new FormData();
      formData.append("id", ticketDetails?.id || "");
      formData.append("description", description || "");
      formData.append("status", selectedStatus || "");
      formData.append("priority", selectedPriority || "");
      formData.append("user_id", profileDetails?.id || "");

      // Append extended/assign date & time
      if (combinedExtendedDateTime) {
        formData.append("extend_date", combinedExtendedDateTime.format("YYYY-MM-DD"));
        formData.append("extend_time", combinedExtendedDateTime.format("HH:mm"));
      } else {
        formData.append("extend_date", "");
        formData.append("extend_time", "");
      }

      // Append original due date & time
      if (combinedDueDateTime) {
        formData.append("due_date", combinedDueDateTime.format("YYYY-MM-DD"));
        formData.append("due_time", combinedDueDateTime.format("HH:mm"));
      } else {
        formData.append("due_date", "");
        formData.append("due_time", "");
      }

      // Append images (same as before)
      if (Array.isArray(images)) {
        images
          .filter((img) => img?.source !== "API")
          .forEach((img, index) => {
            if (!img?.uri) return;
            const uriParts = img.uri.split(".");
            const fileType = uriParts[uriParts.length - 1];
            formData.append("image[]", {
              uri: Platform.OS === "android" ? img.uri : img.uri.replace("file://", ""),
              name: `photo_${index}.${fileType}`,
              type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
            });
          });
      }
      if (Array.isArray(video) && video.length > 0 && video[0]?.source !== "API") {
        const videoFile = video[0];
        if (videoFile?.uri) {
          // Compress video before upload with progress
          const compressedVideoUri = await compressVideoFast(videoFile.uri);

          formData.append("video", {
            uri: Platform.OS === "android" ? compressedVideoUri : compressedVideoUri.replace("file://", ""),
            name: videoFile.fileName || "updatetask_video.mp4",
            type: videoFile.mimeType || "video/mp4",
          });
        }
      }

      // Append audio (same as before)
      if (descAudio?.uri && !descAudio.uri.startsWith("http")) {
        formData.append("audio", {
          uri: Platform.OS === "android" ? descAudio.uri : descAudio.uri.replace("file://", ""),
          type: "audio/mpeg",
          name: `${descAudio?.name || "audio"}.mp3`,
        });
      }

      // -------------------------
      // Send request
      // -------------------------
      const response = await fetch(`${BASE_URL}app-employee-update-task`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const result = await response.json();

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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];

      if (file.type?.includes("video")) {
        setVideos([{ ...file, source: "Camera" }]);
      } else {
        setImages((prev) => [...prev, { ...file, source: "Camera" }]);
      }
    }
  };

  // Pick from gallery
  const pickFile = async () => {
    console.log('Picker initiated');  // Debugging: Log to confirm the function is called
    setModalVisible(false);
    setfileModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.photo, ImagePicker.MediaType.video],  // Updated for deprecated warning
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
    });

    console.log('ImagePicker result:', result);  // Log the result object to see the full structure

    if (!result.canceled && result.assets?.length > 0) {
      result.assets.forEach((file) => {
        console.log('Picked file:', file);  // Log each file for debugging

        if (file.type?.includes('video')) {
          setVideos([{ ...file, source: 'Gallery' }]);
        } else {
          setImages((prev) => [...prev, { ...file, source: 'Gallery' }]);
        }
      });
    }
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
  const pickMedia = async (source) => {
    setfileModal(false);
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
  const [isDownloading, setIsDownloading] = useState(false);
  const listData = ["title", "status", "priority", "due_date", ...(ticketDetails?.canExtend ? ["extended_date_time"] : []),
    "description", "images", "video", "button"];
  const handleRemoveVideo = async () => {
    setLoading(true);
    // Alert.alert("jk");
    try {
      const response = await fetchData("app-employee-remove-task-media", "POST", {
        id,
        user_id: profileDetails?.id,
        "delete_video": "1",
      });
      // Alert.alert("Success", JSON.stringify(response));
      if (response) {
        setVideos([]); // Clear video from UI
        setvideo(null);
        setLoading(false);
      }
    }
    catch (err) {
      console.log(err);
      setLoading(false);
      showToast(t("failed_to_delete_video"), "error");
    }
  }
  const fetchDropDownData = async (pId) => {

    if (!profileDetails?.id) return;
    setdateLoader(true)
    try {
      const lang = await getStoredLanguage();
      setcurrentLanguage(lang)
      const response = await fetchData(
        "app-employee-team-members",
        "POST",
        {
          user_id: profileDetails.id,
          lang: lang ?? "en",
          priority: pId || null,
          task_id: id
        }
      );
      if (response?.data) {
        setDueDate(response.data?.max_date ? dayjs(response.data.max_date).toDate() : null)
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      // setloading(false);
      setdateLoader(false)
    }
  };
  const [extendedDueDate, setExtendedDueDate] = useState(null);
  const [extendedDueDateText, setExtendedDueDateText] = useState("");
  const [extendedDueTime, setExtendedDueTime] = useState(null);
  const [showExtendedDatePicker, setShowExtendedDatePicker] = useState(false);
  const [showExtendedTimePicker, setShowExtendedTimePicker] = useState(false);
  const [extendedDateLoader, setExtendedDateLoader] = useState(false);
  const [extendedTimeError, setExtendedTimeError] = useState(null);

  const onChangeExtendedTime = (event, selectedTime) => {
    if (event.type === "set") {
      const parsedTime = dayjs(selectedTime);

      // Combine with extended date if available, otherwise today
      const referenceDate = extendedDueDate ? dayjs(extendedDueDate) : dayjs();
      const combinedSelected = referenceDate
        .hour(parsedTime.hour())
        .minute(parsedTime.minute())
        .second(0);

      // Compare with current time
      if (combinedSelected.isBefore(dayjs())) {
        setExtendedTimeError(t("cannot_select_past_time"));
        setExtendedDueTime(null); // optional: reset invalid selection
      } else {
        setExtendedDueTime(combinedSelected);
        setExtendedTimeError(null);
      }
    }

    setShowExtendedTimePicker(false);
  };
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
      case "extended_date_time":
        return (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {/* Extended Date */}
            <View style={{ marginBottom: hp(2) }}>
              <Text style={styles.label}>{`${t("extended_date")} *`}</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ccc",
                  width: wp(44),
                  padding: wp(3),
                  borderRadius: wp(1),
                  height: wp(12),
                }}
                onPress={() => setShowExtendedDatePicker(true)}
              >
                {extendedDateLoader ? (
                  <ActivityIndicator color={COLORS?.primary} />
                ) : (
                  <Text
                    style={{
                      color: extendedDueDate ? "#000" : "#111",
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    {extendedDueDate
                      ? dayjs(extendedDueDate).format("DD/MM/YYYY")
                      : t("select_date")}
                  </Text>
                )}
              </TouchableOpacity>

              {showExtendedDatePicker && (
                <CustomSingleDatePickerModal
                  disablePastDates={true}
                  restrictFeatureDate={false}
                  maxExtendDate={ticketDetails?.maxExtendDate}
                  visible={showExtendedDatePicker}
                  initialDate={extendedDueDate ? dayjs(extendedDueDate) : new Date()}
                  onClose={() => setShowExtendedDatePicker(false)}
                  onConfirm={(selectedDate) => {
                    const parsed = dayjs(selectedDate);
                    setExtendedDueDate(selectedDate);
                    setExtendedDueDateText(parsed.format("DD/MM/YYYY HH:mm"));
                    setShowExtendedDatePicker(false);
                  }}
                />
              )}
            </View>

            {/* Extended Time */}
            <View>
              <Text style={styles.label}>{`${t("extended_time")} *`}</Text>
              <Pressable
                onPress={() => setShowExtendedTimePicker(true)}
                style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ccc",
                  width: wp(44),
                  padding: wp(3),
                  borderRadius: wp(1),
                  height: wp(12),
                  fontFamily: "Poppins_400Regular",
                }}
              >
                <Text style={[styles.dateText, { fontFamily: "Poppins_400Regular" }]}>
                  {extendedDueTime
                    ? dayjs(extendedDueTime).format("hh:mm A")
                    : t("select_time")}
                </Text>
              </Pressable>
              {extendedTimeError && (
                <Text style={[styles.errorText, { marginTop: wp(4) }]}>
                  {extendedTimeError}
                </Text>
              )}
              {showExtendedTimePicker && (
                <DateTimePicker
                  value={extendedDueTime ? extendedDueTime.toDate() : new Date()}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={onChangeExtendedTime} // handle separately
                />
              )}
            </View>
          </View>
        );
      case "video":
        return (
          <VideoFormSection
            handleDeleteVideo={handleRemoveVideo}
            taskDetails={ticketDetails}
            t={t}
            video={video}
            videos={videos}
            setvideo={setvideo}
            setVideos={setVideos}
            setmediaTypes={setmediaTypes}
            setfileModal={setfileModal}
            styles={styles}
          />
        )
      case "due_date":
        return (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ marginBottom: hp(2) }}>
              <Text style={styles.label}>{`${t("due_date")} *`}</Text>
              <TouchableOpacity
                style={[{
                  backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc",
                  width: wp(44), padding: wp(3), borderRadius: wp(1), height: wp(12)
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                {
                  dateLoader ?
                    <ActivityIndicator color={COLORS?.primary} />
                    :
                    <Text
                      style={{
                        color: dueDate ? "#000" : "#111",
                        fontFamily: "Poppins_400Regular"
                      }}
                    >
                      {dueDate ? dayjs(dueDate).format("DD/MM/YYYY") : t('select_date')}
                    </Text>
                }
              </TouchableOpacity>
              {showDatePicker && (
                <CustomSingleDatePickerModal
                  disablePastDates={true}
                  restrictFeatureDate={false}
                  visible={showDatePicker}
                  initialDate={dueDate ? dayjs(dueDate) : new Date()}
                  onClose={() => setShowDatePicker(false)}
                  onConfirm={(selectedDate) => {
                    const parsed = dayjs(selectedDate);
                    setDueDate(selectedDate);
                    setDueDateText(parsed.format("DD/MM/YYYY HH:mm"));
                    setShowDatePicker(false);
                  }}
                />
              )}
            </View>
            <View>
              <Text style={styles.label}>{`${t('due_time')} *`}</Text>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc",
                  width: wp(44), padding: wp(3), borderRadius: wp(1), height: wp(12),
                  fontFamily: "Poppins_400Regular"
                }}
              >
                <Text style={[styles.dateText, {
                  fontFamily: "Poppins_400Regular"
                }]}>
                  {dueTime ? dayjs(dueTime).format("hh:mm A") : t("select_time")}
                </Text>
              </Pressable>
              {errors.dueTime && (
                <Text style={[styles.errorText, { marginTop: wp(4) }]}>
                  {errors.dueTime}
                </Text>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={dueTime ? dueTime.toDate() : new Date()} // ✅ convert dayjs to Date
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={onChangeTime} // or inline handler
                />
              )}
            </View>
          </View>

        );
      case "status":
        return (
          <>
            <CustomDropdown
              title={t("task_status") + " *"}
              data={siteDetails?.ticketstatusnooverdueList || []}
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
            <TaskPriority
              title={t("task_priority") + " *"}
              data={siteDetails?.prioritiesList || []}
              placeholder={t("choose_priority")}
              selected={selectedPriority}
              onSelect={(item) => {
                setSelectedPriority(item?.value),
                  fetchDropDownData(item?.value)
              }}
            />
            {newErrors.priority && <Text style={styles.errorText}>{newErrors.priority}</Text>}
          </>
        );
      case "description":
        return (
          <DescriptionFormSection
            descriptionInputRef={descriptionInputRef}
            t={t}
            description={description}
            setDescription={setDescription}
            errors={errors}
            styles={styles}
            setspeechTextModal={setspeechTextModal}
            setSpeechFlag={setSpeechFlag}
            descAudio={descAudio}
            isPlaying={isPlaying}
            stopAudio={stopAudio}
            playAudio={playAudio}
            deleteAudio={deleteAudio}
            isDownloading={isDownloading}
            saveAudioToDownloads={saveAudioToDownloads}
            startRecording={startRecording}
            PlayingAnimation={PlayingAnimation}
          />
        );
      case "images":
        return (
          <ImagesFormSection
            t={t}
            images={images}
            openImageViewer={openImageViewer}
            deleteImage={deleteImage}
            setfileModal={setfileModal}
            setmediaTypes={setmediaTypes}
            styles={styles}
          />
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

  const shimmerAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop(); // cleanup
  }, []);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <CommonHeader title={t("update_task")} showBackButton onBackPress={() => navigation.goBack()} />
      {loading ? (
        <>
          <FlatList
            style={styles.container}
            data={[1, 2, 3, 4, 5, 6, 7]}
            renderItem={() => (
              <Animated.View
                style={[

                  styles.skeletonBox,
                  {
                    width: "100%",
                    height: hp(8),
                    marginBottom: hp(1.5),
                    opacity: shimmerAnim, // 👈 THIS is required
                  },
                ]}
              />
            )}

            keyExtractor={(item, index) => `skeleton-${index}`}
            ListFooterComponent={<ActivityIndicator size={wp(8)} color={COLORS?.primary} />}
            contentContainerStyle={{ padding: wp(5), flexGrow: 1 }}
          />
          {isCompressing && (
            <View style={{ marginVertical: 10 }}>
              <Text>Video Processing: {(compressionProgress * 100).toFixed(0)}%</Text>
              <View style={{ width: "100%", height: 10, backgroundColor: "#eee", borderRadius: 5, overflow: "hidden", marginTop: 5 }}>
                <View style={{ height: "100%", width: `${compressionProgress * 100}%`, backgroundColor: "#4caf50" }} />
              </View>
            </View>
          )}
        </>
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
        hideMic={true}
        onCamera={() => pickMedia("camera")}
        onFile={() => pickMedia("gallery")}
      />
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  skeletonBox: { backgroundColor: "#e0e0e0", borderRadius: wp(1), marginVertical: hp(0.5) },
  fieldContainer: {
    marginBottom: hp(2)
  },
  label: { fontSize: wp(4), fontFamily: "Poppins_400Regular", color: "#000", marginBottom: hp(0.5) },
  readOnlyText: { fontSize: wp(4), fontFamily: "Poppins_500Medium", color: "#333", backgroundColor: "#eee", padding: wp(3), borderRadius: wp(2) },
  textInput: {
    fontSize: wp(4), fontFamily: "Poppins_400Regular", color: "#111",
    backgroundColor: "#fff", borderWidth: 1,
    borderColor: "#ccc", borderRadius: wp(2), padding: wp(3), minHeight: hp(12),
    textAlignVertical: "top"
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
  mic: { position: "absolute", right: wp(1), top: hp(0.4), marginLeft: hp(1) },
  audioRow: { flexDirection: "row", gap: wp(4), marginTop: hp(1), paddingHorizontal: wp(2) }, btn: { backgroundColor: COLORS.primary, padding: wp(3), borderRadius: wp(2), alignItems: "center" }, btnText: { color: "#fff", fontSize: wp(4.5) }, error: { color: "red", marginTop: hp(0.5) }, recordingOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }, recordingBox: { width: wp(80), height: wp(80), borderRadius: wp(40), backgroundColor: "#fff", alignItems: "center", justifyContent: "center", }, recordingText: { fontSize: wp(4) }, recordingTime: { fontSize: wp(5), marginVertical: hp(2) }, stopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: wp(6), paddingVertical: hp(1), borderRadius: wp(2) },
  iconButton: {
    width: wp(16), height: wp(16),
    borderRadius: wp(8), alignItems: "center", justifyContent: "center",
    elevation: 5, // Android shadow    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  modalButtonText: { fontSize: wp(4.2), textAlign: "center", fontFamily: "Poppins_500Medium" },
});