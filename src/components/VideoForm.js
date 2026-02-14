import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const VideoFormSection = ({
  t, video, videos,
  setvideo,
  setVideos,
  setmediaTypes,
  setfileModal,
  handleDeleteVideo, // function to delete video via API
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoType, setSelectedVideoType] = useState(null);

  const openDeleteModal = (type) => {
    setSelectedVideoType(type);
    setModalVisible(true);
  };
  const confirmDelete = () => {
    if (selectedVideoType) {
      handleDeleteVideo(selectedVideoType); // call API
      // if (selectedVideoType === "existing") setvideo([]);
      // if (selectedVideoType === "new") setVideos([]);
    }
    setModalVisible(false);
  };
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{t("video")}</Text>
      <View style={styles.videoRow}>
        {/* <Text>{JSON.stringify(video)}</Text> */}
        {/* Existing Video from API */}
        {video && video.length > 0 && (
          <View style={styles.existingVideoContainer}>
            <Video
              source={{ uri: video[0].uri }}
              style={styles.existingVideo}
              resizeMode="cover"
              useNativeControls
              usePoster={true}
              isLooping
            />
            <Pressable
              onPress={() => openDeleteModal("existing")}
              style={styles.deleteButton}
            >
              <Icon name="trash" type="feather" size={wp(5)} color="#ff0000" />
            </Pressable>
          </View>
        )}
        {/* Newly Selected Video */}
        {videos.length > 0 && (
          <View style={styles.newVideoContainer}>
            <Video
              source={{ uri: videos[0].uri }}
              style={styles.newVideo}
              resizeMode="cover"
              usePoster
            />
            <TouchableOpacity
              onPress={() => openDeleteModal("new")}
              style={styles.deleteButtonNew}
            >
              <Ionicons name="trash" size={wp(6)} color="#ff0000" />
            </TouchableOpacity>
          </View>
        )}

        {/* Add Video Button */}
        {(video == null || video.length === 0) && videos.length === 0 && (
          <TouchableOpacity
            onPress={() => {
              setmediaTypes("video");
              setfileModal(true);
            }}
            style={styles.addVideoButton}
          >
            <Ionicons name="videocam" size={wp(9)} color={COLORS.primary} />
            <Text style={styles.addVideoText}>{t("add_video")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="info" type="feather" size={wp(15)} color="#ff0000" style={{ marginBottom: wp(4) }} />
            <Text style={styles.modalTitle}>{t("delete_video")}</Text>
            <Text style={styles.modalMessage}>{t("confirm_delete_video")}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmText}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  fieldContainer: {
    marginVertical: hp(1),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1),
    color: "#333",
  },
  videoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  existingVideoContainer: {
    width: "100%",
    height: wp(35),
    position: "relative",
    marginBottom: wp(2),
    borderWidth: wp(0.4),
    borderColor: COLORS.gray,
    borderRadius: wp(2),
  },
  existingVideo: {
    width: "95%",
    height: "90%",
    borderRadius: wp(2),
    alignSelf: "center",
    marginTop: hp(1),
  },
  newVideoContainer: {
    position: "relative",
    width: wp(26),
    height: hp(14),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  newVideo: {
    width: "100%",
    height: "100%",
    borderRadius: wp(2),
  },
  deleteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 4,
    zIndex: 10,
  },
  deleteButtonNew: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#ddd",
    borderRadius: wp(5),
    padding: wp(1.5),
  },
  addVideoButton: {
    width: "100%",
    height: hp(14),
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp(2),
    marginRight: wp(2),
    marginBottom: hp(1),
    borderStyle: "dashed",
    borderWidth: wp(0.3),
    borderColor: "#ccc",
  },
  addVideoText: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: wp(3.5),
  },
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
    alignItems: "center", paddingVertical: hp(4),
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
    backgroundColor: COLORS.primary
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

export default VideoFormSection;
