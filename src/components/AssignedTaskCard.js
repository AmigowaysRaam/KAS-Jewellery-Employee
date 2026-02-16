import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image, Pressable,
  StyleSheet, Text, View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ViewButton from "./ViewBtn";

const AssignedTaskCard = ({
  item, t, navigation,
  openTaskModal, getStatusColor, }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isCritical =
    item?.priority?.toLowerCase() === "critical";
  const taskCompStatus = item?.status?.toLowerCase() !== 'completed';
  useEffect(() => {
    if (isCritical) {
      Animated.spring(scaleAnim, {
        toValue: 1.06,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [isCritical]);
  const getProgressData = (status) => {
    switch (status?.toLowerCase()) {
        case "open":
            return { progress: 0.25, color: "#3498db" }; // Blue
        case "inprogress":
            return { progress: 0.6, color: "#f39c12" }; // Orange
        case "waiting for qc":
            return { progress: 0.85, color: "#9b59b6" }; // Purple
        case "rework":
            return { progress: 0.5, color: "#e74c3c" }; // Red
        case "completed":
            return { progress: 1, color: "#2ecc71" }; // Green
        case "overdue":
            return { progress: 0, color: "#D32F2F" }; // Deep Red for Overdue
        default:
            return { progress: 0.1, color: COLORS.primary };
    }
};

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const { progress } = getProgressData(item.status);

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [item.status]);
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: "#eee" }}
        onPress={() => openTaskModal(item)}
        style={[
          styles.card,
          {
            borderRightColor: getStatusColor(item.status),
          },
          isCritical && styles.criticalShadow,
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.taskTitle}>
            {item.title || t("Untitled Task")}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(
                  item.status
                ),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Assigned */}
        <View style={styles.assignedRow}>
          <Image
            source={{
              uri:
                item?.assigned_to_photo ||
                "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.assignedText}>
              {item?.assigned_to_name}
            </Text>

            <Text style={styles.phoneText}>
              {item?.assigned_by_employee_phone_number ||
                "-"}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t('progress')}</Text>
            <Text style={styles.progressPercent}>
              {Math.round(getProgressData(item.status).progress * 100)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: getProgressData(item.status).color,
                },
              ]}
            />
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              {t("assigned_date")}
            </Text>
            <Text numberOfLines={1} style={styles.dateText}>
              {item.assigned_date?.split(" ")[0]}
            </Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              {t("due_date")}
            </Text>
            <Text numberOfLines={1} style={styles.dateText}>
              {item.due_date?.split(" ")[0]}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: hp(0.5) }}>
          <ViewButton
            status={taskCompStatus}
            priority={item.priority}
            onPress={() =>
              navigation?.navigate("TasKDetailById", {
                task: item,
              })
            }
            label={t("View")}
          />
        </View>
        {/* Progress Bar */}


      </Pressable>

    </Animated.View>
  );
};

export default React.memo(AssignedTaskCard);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(4),
    marginBottom: hp(3),
  },
  progressWrapper: {
    marginTop: hp(1.5),
    marginBottom: hp(1.2),
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.6),
  },
  progressLabel: {
    fontSize: wp(3.2),
    fontFamily: "Poppins_500Medium",
    color: "#666",textTransform: "capitalize"
  },
  progressPercent: {
    fontSize: wp(3.2),
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  progressTrack: {
    height: hp(1.6),
    width: "100%",
    backgroundColor: "#edf0f5",
    borderRadius: wp(3),
    overflow: "hidden",
  },
  
  progressFill: {
    height: "100%",
    borderRadius: wp(3),
  },
  

  card: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(3),
    borderRightWidth: wp(1.2),
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },

  /* 🔥 Extra glow for critical */
  criticalShadow: {
    elevation: 10,
    shadowColor: "#ff3b30",
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  taskTitle: {
    fontSize: wp(4.2),
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
    color: "#1e1e1e",
    marginRight: wp(2),
  },

  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(5),
    minWidth: wp(18),
    alignItems: "center",
  },

  statusText: {
    color: "#fff",
    fontSize: wp(3),
    fontFamily: "Poppins_500Medium",
  },

  assignedRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: hp(1.2),
  },

  avatar: {
    width: wp(10), height: wp(10),
    borderRadius: wp(5), marginRight: wp(2),
    backgroundColor: "#ccc", borderColor: COLORS?.primary, borderWidth: wp(0.4)
  },
  assignedText: {
    fontSize: wp(3.2),
    color: "#555", fontFamily: "Poppins_400Regular",
  },
  phoneText: {
    fontSize: wp(2.9),
    color: "#777", marginTop: hp(0.3),
  }, divider: {
    height: 1, backgroundColor: "#f0f0f0",
    marginVertical: hp(1.5),
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateBox: {
    backgroundColor: "#f8f9fb",
    padding: wp(2), borderRadius: wp(2),
    flex: 1,
    marginRight: wp(2), borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateLabel: {
    fontSize: wp(3),
    color: "#777", marginBottom: hp(0.5), fontFamily: "Poppins_400Regular", alignSelf: "center"
  }, dateText: {
    fontSize: wp(4.5),
    color: "#333", fontFamily: "Poppins_700Bold", alignSelf: "center", lineHeight: wp(5.8)
  },
});