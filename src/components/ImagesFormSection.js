import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image, Modal, Pressable, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const ImagesFormSection = ({
  t,
  images,
  openImageViewer,
  deleteImage, // function to delete image from state/API
  setfileModal,
  setmediaTypes,
  styles: parentStyles,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const openDeleteModal = (item, index) => {
    setSelectedIndex({ ...item, index }); // store entire object + index
    setModalVisible(true);
  };
  const confirmDelete = () => {
    if (selectedIndex !== null) {
      deleteImage(selectedIndex);
    }
    setModalVisible(false);
    setSelectedIndex(null);
  };
  return (
    <View style={[parentStyles.fieldContainer, styles.container]}>
      <Text style={[parentStyles.label, styles.label]}>{t("images")}</Text>

      <View style={styles.imageRow}>
        {images?.map((img, idx) => (
          <Pressable
            onPress={() => openImageViewer(img?.uri)}
            key={idx}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: img?.uri }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Delete Button */}
            <Pressable
              onPress={() => openDeleteModal(img,idx)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={wp(6)} color="#ff0000" />
            </Pressable>
          </Pressable>
        ))}

        {/* Add Image Button */}
        {images?.length < 3 && (
          <Pressable
            onPress={() => {
              setfileModal(true);
              setmediaTypes("images");
            }}
            style={styles.addImageButton}
          >
            <Ionicons name="add" size={wp(10)} color={COLORS.primary} />
            <Text style={styles.addImageText}>{t("add_image")}</Text>
          </Pressable>
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
            <Ionicons name="warning" size={wp(15)} style={{ marginBottom: wp(4) }} color={'#ff0000'} />
            <Text style={styles.modalTitle}>{t("delete_image")}</Text>
            <Text style={styles.modalMessage}>
              {t("confirm_delete_image")}
            </Text>
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
  container: {
    marginVertical: hp(1),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1),
    color: "#333",
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  imageContainer: {
    position: "relative",
    width: wp(26),
    height: wp(26),
    marginRight: wp(2),
    marginBottom: hp(1),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    elevation: 3, // shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: wp(2),
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: wp(5),
    padding: wp(1.5),
    elevation: 2,
  },
  addImageButton: {
    width: wp(26),
    height: wp(26),
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp(2),
    marginRight: wp(2),
    marginBottom: hp(1),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
  },
  addImageText: {
    marginTop: 5,
    color: COLORS.primary,
    fontWeight: "600",
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
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: hp(4),
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

export default ImagesFormSection;
