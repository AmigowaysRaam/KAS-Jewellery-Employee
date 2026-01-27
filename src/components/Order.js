import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import Products from "./Products";
import Header from "./Header";

export default function Order() {
  const [payment, setPayment] = useState("");
  const navigation = useNavigation();
   const route = useRoute();

   const products = route?.params?.products ?? [];


  const placeOrder = async () => {
    if (!payment) {
      Alert.alert("Select payment method");
      return;
    }

    const order = {
      id: Date.now(),products,
      paymentMethod: payment,
      status: "Order Placed",
      date: new Date().toLocaleString(),
    };

    const data = await AsyncStorage.getItem("orders");
    const orders = data ? JSON.parse(data) : [];

    orders.push(order);
    await AsyncStorage.setItem("orders", JSON.stringify(orders));
    console.log('Order successed',orders)

    Alert.alert("Success", "Order Placed Successfully");

    navigation.navigate("home");
    
  };

    
  return (
    <View style={{flex:1}}>
        <Header title='payment method' onBack={()=>navigation.goBack()}/>
    <View style={styles.container}>
      <Text style={styles.title}>Choose Payment</Text>

      <TouchableOpacity
        style={[
          styles.option,
          payment === "COD" && styles.active,
        ]}
        onPress={() => setPayment("COD")}
      >
        <Text>Cash on Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          payment === "UPI" && styles.active,
        ]}
        onPress={() => setPayment("UPI")}
      >
        <Text>UPI</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={placeOrder}>
        <Text style={{ color: "#fff" }}>Place Order</Text>
      </TouchableOpacity>

      
    </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  option: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  active: {
    backgroundColor: "#dbeafe",
  },
  button: {
    backgroundColor: "#1e90ff",
    padding: 15,
    marginTop: 20,
    alignItems: "center",
    borderRadius: 8,
  },
});