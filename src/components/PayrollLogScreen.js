import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
import CustomDropdownData from "./CustomDropDownwihtUI";
import PayrollTbHead from "./PayrollTbHead";

export default function PayrollLogScreen({ route }) {
  const navigation = useNavigation();
  const { hData } = route?.params;

  const [refreshing, setRefreshing] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // 0-indexed for modal

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const flatListRef = useRef();

  const showFixedHeader = scrollY > hp(8);

  // Load dummy payroll data based on month/year
  useEffect(() => loadPayroll(), [selectedYear, selectedMonth]);

  const loadPayroll = () => {
    const data = [];
    const daysInMonth = dayjs().year(selectedYear).month(selectedMonth).daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      const date = dayjs().year(selectedYear).month(selectedMonth).date(i + 1);
      const formattedDate = date.format("YYYY-MM-DD");

      const randomSalary = (Math.random() * 500 + 1000).toFixed(2);

      data.push({
        id: i + 1,
        date: formattedDate,
        employee: `Employee ${i + 1}`,
        department: `Dept ${((i % 5) + 1)}`,
        amount: randomSalary,
        status: Math.random() > 0.2 ? "Paid" : "Pending",
        details: {
          basic: (randomSalary * 0.7).toFixed(2),
          bonus: (randomSalary * 0.2).toFixed(2),
          deductions: (randomSalary * 0.1).toFixed(2),
        },
      });
    }
    setPayrollData(data);
    setRefreshing(false);
  };
  // Dropdown options
  const yearOptions = Array.from({ length: 15 }, (_, i) => {
    const y = dayjs().year() - i;
    return { label: y.toString(), value: y };
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadPayroll();
  };
  const renderRow = ({ item }) => (
    <Pressable
      style={[
        styles.row,
        expandedItem === item.id && { backgroundColor: COLORS.lightGray },
      ]}
      onPress={() =>
        setExpandedItem(expandedItem === item.id ? null : item.id)
      }
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowText}>{dayjs(item.date).format("DD MMM")}</Text>
        <Text style={styles.rowText}>{item.employee}</Text>
        <Text style={styles.rowText}>{item.department}</Text>
        <Text style={[styles.rowText, { color: item.status === "Paid" ? COLORS.success : COLORS.warning }]}>
          {item.status}
        </Text>
        <Text style={styles.rowText}>${item.amount}</Text>
      </View>
      {expandedItem === item.id && (
        <View style={styles.details}>
          <Text>Basic: ${item.details.basic}</Text>
          <Text>Bonus: ${item.details.bonus}</Text>
          <Text>Deductions: ${item.details.deductions}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title={`Payroll - ${dayjs().month(selectedMonth).format("MMMM")} ${selectedYear}`}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.datePickerContainer}>
        <Pressable
          style={styles.dateToggle}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={styles.dateToggleText}>
            {dayjs().month(selectedMonth).format("MMMM")} {selectedYear}
          </Text>
          <Icon type="feather" name="calendar" size={wp(5)} color="#fff" />
        </Pressable>
      </View>
      <PayrollTbHead style={styles.fixedHeader} />
      <FlatList
        ref={flatListRef}
        data={payrollData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRow}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        // onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: hp(3), paddingTop: hp(1) }}
      // ListHeaderComponent={!showFixedHeader && }
      />
      <CustomDropdownData
        onClose={() => setDatePickerVisible(false)}
        title={'Choose Year'}
        isVisible={datePickerVisible}
        data={yearOptions}
        selectedItem={{ value: selectedYear }}
        onSelect={(item) => {
          setSelectedYear(item.value);
          setDatePickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  fixedHeader: {
    position: "absolute",
    top: hp(12),
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 4,
  },
  datePickerContainer: {
    paddingHorizontal: wp(3),
    marginVertical: hp(1),
  },
  dateToggle: {
    paddingVertical: wp(2),
    marginBottom: wp(2),
    backgroundColor: COLORS.primary,
    borderRadius: wp(20),
    width: "50%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp(4),
  },
  dateToggleText: {
    fontSize: wp(3.8),
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    lineHeight: hp(3),
  },
  row: {
    backgroundColor: "#F5F5F5",
    padding: wp(3),
    marginHorizontal: wp(2),
    marginVertical: hp(0.5),
    borderRadius: wp(2),
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: wp(3.5),
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  details: {
    marginTop: hp(1),
    paddingVertical: hp(1),
    borderTopWidth: 0.5,
    borderColor: COLORS.gray,
  },
});
