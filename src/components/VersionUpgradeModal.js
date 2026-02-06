import { MaterialIcons } from "@expo/vector-icons"; // Using Expo vector icons
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VersionCheck from "react-native-version-check";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";

export default function VersionUpgradeModal() {
  const [visible, setVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      const latest = await VersionCheck.getLatestVersion();
      const current = VersionCheck.getCurrentVersion();

      setCurrentVersion(current);
      setLatestVersion(latest);

      if (isUpdateAvailable(current, latest)) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch (error) {
      console.log("Version check failed:", error);
      setVisible(false);
    }
  };

  const isUpdateAvailable = (current, latest) => {
    const currentParts = current.split(".").map(Number);
    const latestParts = latest.split(".").map(Number);
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const curr = currentParts[i] || 0;
      const lat = latestParts[i] || 0;
      if (lat > curr) return true;
      if (lat < curr) return false;
    }
    return false;
  };
  const goToStore = () => {
    const url =
      Platform.OS === "android"
        ? `market://details?id=${VersionCheck.getPackageName()}`
        : `itms-apps://apps.apple.com/app/idYOUR_APP_ID`;
    Linking.openURL(url).catch((err) => console.error("Failed to open store:", err));
  };
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Icon */}
          <View style={styles.iconWrapper}>
            <MaterialIcons name="system-update-alt" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>
            {t("updateAvailable") || "New Version Available"}
          </Text>
          <View style={styles.versionWrapper}>
            <View style={styles.versionBox}>
              <Text style={styles.versionLabel}>{t("currentVersion") || "Current"}</Text>
              <Text style={styles.versionValue}>{currentVersion}</Text>
            </View>

            <View style={[styles.versionBox, { backgroundColor: `${COLORS.primary}20` }]}>
              <Text style={styles.versionLabel}>{t("latestVersion") || "Latest"}</Text>
              <Text style={[styles.versionValue, { color: COLORS.primary }]}>{latestVersion}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.updateBtn} onPress={goToStore}>
            <Text style={styles.updateText}>{t("updateNow") || "Update Now"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: wp(85),
    backgroundColor: COLORS.background,
    borderRadius: wp(4),
    paddingVertical: wp(6),
    paddingHorizontal: wp(5),
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  iconWrapper: {
    marginBottom: wp(4),
    backgroundColor: `${COLORS.primary}20`,
    padding: wp(3),
    borderRadius: wp(12),
  },
  title: {
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: wp(4),
  },
  versionWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: wp(5),
  },
  versionBox: {
    flex: 1,
    paddingVertical: wp(3),
    paddingHorizontal: wp(3),
    backgroundColor: `${COLORS.textSecondary}10`,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: wp(1),
  },
  versionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  versionValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: "Poppins_500Medium",
  },
  updateBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  updateText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});
