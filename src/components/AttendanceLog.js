import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AttendanceDetailsLog from "./AttendanceDetailsLog";
import AttendanceRow from "./AttendanceRow";
import CommonHeader from "./CommonHeader";
import MonthYearDatePickerModal from "./CurentYearDayList";

export default function AttendanceLog({ route }) {
  const navigation = useNavigation();
  const { hData } = route?.params;

  const [refreshing, setRefreshing] = useState(false);
  const [loginData, setLoginData] = useState([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [scrollY, setScrollY] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => loadAttendance(), []);

  const loadAttendance = () => {
    const dummyData = [];
    const today = new Date();
    for (let i = 0; i < 31; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0];
      const statuses = ["Present", "Late", "Absent"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const details = {
        login_time: "09:00 AM",
        logout_time: "06:00 PM",
        morning_tea_break: "00:00",
        lunch_break: "00:00",
        evening_tea_break: "00:00",
        today_working_hour: "08:00",
      };
      if (randomStatus === "Late") {
        details.login_time = "09:45 AM";
        details.logout_time = "06:05 PM";
      } else if (randomStatus === "Absent") {
        Object.keys(details).forEach((k) => (details[k] = "--"));
      }

      dummyData.push({ id: i + 1, date: formattedDate, login: details.login_time, logout: details.logout_time, status: randomStatus, details });
    }
    setLoginData(dummyData);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const handleScroll = (event) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerCell}>Date</Text>
      <Text style={styles.headerCell}>Day</Text>
      <Text style={styles.headerCell}>Login</Text>
      <Text style={styles.headerCell}>Logout</Text>
      <Text style={styles.headerCell}>Status</Text>
    </View>
  );

  const showFixedHeader = scrollY > hp(56);
  const flatListRef = useRef();

  const handleRowPress = (itemDate) => {
    const index = loginData.findIndex(i => i.date === itemDate);
    if (index !== -1 && flatListRef.current) {
      // Scroll so that row is slightly below top
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // 0 = top, 0.1 = slightly below top
      });
    }
  };
  return (
    <View style={styles.container}>
      <CommonHeader title="Attendance Log" onBackPress={() => navigation.goBack()} />
      {showFixedHeader && <TableHeader style={styles.fixedHeader} />}
      <FlatList
        ref={flatListRef}

        data={loginData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AttendanceRow item={item}
          expandedItem={expandedItem}   // pass from parent
          onRowPress={handleRowPress}  // send row press to parent
          setExpandedItem={setExpandedItem} // pass from parent
        />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: hp(3), paddingTop: hp(1) }}
        ListHeaderComponent={
          <>
            <View style={{ flexDirection: "row", paddingHorizontal: wp(2) }}>
              <View style={styles.header}>
                <Pressable style={styles.dateToggle} onPress={() => setIsPickerVisible(true)}>
                  <Text style={styles.dateToggleText}>{selectedDate.format("YYYY")}</Text>
                  <Icon name="calendar" type="font-awesome" color={COLORS.white} size={wp(4)} />
                </Pressable>
              </View>
              <View style={styles.header}>
                <Pressable style={[styles.dateToggle, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary }]}>
                  <Text style={[styles.dateToggleText, { color: COLORS.primary }]}>Download</Text>
                  <Icon name="download" type="font-awesome" color={COLORS.primary} size={wp(4)} />
                </Pressable>
              </View>
            </View>

            <MonthYearDatePickerModal
              isVisible={isPickerVisible}
              onClose={() => setIsPickerVisible(false)}
              onSelect={({ month, year, date }) => setSelectedDate(dayjs().year(year).month(month).date(date))}
            />
            <AttendanceDetailsLog homepageData={hData} />
            {!showFixedHeader && <TableHeader />}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(2) },
  dateToggle: {
    paddingVertical: wp(2),
    marginBottom: wp(4),
    backgroundColor: COLORS.primary,
    borderRadius: wp(20),
    width: wp(45),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp(6),
  },
  dateToggleText: { fontSize: wp(3.5), color: COLORS.white, fontFamily: "Poppins_600SemiBold" },
  tableHeader: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingVertical: hp(1.2), paddingHorizontal: wp(2), borderBottomWidth: 1, borderBottomColor: "#ddd", elevation: 4, zIndex: 10 },
  fixedHeader: { position: "absolute", top: hp(12), left: 0, right: 0, zIndex: 999, elevation: 4 },
  headerCell: { flex: 1, textAlign: "center", color: "#FFF", fontSize: wp(3.5), fontFamily: "Poppins_600SemiBold" },
});
