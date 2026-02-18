import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AttendanceDetailsLog from "./AttendanceDetailsLog";
import AttendanceRow from "./AttendanceRow";
import AttendTableHeader from "./AttendanceTblHead";
import CommonHeader from "./CommonHeader";
import CustomDropdownData from "./CustomDropDownwihtUI";

export default function AttendanceLog({ route }) {
  const navigation = useNavigation();
  const { hData } = route?.params;

  const [refreshing, setRefreshing] = useState(false);
  const [loginData, setLoginData] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

  const [yearDropdownVisible, setYearDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);

  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // 1-12

  const flatListRef = useRef();

  useEffect(() => loadAttendance(), [selectedYear, selectedMonth]);

  // Generate dummy attendance based on selected month/year
  const loadAttendance = () => {
    const dummyData = [];
    const daysInMonth = dayjs(`${selectedYear}-${selectedMonth}-01`).daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      const date = dayjs(`${selectedYear}-${selectedMonth}-01`).date(i + 1);
      const formattedDate = date.format("YYYY-MM-DD");

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

      dummyData.push({
        id: i + 1,
        date: formattedDate,
        login: details.login_time,
        logout: details.logout_time,
        status: randomStatus,
        details,
      });
    }
    setLoginData(dummyData);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const handleScroll = (event) => setScrollY(event.nativeEvent.contentOffset.y);
  const showFixedHeader = scrollY > hp(60);

  const handleRowPress = (itemDate) => {
    const index = loginData.findIndex((i) => i.date === itemDate);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };
  // Dropdown options
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = dayjs().year() - i;
    return { label: y.toString(), value: y };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: dayjs().month(i).format("MMMM"),
    value: i + 1,
  }));

  return (
    <View style={styles.container}>
      <CommonHeader title="Attendance Log" onBackPress={() => navigation.goBack()} />

      {showFixedHeader && <AttendTableHeader style={styles.fixedHeader} />}

      <FlatList
        ref={flatListRef}
        data={loginData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AttendanceRow
            item={item}
            expandedItem={expandedItem}
            onRowPress={handleRowPress}
            setExpandedItem={setExpandedItem}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: hp(3), paddingTop: hp(1) }}
        ListHeaderComponent={
          <>
            {/* Year & Month Buttons */}
            <View style={{ flexDirection: "row", paddingHorizontal: wp(3), justifyContent: "space-between", marginBottom: hp(2) }}>
              <View style={{ flex: 1, marginRight: wp(1) }}>
                <Pressable
                  style={[styles.dateToggle, {
                    borderWidth: wp(0.4), borderColor:
                      COLORS?.primary
                  }]}
                  onPress={() => setYearDropdownVisible(!yearDropdownVisible)}
                >
                  <Text style={styles.dateToggleText}>{selectedYear}</Text>
                  <Icon type="feather"
                    name={yearDropdownVisible ? "calendar" : "calendar"}
                    size={wp(5)}
                    color="#fff"
                  />
                </Pressable>
                <CustomDropdownData
                  onClose={() => setYearDropdownVisible(false)}
                  title={'Choose Year'}
                  isVisible={yearDropdownVisible}
                  data={yearOptions}
                  selectedItem={{ value: selectedYear }}
                  onSelect={(item) => {
                    setSelectedYear(item.value);
                    setYearDropdownVisible(false);
                  }}
                />
              </View>

              <View style={{ flex: 1, marginLeft: wp(1) }}>
                <Pressable
                  style={[styles.dateToggle, {
                    backgroundColor: COLORS?.white,
                    borderWidth: wp(0.4), borderColor:
                      COLORS?.primary
                  }]}
                  onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
                >
                  <Text style={[styles.dateToggleText, {
                    color: COLORS?.primary
                  }]}>
                    {'Download'}
                  </Text>
                  <Icon
                    name={'download'}
                    size={wp(5)}
                    color={COLORS?.primary}
                  />
                </Pressable>
              </View>
            </View>
            <AttendanceDetailsLog homepageData={hData} />
            <View style={{ marginLeft: wp(4) }}>
              <Pressable
                style={[styles.dateToggle, {
                  width: "45%",
                }]}
                onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
              >
                <Text style={styles.dateToggleText}>
                  {monthOptions.find(m => m.value === selectedMonth)?.label || "Month"}
                </Text>
                <Icon
                  type="feather"
                  name={monthDropdownVisible ? "arrow-drop-up" : "calendar"}
                  size={wp(5)}
                  color="#fff"
                />
              </Pressable>
              <CustomDropdownData
                title={'Choose Month'}
                isVisible={monthDropdownVisible}       // <- Control visibility
                onClose={() => setMonthDropdownVisible(false)}
                data={monthOptions}
                selectedItem={{ value: selectedMonth }}
                onSelect={(item) => {
                  setSelectedMonth(item.value);
                  setMonthDropdownVisible(false);
                }}
              />
              
            </View>
            {/* Table Header */}
            {!showFixedHeader && <AttendTableHeader style={styles.fixedHeader} />}
          </>
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  fixedHeader: { position: "absolute", top: hp(12), left: 0, right: 0, zIndex: 999, elevation: 4 },
  dateToggle: {
    paddingVertical: wp(2),
    marginBottom: wp(2),
    backgroundColor: COLORS.primary,
    borderRadius: wp(20),
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp(4),
  },
  dateToggleText: {
    fontSize: wp(3.8),
    color: "#fff",
    fontFamily: "Poppins_600SemiBold", lineHeight: hp(3)
  },
});