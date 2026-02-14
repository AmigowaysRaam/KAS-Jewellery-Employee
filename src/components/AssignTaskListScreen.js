import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl,
  StyleSheet, Text, View
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns.js";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext.js";
import { fetchData } from "./api/Api";
import AssignedTaskCard from "./AssignedTaskCard.js";
import CommonHeader from "./CommonHeader";
import DateandDownloadTask from "./DateandDownloadTask";
import SearchContainer from "./SearchContainer";
import TaskDetailModal from "./TaskDetailModal";
export default function AssignedTasklistScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const { todayKey } = route?.params || {};
  const siteDetails = useSelector((state) => state.auth?.siteDetails?.data[0]);
  const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
  const { showToast } = useToast();
  const initialDateRange = { from: null, to: null };
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status);
  const [selectedDateRange, setSelectedDateRange] = useState(initialDateRange);
  const [selectedTask, setSelectedTask] = useState(null);
  const [allowCreateTask, setallowCreateTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [canAssign, setCanAssign] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  /** Fetch tasks from API */
  const fetchTasks = async (pageNo = 1, isRefresh = false, initialStatus) => {
    // Alert.alert('',JSON.stringify(todayKey))
    if (!hasMore && !isRefresh) return;
    const lang = await getStoredLanguage();
    setLoading(pageNo === 1);
    try {
      // Map initialStatus label to value
      const statusObj = siteDetails?.ticketstatusList.find(
        (item) => item.label.toLowerCase() === (initialStatus || '').toLowerCase()
      );
      // Alert.alert(initialStatus)
      const statusValue = statusObj ? statusObj.value : undefined;
      const response = await fetchData(
        "app-employee-list-my-assigned-tasks",
        "POST",
        {
          user_id: profileDetails?.id,
          per_page: 10,
          current_page: pageNo,
          lang: lang,
          from: selectedDateRange.from,
          to: selectedDateRange.to,
          todayKey: todayKey,
          ...(statusValue && { status: statusValue }), // Only send if value exists
        }
      );
      // Alert.alert('',JSON.stringify(response,null,2))
      if (response?.text === "Success") {
        let data = response?.data?.tasks || [];
        setallowCreateTask(response?.data?.allowCreateTask)
        setCanAssign(response?.data?.canAssign)
        if (searchText) {
          data = data.filter((task) =>
            (task.title || "").toLowerCase().includes(searchText.toLowerCase())
          );
        }
        if (initialStatus) {
          data = data.filter(
            (task) => task.status?.toLowerCase() === initialStatus.toLowerCase()
          );
        }
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
        // Alert.alert(JSON.stringify(response?.data?.tasks?.length))
        setHasMore(response?.data?.tasks?.length === 10);
        // setTasks((prev) => (pageNo === 1 ? data : [...prev, ...data]));
        setTasks((prev) => {
          if (pageNo === 1) return data;
          const newData = data.filter(
            (newItem) => !prev.some((prevItem) => prevItem.id === newItem.id)
          );

          return [...prev, ...newData];
        });

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
  useFocusEffect(
    React.useCallback(() => {
      setHasMore(true);
      fetchTasks(1, true, selectedStatus);
    }, [profileDetails?.id, searchText, selectedStatus])
  );
  /** Pull to refresh */
  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchTasks(1, true, selectedStatus);
  };
  /** Load more tasks */
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTasks(page + 1, false, selectedStatus);
    }
  };
  /** Status color */
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "#3498db";        // Blue
      case "Inprogress":
        return "#f39c12";        // Orange
      case "Waiting for QC":
        return "#9b59b6";        // Purple
      case "Completed":
        return "#2ecc71";        // Green
      default:
        return COLORS.primary;   // Fallback
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
  const renderSkeleton = () => (
    <View style={[styles.card, { backgroundColor: "#e0e0e0" }]}>
      <View style={{ height: hp(2.5), width: "60%", backgroundColor: "#ccc", borderRadius: wp(1), marginBottom: hp(1) }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ height: hp(1.5), width: "30%", backgroundColor: "#ccc", borderRadius: wp(1) }} />
        <View style={{ height: hp(1.5), width: "20%", backgroundColor: "#ccc", borderRadius: wp(1) }} />
      </View>
    </View>
  );

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
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <CommonHeader title={t('assigned_task')} showBackButton={route?.params ? true : false} onBackPress={() => navigation?.goBack()} />
        <SearchContainer
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search tasks..."
          selectedStatus={selectedStatus}
          onStatusSelect={handleStatusSelect}
          modalVisible={modalVisible}
          selectedStatuss={selectedStatus}
          clearSearch={() => setSearchText("")}
        />
        {loading && page === 1 ? (
          // Initial load skeleton
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item?.toString()}
            renderItem={renderSkeleton}
            contentContainerStyle={{ paddingVertical: hp(2) }}
          />
        ) : (
          // Actual task list
          <FlatList
            ListHeaderComponent={
              tasks?.length > 0 && (
                <>
                  <DateandDownloadTask
                    // taskLength={tasks?.length}
                    taskFlag={'assigned'}
                    fromDate={selectedDateRange.from}
                    toDate={selectedDateRange.to}
                    onDateSelect={(range) => {
                      setSelectedDateRange(range);
                      setHasMore(true);
                      fetchTasks(1, true, selectedStatus);
                    }}
                    onDownload={() => showToast('Task list download is in progress...', 'info')}
                  />
                </>
              )
            }
            contentContainerStyle={{ paddingBottom: hp(8) }}
            data={tasks}
            // keyExtractor={(item) => item?.id}
            keyExtractor={(item, index) => `${item?.id}-${index}`}

            renderItem={({ item }) => (
              <AssignedTaskCard
                item={item}
                t={t}
                navigation={navigation}
                openTaskModal={openTaskModal}
                getStatusColor={getStatusColor}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS?.primary]}          // Android spinner color(s)
                tintColor={COLORS?.primary}         // iOS spinner color
                progressBackgroundColor={COLORS?.ashGrey}// Android background (optional)
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              loading && page > 1 ? (
                <View style={{ paddingVertical: hp(2), alignItems: "center" }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && tasks.length === 0 && (
                <View style={{ alignItems: "center", marginTop: hp(5) }}>
                  <Text style={{ color: COLORS.gray, fontFamily: "Poppins_600SemiBold" }}>
                    {t('no_tasks_found')}
                  </Text>
                </View>
              )
            }
          />
        )}
        {
          allowCreateTask == '1' &&
          <Pressable style={styles.fabButton} onPress={() => navigation?.navigate('CreateTask', {
            canAssign: canAssign
          })}>
            <Icon name="add" size={wp(4.5)} color="#fff" style={{ marginRight: wp(2) }} />
            <Text style={styles.fabText}>{t('create_task')}</Text>
          </Pressable>
        }
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
    backgroundColor: "#fff", marginHorizontal: wp(4),
    marginBottom: hp(2), padding: wp(3), borderRadius: wp(2),
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(1) },
  taskTitle: {
    fontSize: wp(4), fontFamily: "Poppins_600SemiBold", flex: 1, color: "#222", textTransform: "capitalize",
    maxWidth: wp(60), justifyContent: "center", lineHeight: wp(5)
  },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  voiceIcon: { width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: "#eef4ff", justifyContent: "center", alignItems: "center", marginRight: wp(2) },
  priorityBadge: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5), marginRight: wp(2) },
  priorityText: { color: "#fff", fontSize: wp(3.2) },
  statusBadge: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5) },
  statusText: { color: "#fff", fontSize: wp(3.2) },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(1) },
  dateBox: {
    backgroundColor: "#f1f1f1", padding: wp(1), paddingVertical: wp(2), borderRadius: wp(2), flex: 1, marginRight: wp(2),
    borderColor: COLORS?.primary, borderWidth: wp(0.4)
  }, dateLabel: { fontSize: wp(3), color: "#555", marginBottom: hp(0.3), fontFamily: "Poppins_400Regular" },
  dateText: { fontSize: wp(3.3), color: "#333", fontFamily: "Poppins_400Regular" },
  fabButton: {
    position: "absolute", bottom: hp(4), right: hp(4), backgroundColor: COLORS.primary, flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3.2), paddingVertical: hp(1.2), borderRadius: wp(10),
    shadowColor: "#000", shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.3, shadowRadius: wp(3), elevation: 5, borderWidth: wp(0.4), borderColor: COLORS?.primary + "90"
  },
  fabText: { color: "#fff", fontSize: wp(3.5), fontWeight: "600", fontFamily: 'Poppins_600SemiBold', lineHeight: wp(4.9) },
});