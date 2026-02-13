import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Dimensions, Image, Modal, Pressable, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import ImageViewerModal from "./ImageViewver";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TaskDetailModal = ({ visible, task, onClose, getStatusColor }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [showModal, setShowModal] = useState(visible);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [barLayout, setBarLayout] = useState({ x: 0, width: 0 });

  const openImageViewer = (uri) => {
    setViewerUri(uri);
    setViewerVisible(true);
  };

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  // Reset audio state when modal closes
  useEffect(() => {
    if (!showModal) {
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      if (videoRef.current) videoRef.current.stopAsync?.();
    }
  }, [showModal]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      if (status.positionMillis >= status.durationMillis) {
        await videoRef.current.setPositionAsync(0);
        setPosition(0);
      }
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleForward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    const newPos = Math.min(status.positionMillis + 5000, status.durationMillis);
    await videoRef.current.setPositionAsync(newPos);
    setPosition(newPos);
  };

  const handleBackward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    const newPos = Math.max(status.positionMillis - 5000, 0);
    await videoRef.current.setPositionAsync(newPos);
    setPosition(newPos);
  };

  const handleEdit = () => {
    onClose();
    navigation?.navigate("UpdateTask", task);
  };

  const parseHTML = (htmlString) => {
    if (!htmlString) return null;
    const paragraphs = htmlString?.split(/<\/?p>/).filter(Boolean);
    return paragraphs?.map((text, idx) => (
      <Text key={idx} style={styles.modalDescriptionText}>
        {text.replace(/<br\s*\/?>/gi, "\n")}
      </Text>
    ));
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const downloadAudio = async (audioUrl, fileName = 'audio.mp3') => {
    try {
      setIsDownloading(true);
      let directoryUri = await AsyncStorage.getItem('DOWNLOADS_URI');

      if (!directoryUri) {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          // alert('Permission denied');
          showToast('Permission denied', 'error')
          setIsDownloading(false);
          return;
        }
        directoryUri = permission.directoryUri;
        await AsyncStorage.setItem('DOWNLOADS_URI', directoryUri);
      }
      const tempFileUri = FileSystem.cacheDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(audioUrl, tempFileUri);
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'audio/mpeg'
      );
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        fileUri,
        await FileSystem.readAsStringAsync(downloadRes.uri, { encoding: FileSystem.EncodingType.Base64 }),
        { encoding: FileSystem.EncodingType.Base64 }
      );
      showToast(`Audio saved as ${fileName}`, 'success');
    } catch (err) {
      console.error('❌ Audio Download Error:', err);
      alert('❌ Failed to download audio. Make sure you are on Android.');
    } finally {
      setIsDownloading(false);
    }
  };
  if (!task || !showModal) return null;
  // ========================
  // Seek handler
  // ========================
  const handleSeek = async (event) => {
    if (!videoRef.current || duration === 0 || !barLayout.width) return;
    const { pageX } = event.nativeEvent;

    const relativeX = pageX - barLayout.x;
    const seekRatio = Math.max(0, Math.min(relativeX / barLayout.width, 1));
    const seekPosition = seekRatio * duration;

    await videoRef.current.setPositionAsync(seekPosition);
    setPosition(seekPosition);
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Modal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlay}
          onPress={() => {
            if (!isDownloading) {
              onClose();
            }
          }}
        />
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
          <Pressable style={styles.closeButton}
            onPress={() => {
              if (!isDownloading) {
                onClose();
              }
            }}
          >
            <Icon name="close" size={wp(8)} color="#fff" />
          </Pressable>
          <Text style={styles.modalTitle}>{task?.title}</Text>

          {task?.description && (
            <View style={styles.descriptionContainer}>
              <ScrollView
                style={styles.descriptionScroll}
                contentContainerStyle={{ paddingVertical: hp(1) }}
                showsVerticalScrollIndicator={true}
              >
                {parseHTML(task.description)}
              </ScrollView>
            </View>
          )}

          

          <View style={styles.statusEditRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
              <Icon name="info" size={wp(5)} color="#fff" style={{ marginRight: wp(1) }} />
              <Text style={styles.statusText}>{task.status}</Text>
            </View>
            {
              task?.allowEdit &&
              (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Icon name="edit" size={wp(5)} color={COLORS?.white} />
                  <Text style={styles.editText}>{t("edit")}</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Images */}
          {task?.image?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
              {task.image.map((img, index) => (
                <Pressable key={index} onPress={() => openImageViewer(img)} style={{ marginRight: wp(3) }}>
                  <Image
                    resizeMode="contain"
                    source={img ? { uri: img } : require("../../assets/amigowayslogo.jpg")}
                    style={{
                      width: wp(20),
                      height: wp(20),
                      borderWidth: wp(0.3),
                      borderRadius: wp(2),
                      borderColor: COLORS?.primary,
                    }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Dates */}
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <View style={styles.dateRow}>
                <Icon name="calendar-today" size={wp(4)} color={COLORS?.primary} style={{ marginRight: wp(1) }} />
                <Text style={styles.label}>{t("assigned_date")}</Text>
              </View>
              <Text style={styles.dateText}>{task.assigned_date}</Text>
            </View>
            <View style={styles.dateItem}>
              <View style={styles.dateRow}>
                <Icon name="event" size={wp(4)} color={COLORS?.primary} style={{ marginRight: wp(1) }} />
                <Text style={styles.label}>{t("due_date")}</Text>
              </View>
              <Text style={styles.dateText}>{task.due_date}</Text>
            </View>
          </View>

          {/* Audio Player */}
          {task?.audio && (
            <View style={styles.audioContainer}>
              <Video
                ref={videoRef}
                source={{ uri: task.audio }}
                useNativeControls={false}
                resizeMode="contain"
                shouldPlay={isPlaying}
                onPlaybackStatusUpdate={(status) => {
                  if (!status.isLoaded) return;
                  setPosition(status.positionMillis);
                  setDuration(status.durationMillis || 0);
                  if (status.didJustFinish) {
                    setIsPlaying(false);
                    setPosition(0);
                  }
                }}
                style={{ width: 0, height: 0 }}
              />

              {/* Audio Title + Download */}
              <View style={styles.audioTitleRow}>
                <Text style={styles.audioName}>
                  <Icon name="audiotrack" size={wp(4)} color={COLORS.primary} />{" "}
                  {task?.audio_name || "Audio File"}
                </Text>
                <TouchableOpacity
                  disabled={isDownloading}
                  onPress={() => downloadAudio(task.audio, task.audio_name || 'audio.mp3')}
                  style={{
                    width: wp(10),
                    height: wp(10),
                    borderRadius: wp(5),
                    backgroundColor: COLORS.primary + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    right: wp(2),
                    top: hp(0)
                  }}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Icon name="download" size={wp(6)} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Controls */}
              <View style={styles.audioControls}>
                <TouchableOpacity onPress={handleBackward} style={styles.controlButton}>
                  <Icon name="replay-5" size={wp(7)} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePlayPause} style={[styles.controlButton, styles.playButton]}>
                  <Icon name={isPlaying ? "pause" : "play-arrow"} size={wp(9)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForward} style={styles.controlButton}>
                  <Icon name="forward-5" size={wp(7)} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {/* Progress */}
              <Pressable
                ref={progressBarRef}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  setBarLayout({ x, width });
                }}
                onPress={handleSeek}
                style={styles.progressBarBackground}
              >
                <View style={[styles.progressBarFill, { flex: progress }]} />
                <View style={[styles.progressBarRemaining, { flex: 1 - progress }]} />
              </Pressable>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
      <ImageViewerModal
        visible={viewerVisible}
        uri={viewerUri}
        onClose={() => setViewerVisible(false)}
      />
    </Modal>
  );
};

export default TaskDetailModal;

// ============================
// Styles (unchanged)
// ============================
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.85, backgroundColor: "#fff",
    borderTopLeftRadius: wp(8), borderTopRightRadius: wp(8),
    padding: wp(5), paddingTop: hp(6), paddingVertical: hp(6), shadowColor: "#000",
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 15,
  }, closeButton: {
    position: "absolute", top: -wp(5), right: wp(5), width: wp(11),
    height: wp(11), borderRadius: wp(5.5), backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center", zIndex: 10, borderWidth: wp(0.8), borderColor: "#FFF"
  }, modalTitle: { fontSize: wp(5), fontFamily: "Poppins_700Bold", color: "#222", marginBottom: hp(1.5), textTransform: "capitalize" },
  descriptionContainer: { marginBottom: hp(2), maxHeight: SCREEN_HEIGHT * 0.25, borderRadius: wp(3), backgroundColor: "#f5f5f5", padding: wp(3) }, descriptionScroll: { paddingRight: wp(2) },
  modalDescriptionText: { fontSize: wp(4), fontFamily: "Poppins_400Regular", color: "#444", lineHeight: hp(3), marginBottom: hp(1) }, statusEditRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: hp(2) },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(4), paddingVertical: hp(0.7), borderRadius: wp(3) },
  statusText: { color: "#fff", fontSize: wp(4), fontFamily: "Poppins_500Medium" },
  editButton: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingHorizontal: wp(4), paddingVertical: hp(0.8), borderRadius: wp(3) },
  editText: { color: "#fff", fontSize: wp(4), fontFamily: "Poppins_500Medium", marginLeft: wp(1) },
  datesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: hp(2) },
  dateItem: { flex: 1 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: wp(3.2), fontFamily: "Poppins_400Regular", color: COLORS?.primary },
  dateText: { fontSize: wp(3.8), fontFamily: "Poppins_500Medium", marginTop: hp(0.3), color: "#333" },
  audioContainer: { marginTop: hp(2), alignItems: "center", padding: wp(4), borderRadius: wp(5), backgroundColor: "#eef6ff", justifyContent: "center", width: "100%" },
  audioName: { fontSize: wp(4), fontFamily: "Poppins_500Medium", marginBottom: hp(1), flexDirection: "row" },
  audioTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2), width: "100%", padding: wp(2) },
  audioControls: { flexDirection: "row", alignItems: "center", marginBottom: hp(1) },
  controlButton: { width: wp(14), height: wp(14), borderRadius: wp(7), backgroundColor: "#d6e4ff", justifyContent: "center", alignItems: "center", marginHorizontal: wp(2) },
  playButton: { backgroundColor: COLORS.primary },
  progressBarBackground: { flexDirection: "row", width: wp(80), height: hp(1.8), borderRadius: hp(0.8), backgroundColor: "#ccc", overflow: "hidden", marginBottom: hp(0.5), marginVertical: hp(3) },
  progressBarFill: { backgroundColor: COLORS.primary },
  progressBarRemaining: { backgroundColor: "#ddd" },
  timeRow: { flexDirection: "row", justifyContent: "space-between", width: wp(80) },
  timeText: { fontSize: wp(3), color: "#333", fontFamily: "Poppins_400Regular" },
});