import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

export default function PayRollScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);

  const [salarySummary, setSalarySummary] = useState({
    grossSalary: 50000,
    deductions: 5000,
    netSalary: 45000,
    bonus: 2000,
  });

  const [payrollHistory, setPayrollHistory] = useState([]);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = () => {
    // Replace with API call
    const dummyPayroll = [
      {
        id: 1,
        month: "2026-01-01",
        gross: 50000,
        deductions: 5000,
        net: 45000,
        status: "Paid",
      },
      {
        id: 2,
        month: "2025-12-01",
        gross: 48000,
        deductions: 4000,
        net: 44000,
        status: "Paid",
      },
      {
        id: 3,
        month: "2025-11-01",
        gross: 48000,
        deductions: 4500,
        net: 43500,
        status: "Pending",
      },
    ];

    setPayrollHistory(dummyPayroll);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayroll();
  };

  /* ---------- SUMMARY CARD ---------- */
  const SummaryCard = ({ title, value, color }) => (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardValue}>₹ {value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  /* ---------- PAYROLL HISTORY ITEM ---------- */
  const renderItem = ({ item }) => {
    const statusColor =
      item.status === "Paid" ? "#4CAF50" : "#FF9800";

    return (
      <View style={styles.listItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.month}>
            {dayjs(item.month).format("MMMM YYYY")}
          </Text>

          <Text style={styles.salaryText}>
            Gross: ₹ {item.gross}
          </Text>
          <Text style={styles.salaryText}>
            Deductions: ₹ {item.deductions}
          </Text>
          <Text style={[styles.salaryText, { fontFamily: "Poppins_600SemiBold" }]}>
            Net: ₹ {item.net}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title={t("Payroll")}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={payrollHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: wp(4) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Title */}
            <Text style={styles.dashboardTitle}>
              {t("Salary Overview")}
            </Text>

            <Text style={styles.currentMonth}>
              {dayjs().format("MMMM YYYY")}
            </Text>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <SummaryCard
                title="Gross Salary"
                value={salarySummary.grossSalary}
                color={COLORS.primary}
              />
              <SummaryCard
                title="Bonus"
                value={salarySummary.bonus}
                color="#4CAF50"
              />
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                title="Deductions"
                value={salarySummary.deductions}
                color="#F44336"
              />
              <SummaryCard
                title="Net Salary"
                value={salarySummary.netSalary}
                color="#FF9800"
              />
            </View>

            <Text style={styles.historyTitle}>
              {t("Payroll History")}
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t("No payroll records found")}
          </Text>
        }
      />
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  dashboardTitle: {
    fontSize: wp(5),
    fontFamily: "Poppins_600SemiBold",
    marginBottom: hp(0.5),
    color: COLORS.black,
  },

  currentMonth: {
    fontSize: wp(3.5),
    color: COLORS.gray,
    marginBottom: hp(2),
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },

  card: {
    width: "48%",
    padding: wp(4),
    borderRadius: wp(3),
    elevation: 4,
  },

  cardValue: {
    fontSize: wp(5),
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },

  cardTitle: {
    fontSize: wp(3.2),
    color: "#fff",
    marginTop: hp(0.5),
  },

  historyTitle: {
    fontSize: wp(4.5),
    fontFamily: "Poppins_600SemiBold",
    marginVertical: hp(2),
    color: COLORS.black,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    elevation: 2,
  },

  month: {
    fontSize: wp(4),
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.black,
  },

  salaryText: {
    fontSize: wp(3.2),
    color: COLORS.gray,
    marginTop: hp(0.5),
  },

  statusBadge: {
    paddingVertical: hp(0.7),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
  },

  statusText: {
    fontSize: wp(3.2),
    fontFamily: "Poppins_600SemiBold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: hp(5),
    fontSize: wp(4),
    color: COLORS.gray,
  },
});
