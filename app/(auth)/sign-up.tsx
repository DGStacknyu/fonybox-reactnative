import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/AuthContext";
import { pb } from "@/components/pocketbaseClient";
import { Link, router } from "expo-router";
import { images } from "@/constants";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (form.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    try {
      setSubmitting(true);

      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.password,
      };

      const createdUser = await pb.collection("users").create(userData);
      console.log("User created successfully:", createdUser);

      try {
        const authData = await pb
          .collection("users")
          .authWithPassword(form.email, form.password);

        setUser(authData.record);
        setIsLogged(true);

        console.log("User authenticated:", authData);

        Alert.alert("Success", "Your account has been created successfully!", [
          { text: "OK", onPress: () => router.replace("/user-details") },
        ]);
      } catch (loginError) {
        console.error("Login failed after registration:", loginError);

        Alert.alert(
          "Account Created",
          "Your account has been created. Please sign in.",
          [{ text: "OK", onPress: () => router.replace("/sign-in") }]
        );
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error.data?.username?.code === "validation_not_unique") {
        Alert.alert(
          "Error",
          "This username is already taken. Please choose another one."
        );
      } else if (error.data?.email?.code === "validation_not_unique") {
        Alert.alert(
          "Error",
          "This email is already registered. Please use a different email."
        );
      } else {
        Alert.alert(
          "Registration Failed",
          error.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        <View className="relative">
          <ImageBackground
            source={images.signup}
            className="py-28 flex-col justify-center items-center bg-primary"
            resizeMode="contain"
          ></ImageBackground>
        </View>

        <View className="bg-white -mt-5 rounded-t-3xl px-6 pt-8 pb-12">
          <FormField
            title="Name"
            value={form.name}
            handleChangeText={(e: any) => setForm({ ...form, name: e })}
            otherStyles="mt-10"
            placeholder="Name"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your Email"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: any) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            placeholder="Enter your password"
            secureTextEntry
          />

          <CustomButton
            title="Register"
            handlePress={submit}
            containerStyles="mt-7 bg-primary"
            isLoading={isSubmitting}
            textStyles="text-white"
          />

          <Text
            style={{
              textAlign: "center",
              marginTop: 25,
              marginBottom: 25,
              color: "#666",
            }}
          >
            Continue with existing account?
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 10,
                padding: 18,
                width: "48%",
              }}
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                }}
                style={{ width: 28, height: 28, marginRight: 8 }}
              />
            </TouchableOpacity>

            {/* Facebook Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 10,
                padding: 18,
                width: "48%",
              }}
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/124/124010.png",
                }}
                style={{ width: 28, height: 28, marginRight: 8 }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#666" }}>Already have an account? </Text>
            <TouchableOpacity>
              <Link
                href="/sign-in"
                style={{ color: "#FF3B30", fontWeight: "500" }}
              >
                Log in
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
