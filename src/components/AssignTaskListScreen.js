import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors.js";
import { hp, wp } from "../../app/resources/dimensions.js";
import CommonHeader from "./CommonHeader.js";
import SearchContainer from "./SearchContainer.js";
import TaskDetailModal from "./TaskDetailModal.js";

export default function AssignTaskListScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Move status filter to parent
  const [selectedStatus, setSelectedStatus] = useState(null);

  const TASK_LIST = [
    { task_title: "Design login page", assign_date: "2026-01-10", due_date: "2026-01-15", status: "In Progress" },
    { task_title: "Set up database schema", assign_date: "2026-01-08", due_date: "2026-01-12", status: "Completed" },
    { task_title: "Implement authentication API", assign_date: "2026-01-12", due_date: "2026-01-18", status: "Pending" },
    { task_title: "Write unit tests", assign_date: "2026-01-14", due_date: "2026-01-20", status: "Pending" },
    { task_title: "Deploy to staging environment", assign_date: "2026-01-16", due_date: "2026-01-22", status: "Not Started" },
  ];

  // Filter tasks by search text AND selected status
  const filteredTasks = TASK_LIST.filter(task => {
    const matchesText = task.task_title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus ? task.status === selectedStatus : true;
    return matchesText && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "#2ecc71";
      case "In Progress": return "#f39c12";
      case "Pending": return "#e67e22";
      case "Not Started": return "#7f8c8d";
      default: return COLORS.primary;
    }
  };
  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };
  const renderTask = ({ item }) => (
    <Pressable
      onPress={() => {
        // Close dropdown when clicking task
        setSelectedStatus(selectedStatus); // Keep the pill
        openTaskModal(item);
      }}
      style={[styles.card, { borderLeftColor: COLORS.primary, borderLeftWidth: wp(1) }]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.task_title}</Text>
        <View style={styles.rightHeader}>
          <Pressable style={styles.voiceButton}>
            <Icon name="play-arrow" size={wp(6)} color={COLORS.primary} />
          </Pressable>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Icon name="chevron-right" size={wp(6)} color="#888" style={{ marginLeft: wp(2) }} />
        </View>
      </View>
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Text style={styles.label}>Assigned</Text>
          <Text style={styles.dateText}>{item.assign_date}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.label}>Due</Text>
          <Text style={styles.dateText}>{item.due_date}</Text>
        </View>
      </View>
    </Pressable>
  );
  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <View style={styles.container}>
      <CommonHeader title="My Assigned Tasks" showBackButton={false} />
      <SearchContainer
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search tasks..."
        selectedStatus={selectedStatus}
        onStatusSelect={(status) => setSelectedStatus(status)}
        modalVisible={modalVisible}
      />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTask}
        contentContainerStyle={{ paddingVertical: hp(2) }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: hp(5) }}>
            <Text style={{ color: COLORS.gray, fontSize: wp(4) }}>No tasks found</Text>
          </View>
        }
      />
      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        getStatusColor={getStatusColor}
      />
    </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fb" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.4) },
    shadowOpacity: 0.08,
    shadowRadius: wp(2),
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskTitle: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", flex: 1, paddingRight: wp(2), color: "#222" },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  voiceButton: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    backgroundColor: "#eef4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  statusBadge: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5) },
  statusText: { color: "#fff", fontSize: wp(3), fontFamily: "Poppins_500Medium" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(2) },
  dateItem: { flex: 1 },
  label: { fontSize: wp(3), fontFamily: "Poppins_400Regular", color: "#888" },
  dateText: { fontSize: wp(3.5), fontFamily: "Poppins_500Medium", marginTop: hp(0.3), color: "#333" },
});
