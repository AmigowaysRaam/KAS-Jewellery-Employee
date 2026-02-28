import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from 'react-redux';
import { getStoredLanguage } from '../../app/i18ns';
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from '../../constants/ToastContext';
import CustomDateRangePickerModal from "./CustomDatePicker";
import { fetchData } from './api/Api';

const DateandDownloadTask = ({ onDateSelect, fromDate, toDate, taskFlag,
  taskLength
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const { showToast } = useToast();

  const { t } = useTranslation();
  const saveReportToDownloads = async (downloadUrl, fileName = "report.csv", message) => {
    try {
      if (!downloadUrl) {
        alert("❌ No download URL found");
        return;
      }
      setIsDownloading(true);
      // Step 1: Check if user has already picked a Downloads folder
      let directoryUri = await AsyncStorage.getItem('DOWNLOADS_URI');
      if (!directoryUri) {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          // alert("Permission denied");
          showToast(t('Permission Denied'), 'error');
          setIsDownloading(false);
          return;
        }
        directoryUri = permission.directoryUri;
        await AsyncStorage.setItem('DOWNLOADS_URI', directoryUri);
      }

      // Step 2: Create file in Downloads folder
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'text/csv'
      );

      // Step 3: Download the file to cache
      const downloadRes = await FileSystem.downloadAsync(
        downloadUrl,
        FileSystem.cacheDirectory + fileName
      );

      // Step 4: Read as base64
      const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 5: Write to SAF
      await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      showToast(message, 'success');
    } catch (err) {
      console.error("❌ Save Report Error:", err);
      showToast(message, 'er');
    } finally {
      setIsDownloading(false);
    }
  };
  const handleDownloadReport = async () => {
    if (!profileDetails?.id) return;
    const lang = await getStoredLanguage();
    try {
      setIsDownloading(true);
      const response = await fetchData(
        "app-employee-download-tasks",
        "POST",
        {
          user_id: profileDetails.id,
          lang_code: lang || 'en',
          assigned: taskFlag == 'assigned' ? '1' : "0",
          from: fromDate || "",
          to: toDate || "",
        }
      );
      console.log("API Response:", response);
      if (response?.success && response?.data?.download_link) {
        // Save file to Downloads
        const url = response.data.download_link;
        const fileName = url.split("/").pop();
        await saveReportToDownloads(url, fileName, response?.message);
      } else {
        Alert.alert("❌ Error", "No download link found or API failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      // Alert.alert("❌ API Error", error.message || "Something went wrong");
      showToast('X API Error', 'error')
    } finally {
      setIsDownloading(false);
    }
  };

  // ===============================
  // Handle date selection
  // ===============================
  const handleDateSelect = ({ from, to }) => {
    // Alert.alert('',JSON.stringify({ from, to }))
    onDateSelect && onDateSelect({ from, to });
  };

  const clearRange = () => {
    onDateSelect && onDateSelect({ from: null, to: null });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatRange = () => {
    if (!fromDate) return t('select_date_range');
    if (!toDate) return `From: ${formatDate(fromDate)} - ?`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Icon name="calendar-today" size={wp(4)} color="#fff" />
          <Text numberOfLines={1} style={[styles.buttonText]}>{formatRange()}</Text>
          {(fromDate || toDate) && (
            <Pressable onPress={clearRange} style={styles.clearIcon}>
              <Icon name="close" size={wp(6)} color="#fff" />
            </Pressable>
          )}
        </Pressable>
        <Pressable
          style={[styles.downloadBtn, isDownloading && { opacity: 1 }]}
          onPress={handleDownloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: wp(1) }}>
              <Icon name="save-alt" size={wp(5)} color="#27ae60" style={{
                padding: wp(0.7), backgroundColor: "#D1EDDD",
                borderRadius: wp(5)
              }} />
              <Text numberOfLines={1} style={[styles.buttonText]}>{`${t('download')}`}</Text>
            </View>
          )}
        </Pressable>
      </View>
      <CustomDateRangePickerModal
        restrictFeatureDate={true}
        disablePastDates={true}
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
    flex: 2,
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
    fontSize: wp(3.2),
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
