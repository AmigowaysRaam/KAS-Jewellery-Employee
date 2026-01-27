import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TaskDetailModal = ({ visible, task, onClose, getStatusColor }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(translateY, {
        toValue: 0, // Stick to bottom
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT, // Slide down off-screen
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!task || !showModal) return null;

  return (
    <Modal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Dismiss on background press */}
        <Pressable style={styles.overlay} onPress={onClose} />

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Top-Center Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={wp(5)} color="#fff" />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <Text style={styles.modalTitle}>{task.task_title}</Text>

            {/* Status */}
            <View style={styles.modalStatusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) },
                ]}
              >
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.modalDates}>
              <View style={styles.dateItem}>
                <Text style={styles.label}>Assigned</Text>
                <Text style={styles.dateText}>{task.assign_date}</Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.label}>Due</Text>
                <Text style={styles.dateText}>{task.due_date}</Text>
              </View>
            </View>

            {/* Voice Button */}
            <Pressable style={styles.modalVoiceButton}>
              <Icon name="play-arrow" size={wp(8)} color={COLORS.primary} />
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
export default TaskDetailModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0, // Stick to bottom
    height: SCREEN_HEIGHT * 0.4, // 50% height
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(5),
    paddingTop: wp(8), // leave space for close button handle
  },
  closeButton: {
    position: "absolute",
    top: hp(-2),
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, borderWidth: wp(1), borderColor: "#fff",
  },
  modalTitle: {
    fontSize: wp(5),
    fontFamily: "Poppins_700Bold",
    color: "#222",
    marginBottom: hp(2),
  },
  modalStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  modalLabel: {
    fontSize: wp(4),
    fontFamily: "Poppins_500Medium",
    marginRight: wp(2),
    color: "#444",
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
  },
  statusText: {
    color: "#fff",
    fontSize: wp(3),
    fontFamily: "Poppins_500Medium",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: hp(0.2) },
  },
  modalDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  dateItem: { flex: 1 },
  label: {
    fontSize: wp(3),
    fontFamily: "Poppins_400Regular",
    color: "#888",
  },
  dateText: {
    fontSize: wp(3.5),
    fontFamily: "Poppins_500Medium",
    marginTop: hp(0.3),
    color: "#333",
  },
  modalVoiceButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: "#eef4ff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2),
    marginBottom: hp(4),
  },
});
