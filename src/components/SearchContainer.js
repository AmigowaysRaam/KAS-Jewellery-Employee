import React, { useEffect, useState } from "react";
import {
  Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const STATUS_LIST = ["In Progress", "Completed", "Pending", "Not Started"];
const SearchContainer = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onStatusSelect,
  modalVisible // <- just a boolean prop
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  // Handle selecting a status
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowDropdown(false);
    onStatusSelect && onStatusSelect(status);
  };
  const clearStatus = () => {
    setSelectedStatus(null);
    onStatusSelect && onStatusSelect(null);
  };
  useEffect(() => {
    if (modalVisible) {
      setShowDropdown(false);
    }
  }, [modalVisible]);
  const closeDropdown = () => setShowDropdown(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Search Icon */}
        <Icon name="search" size={wp(6)} color={COLORS.primary} style={styles.icon} />

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.primary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />

        <Pressable
          style={styles.equalizerButton}
          onPress={() => setShowDropdown(prev => !prev)}
        >
          <Icon name="tune" size={wp(6)} color={COLORS.primary} />
        </Pressable>
      </View>
      {/* Selected status pill */}
      {selectedStatus && (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{selectedStatus}</Text>
          <Pressable onPress={clearStatus} style={styles.pillCloseButton}>
            <Icon name="close" size={wp(3.5)} color="#fff" />
          </Pressable>
        </View>
      )}
      {showDropdown && (
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.dropdownOverlay}>
            {/* Stop propagation inside dropdown */}
            <Pressable style={styles.dropdown} onPress={() => { }}>
              {/* Close button */}
              <Pressable style={styles.dropdownCloseButton} onPress={closeDropdown}>
                <Icon name="close" size={wp(5)} color="#fff" />
              </Pressable>
              {STATUS_LIST.map((status, index) => (
                <Pressable
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleStatusSelect(status)}
                >
                  <Text style={styles.dropdownText}>{status}</Text>
                </Pressable>
              ))}
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};
export default SearchContainer;
const styles = StyleSheet.create({
  wrapper: {
    width: wp(93), alignSelf: "center",
    marginVertical: hp(1),
    zIndex: 1000,
  },
  card: {
    width: "100%",
    height: hp(5.5), flexDirection: "row",
    alignItems: "center", backgroundColor: COLORS.ashGrey, borderRadius: wp(3),
    paddingHorizontal: wp(3),
  }, icon: { marginRight: wp(2) },
  input: {
    flex: 1,
    fontSize: wp(4), fontFamily: "Poppins_400Regular", color: COLORS.primary,
  }, equalizerButton: {
    marginLeft: wp(2),
    padding: wp(1), justifyContent: "center", alignItems: "center",
  },
  statusPill: {
    flexDirection: "row", alignSelf: "flex-start",
    marginTop: hp(1), backgroundColor: COLORS.primary,
    borderRadius: wp(5), paddingVertical: hp(0.5), paddingHorizontal: wp(3), alignItems: "center", borderRadius: wp(4),
  }, statusPillText: {
    color: "#fff", fontFamily: "Poppins_500Medium",
    fontSize: wp(3.5), marginRight: wp(2),
  },
  pillCloseButton: {
    backgroundColor: "#c0392b",
    borderRadius: wp(3), padding: wp(0.5),
  },
  dropdownOverlay: {
    position: "absolute",
    top: hp(5.5) + hp(1), left: 0,
    right: 0, bottom: 0, zIndex: 1000,
    backgroundColor: "transparent",
  },
  dropdown: {
    backgroundColor: "#F0F0F0", borderRadius: wp(2),
    marginHorizontal: wp(2), maxWidth: wp(40),
    alignSelf: "flex-end",
    borderColor: COLORS.primary, borderWidth: wp(0.5),
    paddingVertical: hp(0.5), zIndex: 1001,
    height: hp(23),
  }, dropdownCloseButton: {
    position: "absolute",
    top: -hp(3),
    right: -wp(2), backgroundColor: COLORS.primary,
    borderRadius: wp(4), padding: wp(1.5),
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
  },
  dropdownText: {
    fontSize: wp(4), fontFamily: "Poppins_400Regular",
    color: "#333",
  },
});
