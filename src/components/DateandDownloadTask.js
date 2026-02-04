import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CustomDateRangePickerModal from "./CustomDatePicker";

const DateandDownloadTask = ({ onDateSelect, onDownload }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // Handle date range selection from modal
  const handleDateSelect = ({ from, to }) => {
    setFromDate(from);
    setToDate(to);
    onDateSelect && onDateSelect({ from, to });
  };
  const { t } = useTranslation()
  const clearRange = () => {
    setFromDate(null);
    setToDate(null);
    onDateSelect && onDateSelect({ from: null, to: null });
  };
  // Format date range for display
  const formatRange = () => {
    if (!fromDate) return t('select_date_range');
    if (!toDate) return `From: ${new Date(fromDate).toLocaleDateString()} - ?`;
    return `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`;
  };

  return (
    <View style={styles.wrapper}>
      {/* Top Row: Date Selector (75%) + Download (25%) */}
      <View style={styles.card}>
        <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Icon name="calendar-today" size={wp(5)} color="#fff" />
          <Text style={styles.buttonText}>{formatRange()}</Text>
          {(fromDate || toDate) && (
            <Pressable onPress={clearRange} style={styles.clearIcon}>
              <Icon name="close" size={wp(6)} color="#fff" />
            </Pressable>
          )}
        </Pressable>
        <Pressable style={styles.downloadBtn} onPress={onDownload}>
          <Icon name="download" size={wp(7)} color="#fff" />
        </Pressable>
      </View>
      <CustomDateRangePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handleDateSelect}
        initialFrom={fromDate}
        initialTo={toDate}
        title={`${t('select_date_range')}`}
      />
    </View>
  );
};

export default DateandDownloadTask;

const styles = StyleSheet.create({
  wrapper: {
    width: wp(93),
    alignSelf: "center",
    marginBottom: hp(2),
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateButton: {
    flex: 2, // 75% width
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.1),
    borderRadius: wp(1),
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: wp(2),
    paddingHorizontal: wp(3),
    position: "relative",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    marginLeft: wp(2),
    flex: 1,
    lineHeight: hp(2.5),
  },
  clearIcon: {
    position: "absolute",
    right: wp(2),
    padding: wp(1),
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#27ae60",
    paddingVertical: hp(1),
    borderRadius: wp(1),
    alignItems: "center",
    justifyContent: "center",
  },
});
