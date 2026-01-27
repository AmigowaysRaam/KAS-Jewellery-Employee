import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
export default function ProfileScreen() {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // clear all stored data
      navigation.reset({
        index: 0,
        routes: [{ name: "MobileLogin" }], // replace with your login screen name
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/amigowayslogo.jpg")}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Name : KAS </Text>
          <Text style={styles.phone}>PHone:99999999</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  phone: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#ff0000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
