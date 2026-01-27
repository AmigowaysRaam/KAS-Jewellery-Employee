import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";


export default function Login() {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isSign, setIsSign] = useState(false)

  const handleAuth = async () => {

    if (!phone || !name) {
      Alert.alert("Name and Number was required")
      return
    }
    const profileData = {
      name,
      email,
      password,
      phone,
      address,
    }
    try {
      await AsyncStorage.setItem("isLoggedIn", "true")
      await AsyncStorage.setItem("hasAccount", "true")
      await AsyncStorage.setItem("profile", JSON.stringify(profileData));
      navigation.replace('home');
      console.log("profile saved", profileData)
    } catch (error) {
      console.log("Error to saveProfile", error)
    }
  }

  return (

    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {!isSign ? (


        <View style={[styles.container, { alignItems: "center" }]}>
          <Image source={require("../../assets/amigowayslogo.jpg")} style={[styles.logo, { height: 200 }, { width: 200 }]} />
          <Text style={styles.Editprofile}>Create Account</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
          />

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            keyboardType="password"
            textContentType="password"
            secureTextEntry={true}
          />

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phonenumber"
            keyboardType="number"
          />

          {/* <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter Your Address"
                   />
         */}
          <View style={{ alignItems: "center" }}>

            <TouchableOpacity style={[styles.button,]} onPress={handleAuth}>
              <Text style={styles.buttonText}>Login In </Text>
            </TouchableOpacity>
            <Text>You Already have a account ? </Text>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => setIsSign(true)}>
              <Text style={[styles.buttonText, { color: "gray" }]}>Sign up</Text>
            </TouchableOpacity>

          </View>
        </View>
      ) : (
        <View style={[styles.container, { alignItems: "center" },]}>
          <Image source={require("../../assets/amigowayslogo.jpg")} style={styles.logo} />
          <Text style={styles.Editprofile}>Log In </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter Phone"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            keyboardType="password"
            textContentType="password"
            secureTextEntry={true}
          />
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity style={[styles.button,]} onPress={handleAuth}>
              <Text style={styles.buttonText}>Sign In </Text>
            </TouchableOpacity>
            <Text>Don't have a account ? </Text>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => setIsSign(false)}>
              <Text style={[styles.buttonText, { color: "gray" }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-center",
    paddingTop: 10,
    marginHorizontal: 15,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 15,
    alignItems: "center",
    justifyContent: "center",

  },
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  Editprofile: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0fa8ceff",

    marginBottom: "40",
    top: 10
  },
  input: {
    marginTop: 20,
    width: "80%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderColor: "#ccc",
    marginBottom: 15
  },
  address: {
    alignItems: "stretch",
    marginBottom: "30",
    color: "#555"
  }

});

