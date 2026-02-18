// AttendanceRow.js

import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

/* -------------------- DETAIL ITEMS -------------------- */

const DETAIL_ITEMS = [
  {
    key: "login_time",
    label: "Log In Time",
    icon: require("../../assets/loginicon.png"),
    bgColor: "#008000",
    tColor: "#fff",
  },
  {
    key: "logout_time",
    label: "Log Out Time",
    icon: require("../../assets/logouticon.png"),
    bgColor: "#B81A19",
    tColor: "#fff",
  },
  {
    key: "morning_tea_break",
    label: "Morning Tea Break",
    icon: require("../../assets/morgnteaBreak.png.png"),
    bgColor: "#FE7E5B",
    tColor: "#fff",
  },
  {
    key: "lunch_break",
    label: "Lunch Break",
    icon: require("../../assets/lBreak.png"),
    bgColor: "#FF4433",
    tColor: "#fff",
  },
  {
    key: "evening_tea_break",
    label: "Evening Tea Break",
    icon: require("../../assets/eveningteaBreak.png"),
    bgColor: "#FF5A58",
    tColor: "#fff",
  },
  {
    key: "today_working_hour",
    label: "Today Working Hour",
    icon: require("../../assets/totalWork.png"),
    bgColor: "#A40033",
    tColor: "#fff",
  },
];

/* -------------------- COMPONENT -------------------- */

export default function AttendanceRow({
  item,
  expandedItem,
  setExpandedItem,
  onRowPress,
}) {
  const isExpanded = expandedItem === item.date;

  /* ---------- Weekend Detection ---------- */
  const dateObj = new Date(item.date);
  const dayIndex = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  /* ---------- Date Formatters ---------- */
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDay = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
    });
  };

  /* ---------- Row Press ---------- */
  const handlePress = () => {
    if (isWeekend) return;

    setExpandedItem(isExpanded ? null : item.date);

    if (onRowPress) {
      onRowPress(item.date);
    }
  };

  /* ---------- Status Color ---------- */
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

  const rowOpacity = isWeekend
    ? 0.5
    : expandedItem && !isExpanded
    ? 0.4
    : 1;

  /* -------------------- UI -------------------- */

  return (
    <View
      style={{
        marginHorizontal: wp(2),
        marginTop: wp(2),
        opacity: rowOpacity,
        transform: [{ scale: isExpanded ? 1.03 : 1 }],
      }}
    >
      <View
        style={{
          borderBottomWidth: isExpanded ? 0 : wp(0.3),
          borderBottomColor: "#ccc",
          borderRadius: isExpanded ? wp(2) : 0,
          overflow: "hidden",
        }}
      >
        <Pressable
          onPress={handlePress}
          disabled={isWeekend}
          style={{
            flexDirection: "row",
            paddingVertical: hp(1.5),
            backgroundColor: isWeekend
              ? "#FFE4DE"
              : isExpanded
              ? "#FFE4DE"
              : "#FFF",
            borderWidth: isExpanded ? wp(0.5) : 0,
            borderColor: COLORS.primary,
            borderRadius: isExpanded ? wp(2) : 0,
          }}
        >
          <Text style={styles.cell}>{formatDate(item.date)}</Text>
          <Text style={styles.cell}>{formatDay(item.date)}</Text>
          <Text style={styles.cell}>
            {isWeekend ? "-" : item.login}
          </Text>
          <Text style={styles.cell}>
            {isWeekend ? "-" : item.logout}
          </Text>
          <Text
            style={[
              styles.cell,
              {
                color: isWeekend
                  ? "#999"
                  : getStatusColor(item.status),
                  fontSize:isWeekend ? wp():wp(3.5)
              },
            ]}
          >
            {isWeekend ? "Weekend" : item.status}
          </Text>
        </Pressable>
      </View>

      {/* -------- Expanded Section -------- */}
      {isExpanded && !isWeekend && (
        <View style={styles.expandedContainer}>
          <View style={styles.gridContainer}>
            {DETAIL_ITEMS.map((detail) => (
              <View
                key={detail.key}
                style={[
                  styles.detailRow,
                  { backgroundColor: detail.bgColor },
                ]}
              >
                <Image
                  source={detail.icon}
                  style={styles.icon}
                />
                <View>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: detail.tColor },
                    ]}
                  >
                    {detail.label}
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: detail.tColor },
                    ]}
                  >
                    {item?.details?.[detail.key] ?? "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: wp(3.5),
    color: COLORS.black,
    fontFamily: "Poppins_400Regular",
  },

  expandedContainer: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    backgroundColor: "#F9F9F9",
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(1),
  },

  detailRow: {
    width: "49%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(0.5),
    borderRadius: wp(2),
    borderWidth: wp(0.4),
    borderColor: "#c9c9c9",
  },

  icon: {
    width: wp(8),
    height: wp(8),
    marginRight: wp(2),
  },

  detailLabel: {
    fontSize: wp(3),
    fontFamily: "Poppins_400Regular",
  },

  detailValue: {
    fontSize: wp(3.5),
    fontFamily: "Poppins_600SemiBold",
  },
});
