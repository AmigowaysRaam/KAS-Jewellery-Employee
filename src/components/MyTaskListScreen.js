import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList, KeyboardAvoidingView, Platform,
  RefreshControl, StyleSheet,
  Text, View
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns.js";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext.js";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";
import DateandDownloadTask from "./DateandDownloadTask";
import MyTaskCard from "./MyTaskCard.js";
import SearchContainer from "./SearchContainer";
import TaskDetailModal from "./TaskDetailModal";

export default function MyTaskListScreen({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const siteDetails = useSelector((state) => state.auth?.siteDetails?.data[0]);
  const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
  const { showToast } = useToast();
  const { todayKey } = route?.params || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(route?.params?.status || null);
  const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const getStatusValue = (statusLabel) => {
    return siteDetails?.ticketstatusList?.find(
      (item) => item.label.toLowerCase() === (statusLabel || "").toLowerCase()
    )?.value;
  };
  const fetchTasks = async (pageNo = 1, isRefresh = false, status = selectedStatus) => {
    // Alert.alert("Debug Info", todayKey);
    if (!hasMore && !isRefresh) return;
    const lang = await getStoredLanguage();
    setLoading(pageNo === 1);
    // todayKey == 'today' ? new Date() : null
    try {
      const statusValue = status ? getStatusValue(status) : null;
      const response = await fetchData("app-employee-list-my-tasks", "POST", {
        user_id: profileDetails?.id,
        per_page: 10,
        current_page: pageNo,
        lang: lang,
        from: selectedDateRange.from,
        to: selectedDateRange.to,
        search: searchText || null,
        ...(statusValue && { status: statusValue }),
        todayKey: todayKey || null,
      });
      if (response?.text === "Success") {
        let data = response?.data?.tasks || [];
        // Apply search filter
        // if (searchText) {
        //   data = data.filter((task) =>
        //     (task.title || "").toLowerCase().includes(searchText.toLowerCase())
        //   );
        // }
        // Apply status filter only if status exists
        if (status) {
          data = data.filter(
            (task) => task?.status?.toLowerCase() === status.toLowerCase()
          );
        }
        // setHasMore(data.length === 10);
        // setTasks((prev) => (pageNo === 1 ? data : [...prev, ...data]));
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
  /** Refresh on focus or dependency changes */
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks(1, true, selectedStatus);
    }, [profileDetails?.id, selectedStatus, searchText])
  );

  /** Handle pull-to-refresh */
  const onRefresh = () => {
    console.log("Refreshing", siteDetails?.ticketstatusList);
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


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <CommonHeader title={t('my_task')} showBackButton={route?.params ? true : false} onBackPress={() => navigation?.goBack()} />
        {/* <Text style={{ color: COLORS.primary, fontFamily: "Poppins_400Regular", fontSize: wp(3.5), marginHorizontal: wp(4), marginTop: hp(1) }}>
          {JSON.stringify(route?.params)}
        </Text> */}
        <SearchContainer
          value={searchText}
          onChangeText={setSearchText}
          placeholder={`${t("search_task")}...`}
          selectedStatuss={selectedStatus}
          onStatusSelect={handleStatusSelect}
          modalVisible={modalVisible}
          clearSearch={() => setSearchText("")}
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
          ListFooterComponent={
            loading && page > 1 ? 
            (
              <View style={{ paddingVertical: hp(2) }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
            ListHeaderComponent={<>
              <DateandDownloadTask
                taskFlag={'myTask'}
                fromDate={selectedDateRange.from}
                toDate={selectedDateRange.to}
                onDateSelect={(range) => {
                  setSelectedDateRange(range);
                  setHasMore(true);
                  fetchTasks(1, true, selectedStatus);
                }}
                onDownload={() => showToast('Task list download is in progress...', 'info')}
              />
            </>}
            data={tasks}
            keyExtractor={(item) => item?.id}
            renderItem={({ item }) => (
              <MyTaskCard
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
            ListEmptyComponent={
              !loading && (
                <View style={{ alignItems: "center", marginTop: hp(5) }}>
                  <Text style={{ color: COLORS.gray, fontFamily: "Poppins_600SemiBold" }}>
                    {t('no_tasks_found')}
                  </Text>
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
    padding: wp(3),
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
  dateText: { fontSize: wp(3.3), color: "#333", fontFamily: "Poppins_400Regular" },
});
