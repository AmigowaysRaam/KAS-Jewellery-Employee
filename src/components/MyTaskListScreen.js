import { useFocusEffect, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, StyleSheet,
  Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns.js";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext.js";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";
import DateandDownloadTask from "./DateandDownloadTask";
import SearchContainer from "./SearchContainer";
import TaskDetailModal from "./TaskDetailModal";
import ViewButton from "./ViewBtn.js";

export default function MyTaskListScreen({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const siteDetails = useSelector((state) => state.auth?.siteDetails?.data[0]);
  const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
  const { showToast } = useToast();

  const initialDateRange = { from: null, to: null };

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status || null);
  const [selectedDateRange, setSelectedDateRange] = useState(initialDateRange);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  /** Map status label to API value */
  const getStatusValue = (statusLabel) => {
    return siteDetails?.ticketstatusList?.find(
      (item) => item.label.toLowerCase() === (statusLabel || "").toLowerCase()
    )?.value;
  };
  /** Fetch tasks from API */
  const fetchTasks = async (pageNo = 1, isRefresh = false, status = selectedStatus) => {
    if (!hasMore && !isRefresh) return;
    const lang = await getStoredLanguage();
    setLoading(pageNo === 1);
    try {
      const statusValue = status ? getStatusValue(status) : null;
      const response = await fetchData("app-employee-list-my-tasks", "POST", {
        user_id: profileDetails?.id,
        per_page: 10,
        current_page: pageNo,
        lang: lang,
        ...(statusValue && { status: statusValue }),
      });
      if (response?.text === "Success") {
        let data = response?.data?.tasks || [];
        // Apply search filter
        if (searchText) {
          data = data.filter((task) =>
            (task.title || "").toLowerCase().includes(searchText.toLowerCase())
          );
        }
        // Apply status filter only if status exists
        if (status) {
          data = data.filter(
            (task) => task?.status?.toLowerCase() === status.toLowerCase()
          );
        }
        // Apply date filter
        if (selectedDateRange.from || selectedDateRange.to) {
          data = data.filter((task) => {
            const assigned = dayjs(task.assigned_date, "DD-MM-YYYY hh:mm a");
            if (selectedDateRange.from && selectedDateRange.to) {
              return (
                assigned.isAfter(dayjs(selectedDateRange.from).startOf("day")) &&
                assigned.isBefore(dayjs(selectedDateRange.to).endOf("day"))
              );
            }
            if (selectedDateRange.from) {
              return assigned.isAfter(dayjs(selectedDateRange.from).startOf("day"));
            }
            if (selectedDateRange.to) {
              return assigned.isBefore(dayjs(selectedDateRange.to).endOf("day"));
            }
            return true;
          });
        }

        setHasMore(data.length === 10);
        setTasks((prev) => (pageNo === 1 ? data : [...prev, ...data]));
        setPage(pageNo);
      } else {
        showToast(response?.message || "Failed to fetch tasks", "error");
      }
    } catch (err) {
      console.error("Task API Error:", err);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /** Refresh on focus or dependency changes */
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks(1, true, selectedStatus);
    }, [profileDetails?.id, selectedStatus, searchText, selectedDateRange])
  );

  /** Handle pull-to-refresh */
  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchTasks(1, true, selectedStatus);
  };

  /** Load more tasks on scroll */
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTasks(page + 1, false, selectedStatus);
    }
  };
  /** Handle status selection */
  const handleStatusSelect = (status) => {
    if (!status && route?.params?.status) {
      setSelectedStatus(route?.params?.status)
      setHasMore(true);
      fetchTasks(1, true, status);
    }
    else {
      setSelectedStatus(status);
      setHasMore(true);
      fetchTasks(1, true, status);
    }
  };

  /** Status color */
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "#3498db";
      case "Inprogress":
        return "#f39c12";
      default:
        return COLORS.primary;
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case "Critical":
        return { color: "#C0392B", icon: "x-octagon" }; // very urgent
      case "High":
        return { color: "#E74C3C", icon: "alert-circle" };
      case "Medium":
        return { color: "#F39C12", icon: "alert-triangle" };
      case "Low":
        return { color: "#2ECC71", icon: "check-circle" };
      default:
        return { color: "#9E9E9E", icon: "info" };
    }
  };
  /** Open task modal */
  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };
  /** Skeleton loader */
  const renderSkeleton = () => (
    <View style={[styles.card, { backgroundColor: "#e0e0e0" }]}>
      <View
        style={{
          height: hp(2.5),
          width: "60%",
          backgroundColor: "#ccc",
          borderRadius: wp(1),
          marginBottom: hp(1),
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View
          style={{ height: hp(1.5), width: "30%", backgroundColor: "#ccc", borderRadius: wp(1) }}
        />
        <View
          style={{ height: hp(1.5), width: "20%", backgroundColor: "#ccc", borderRadius: wp(1) }}
        />
      </View>
    </View>
  );
  /** Render each task */
  const renderTask = ({ item }) => {
    const hasVoice = !!item.voice;
    return (
      <Pressable
        onPress={() => openTaskModal(item)}
        style={[styles.card, { borderLeftColor: getPriorityColor(item.priority)?.color, borderLeftWidth: wp(1) }]}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.taskTitle}>{item.title || t("Untitled Task")}</Text>
          {__DEV__ &&
            <Text style={styles.taskTitle}>{item.id || t("Untitled Task")}</Text>
          }
          <View style={styles.rightHeader}>
            <View style={[styles.voiceIcon, { opacity: hasVoice ? 1 : 0.3 }]}>
              <Icon name="play-arrow" size={wp(5)} color={COLORS.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>{t('assigned_date')}</Text>
            <Text numberOfLines={1} style={styles.dateText}>{item.assigned_date}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>{t('due_date')}</Text>
            <Text numberOfLines={1} style={styles.dateText}>{item.due_date}</Text>
          </View>
        </View>
        <ViewButton
          priority={item.priority}
          onPress={() =>
            //  openTaskModal(item)
            navigation?.navigate('TasKDetailById', { task: item })
          }
          label={t("View")}
        />
      </Pressable>
    );
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <CommonHeader title="My Tasks" showBackButton={route?.params ? true : false} onBackPress={() => navigation?.goBack()} />
        <SearchContainer
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search tasks..."
          selectedStatuss={selectedStatus}
          onStatusSelect={handleStatusSelect}
          modalVisible={modalVisible}
        />
        {loading && page === 1 ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={renderSkeleton}
            contentContainerStyle={{ paddingVertical: hp(2) }}
          />
        ) : (
          <FlatList
            ListHeaderComponent={<>
              <DateandDownloadTask
                onDateSelect={setSelectedDateRange}
                onDownload={() => console.log("Download clicked")}
              />
            </>}
            data={tasks}
            keyExtractor={(item) => item.s_no.toString()}
            renderItem={renderTask}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              !loading && (
                <View style={{ alignItems: "center", marginTop: hp(5) }}>
                  <Text style={{ color: COLORS.gray, fontFamily: "Poppins_600SemiBold" }}>No tasks found</Text>
                </View>
              )
            }
          />
        )}
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
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1) },
  taskTitle: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", flex: 1, color: "#222", textTransform: "capitalize" },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  voiceIcon: { width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: "#eef4ff", justifyContent: "center", alignItems: "center", marginRight: wp(2) },
  priorityBadge: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5), marginRight: wp(2) },
  priorityText: { color: "#fff", fontSize: wp(3.2) },
  statusBadge: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5) },
  statusText: { color: "#fff", fontSize: wp(3.2) },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(1), },
  dateBox: {
    backgroundColor: "#f1f1f1", padding: wp(2), borderRadius: wp(2), flex: 1, marginRight: wp(2),
    borderColor: COLORS?.primary, borderWidth: wp(0.4)
  },
  dateLabel: { fontSize: wp(3), color: "#555", marginBottom: hp(0.3), fontFamily: "Poppins_400Regular" },
  dateText: { fontSize: wp(3.5), color: "#333", fontFamily: "Poppins_400Regular" },
});
