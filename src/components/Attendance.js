import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AttendanceSummary from "./AttendanceSummary";
import MonthYearDatePickerModal from "./CurentYearDayList";

export default function Attendance() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    present: 22,
    absent: 2,
    late: 3,
    total: 27,
  });
  const [loginData, setLoginData] = useState([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    const dummyData = [
      { id: 1, date: "2026-02-10", login: "09:02 AM", logout: "06:05 PM", status: "Present" },
      { id: 2, date: "2026-02-09", login: "09:45 AM", logout: "06:00 PM", status: "Late" },
      { id: 3, date: "2026-02-08", login: "--", logout: "--", status: "Absent" },
      { id: 4, date: "2026-02-07", login: "--", logout: "--", status: "Absent" },
    ];
    setLoginData(dummyData);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "#2E7D32";
      case "Late":
        return "#F57C00";
      default:
        return "#D32F2F";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/backIcon.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Pressable style={styles.dateToggle} onPress={() => setIsPickerVisible(!isPickerVisible)}>
          <Text style={styles.dateToggleText}>{selectedDate.format("MMMM DD, YYYY")}</Text>
          <Icon name="calendar" type="font-awesome" color={COLORS.white} size={wp(6)} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}


        {/* Date Picker Modal */}
        <MonthYearDatePickerModal
          isVisible={isPickerVisible}
          onClose={() => setIsPickerVisible(false)}
          onSelect={({ month, year, date }) => {
            setSelectedDate(dayjs().year(year).month(month).date(date));
          }}
        />

        {/* Summary */}
        <View style={{ padding: wp(4) }}>
          <AttendanceSummary summary={summary} />
        </View>

        {/* Attendance List */}
        {loginData.length === 0 ? (
          <Text style={styles.emptyText}>{t("No attendance records found")}</Text>
        ) : (
          loginData.map((item) => {
            const statusColor = getStatusColor(item.status);
            const dayName = dayjs(item.date).format("ddd");
            const dateNum = dayjs(item.date).format("DD");
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: statusColor + "15", borderColor: statusColor + "15" },
                ]}
              >
                {/* Date Box */}
                <View style={[styles.dateBox, { backgroundColor: statusColor + "15" }]}>
                  <Text style={[styles.dayText, { color: statusColor }]}>{dayName}</Text>
                  <Text style={[styles.dateTextBox, { color: statusColor }]}>{dateNum}</Text>
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.fullDate}>{dayjs(item.date).format("DD MMM YYYY")}</Text>
                  <View style={styles.timeRow}>
                    <View style={styles.timeItem}>
                      <Icon name="login" type="material-community" size={wp(4.5)} color={COLORS.primary} />
                      <Text style={styles.timeText}>{item.login}</Text>
                    </View>
                    <View style={styles.timeItem}>
                      <Icon name="logout" type="material-community" size={wp(4.5)} color={COLORS.primary} />
                      <Text style={styles.timeText}>{item.logout}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContainer: { paddingBottom: hp(2) },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(2) },
  backIcon: {
    width: wp(6),
    height: wp(6),
    resizeMode: "contain",
    marginHorizontal: wp(3),
    padding: hp(1),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    marginBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginHorizontal: wp(2),
  },
  dateBox: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(1),
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: wp(4), fontFamily: "Poppins_500Medium" },
  dateTextBox: { fontSize: wp(5), fontFamily: "Poppins_700Bold" },
  detailsContainer: { flex: 1, marginLeft: wp(4), paddingHorizontal: wp(1) },
  fullDate: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", color: COLORS.black },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(1) },
  timeItem: { flexDirection: "row", alignItems: "center" },
  timeText: { marginLeft: wp(2), fontSize: wp(5), color: COLORS.gray, fontFamily: "Poppins_400Regular" },
  emptyText: { textAlign: "center", marginTop: hp(5), fontSize: wp(4), color: COLORS.gray },
  dateToggle: {
    paddingVertical: wp(2.5),
    marginVertical: wp(4),
    backgroundColor: COLORS.primary,
    borderRadius: wp(20),
    width: wp(80),
    elevation: 3,
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp(6),
  },
  dateToggleText: { fontSize: wp(4.5), color: COLORS.white, fontFamily: "Poppins_600SemiBold" },
});
