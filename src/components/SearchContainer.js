import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const SearchContainer = ({ value, onChangeText,
  placeholder = "Search...", onStatusSelect, modalVisible,
  selectedStatuss, clearSearch, }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(selectedStatuss);
  const [filterList, setFilterList] = useState([]);

  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const { t } = useTranslation();
  // Map status to color and icon
  const getStatusStyle = (status) => {
    switch (status) {
      case "Open":
        return {
          color: "#3498db", // Blue
          icon: <Icon name="folder-open" size={hp(3)} color="#000" />,
        };
      case "Inprogress":
        return {
          color: "#f39c12", // Orange
          icon: <Icon name="autorenew" size={hp(3)} color="#000" />,
        };
      case "Waiting for QC":
        return {
          color: "#9b59b6", // Purple
          icon: <Icon name="hourglass-empty" size={hp(3)} color="#000" />,
        };
      case "Completed":
        return {
          color: "#2ecc71", // Green
          icon: <Icon name="check-circle" size={hp(3)} color="#000" />,
        };
        case "Rework":
          return {
            color: "#2ecc71", // Green
            icon: <Icon name="build" size={hp(3)} color="#000" />,
          };
          case "Over Due":
            return {
              color: "#ff0000", // Green
              icon: <Icon name="warning" size={hp(3)} color="#000" />,
            };
      default:
        return {
          color: COLORS.primary,
          icon: <Icon name="help-outline" size={hp(3)} color={COLORS.primary} />,
        };
    }
  };
  useEffect(() => {
    if (selectedStatuss) {
      setSelectedStatus(selectedStatuss);
    }
    setFilterList(siteDetails?.ticketstatusList?.map((i) => i.label) || []);
    if (modalVisible) {
      setShowDropdown(false);
    }
  }, [modalVisible, selectedStatuss]);
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowDropdown(false);
    onStatusSelect?.(status);
  };

  const clearStatus = () => {
    setSelectedStatus(null);
    onStatusSelect?.(null);
  };

  return (
    <View style={styles.wrapper}>
      {/* Search Bar */}
      <View style={styles.card}>
        <Icon
          name="search"
          size={wp(6)}
          color={COLORS.primary}
          style={styles.icon}
        />

        <TextInput
          maxLength={20}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.primary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />

        {value !== "" && (
          <Pressable onPress={clearSearch}>
            <Icon
              name="close"
              size={wp(6)}
              color={COLORS.primary}
              style={styles.icon}
            />
          </Pressable>
        )}

        <Pressable
          style={styles.equalizerButton}
          onPress={() => setShowDropdown(true)}
        >
          <Icon name="tune" size={wp(6)} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Selected Status Pill */}
      {selectedStatus && (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{selectedStatus}</Text>
          <Pressable onPress={clearStatus} style={styles.pillCloseButton}>
            <Icon name="close" size={wp(3.5)} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Status Dropdown Modal */}
      <Modal
        transparent
        visible={showDropdown}
        animationType="none"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginHorizontal: hp(2),
                    marginBottom: hp(2),
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      { fontFamily: "Poppins_600SemiBold", fontSize: wp(4.2) },
                    ]}
                  >
                    {t("filter_by_status") || "Filter by Status"}
                  </Text>
                  <Pressable
                    style={styles.modalCloseButton}
                    onPress={() => setShowDropdown(false)}
                  >
                    <Icon name="close" size={wp(5)} color="#fff" />
                  </Pressable>
                </View>

                {/* Status Options */}
                {filterList.map((status, index) => {
                  const { icon, color } = getStatusStyle(status);
                  return (
                    <Pressable
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => handleStatusSelect(status)}
                    >
                      <View style={styles.statusRow}>
                        {icon}
                        <Text style={[styles.dropdownText, { marginLeft: wp(3) }]}>
                          {status}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default SearchContainer;

const styles = StyleSheet.create({
  wrapper: {
    width: wp(93),
    alignSelf: "center",
    marginVertical: hp(1),
    zIndex: 1,
  },
  card: {
    height: hp(5.5),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ashGrey,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3),
  },
  icon: { marginRight: wp(2) },
  input: {
    flex: 1,
    fontSize: wp(4),
    fontFamily: "Poppins_400Regular",
    color: COLORS.primary,
  },
  equalizerButton: { marginLeft: wp(2), padding: wp(1) },
  statusPill: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginTop: hp(1),
    backgroundColor: COLORS.primary,
    borderRadius: wp(4),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    alignItems: "center",
  },
  statusPillText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: wp(3.5),
    marginRight: wp(2),
  },
  pillCloseButton: {
    backgroundColor: "#c0392b",
    borderRadius: wp(3),
    padding: wp(0.5),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // Push bottom sheet to bottom
    paddingBottom: hp(4),       // Add safe padding at bottom
    zIndex: 9999,
  },
  bottomSheet: {
    height: hp(50),
    backgroundColor: "#F0F0F0",
    paddingTop: hp(3),
    paddingBottom: hp(2),
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    borderWidth: wp(0.4),
    borderColor: COLORS.primary,
    zIndex: 9999,
    // position: "absolute", bottom: hp(4), left: 0, right: 0,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(4),
    padding: wp(1.5),
    zIndex: 9999,
  },
  dropdownItem: {
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(5),
  },
  dropdownText: {
    fontSize: wp(4.9),
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
