// import CustomButton from "@/components/CustomButton";
// import FormField from "@/components/FormField";
// import { pb } from "@/components/pocketbaseClient";
// import { images } from "@/constants";
// import { useGlobalContext } from "@/lib/AuthContext";
// import { Link, router } from "expo-router";
// import React, { useState } from "react";
// import { Alert, Image, ScrollView, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const SignIn = () => {
//   const { setUser, setIsLogged } = useGlobalContext();
//   const [isSubmitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });
//   const submit = async () => {
//     if (!form.email || !form.password) {
//       Alert.alert("Error", "Please enter both email and password");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       console.log("Attempting to log in...");
//       const authData = await pb
//         .collection("users")
//         .authWithPassword(form.email, form.password);
//       setUser(authData.record);
//       setIsLogged(true);

//       console.log("Login successful:", authData);

//       router.replace("/home");
//     } catch (error: any) {
//       console.error("Login failed:", error);

//       if (error.status === 400) {
//         Alert.alert("Login Failed", "Invalid email or password");
//       } else {
//         Alert.alert(
//           "Login Failed",
//           error.message || "Something went wrong. Please try again."
//         );
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <SafeAreaView className="bg-primary h-screen">
//       <ScrollView
//         contentContainerStyle={{
//           height: "100%",
//         }}
//       >
//         <View className="w-full flex justify-center h-full px-4 my-6">
//           <Image
//             source={images.logo}
//             resizeMode="contain"
//             className="w-[115px] h-[34px]"
//           />

//           <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
//             Log in to Aora
//           </Text>

//           <FormField
//             title="Email"
//             value={form.email}
//             handleChangeText={(e: any) => setForm({ ...form, email: e })}
//             otherStyles="mt-7"
//             keyboardType="email-address"
//             placeholder="Enter your Email"
//           />

//           <FormField
//             title="Password"
//             value={form.password}
//             handleChangeText={(e: any) => setForm({ ...form, password: e })}
//             otherStyles="mt-7"
//             placeholder="Enter your password"
//             secureTextEntry
//           />

//           <CustomButton
//             title="Sign In"
//             handlePress={submit}
//             containerStyles="mt-7"
//             isLoading={isSubmitting}
//           />

//           <View className="flex justify-center pt-5 flex-row gap-2">
//             <Text className="text-lg text-gray-100 font-pregular">
//               Don't have an account?
//             </Text>
//             <Link
//               href="/sign-up"
//               className="text-lg font-psemibold text-secondary"
//             >
//               Signup
//             </Link>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SignIn;

import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { pb } from "@/components/pocketbaseClient";
import { images } from "@/constants";
import { useGlobalContext } from "@/lib/AuthContext";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  // const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const submit = async () => {
    router.push("/user-details");
  };
  // const submit = async () => {
  //   if (!form.email || !form.password) {
  //     Alert.alert("Error", "Please enter both email and password");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);

  //     console.log("Attempting to log in...");
  //     const authData = await pb
  //       .collection("users")
  //       .authWithPassword(form.email, form.password);
  //     setUser(authData.record);
  //     setIsLogged(true);

  //     console.log("Login successful:", authData);

  //     router.replace("/home");
  //   } catch (error: any) {
  //     console.error("Login failed:", error);

  //     if (error.status === 400) {
  //       Alert.alert("Login Failed", "Invalid email or password");
  //     } else {
  //       Alert.alert(
  //         "Login Failed",
  //         error.message || "Something went wrong. Please try again."
  //       );
  //     }
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-red-500 pt-10 pb-64 relative">
          <Text className="text-white text-4xl mb-8 font-bold text-center">
            Log in
          </Text>

          <View className="absolute top-8 left-2">
            <Image
              source={images.paperplane}
              className="w-20 h-20 rotate-[-15deg]"
              resizeMode="contain"
            />
          </View>

          <View className="absolute bottom-16 left-10 w-12 h-12 bg-yellow-500 rounded-full items-center justify-center">
            <Image
              source={images.search}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>

          <View className="absolute top-16 right-10 w-10 h-10  rounded-lg items-center justify-center">
            <Image
              source={images.chat}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>

          <View className="absolute top-4 right-4 w-16 h-16 rounded-full border border-white border-opacity-10" />

          <View className="absolute -bottom-3  ml-16">
            <Image
              source={images.handphone}
              className="w-80 h-80"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="bg-white -mt-12 rounded-t-3xl px-6 pt-8 pb-12">
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
          <View className="items-end my-4">
            <Link
              href="/sign-up"
              className="text-base font-pmedium text-gray-500"
            >
              Forgot password?{" "}
            </Link>
          </View>
          <CustomButton
            title="Log in"
            handlePress={submit}
            containerStyles="mt-3 bg-[#F52936]"
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
            Login with existing account?
          </Text>
          <View className="flex-row justify-between mb-8">
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

              // className="w-[48%] py-3 border border-gray-200 rounded-md items-center justify-center"
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                }}
                style={{ width: 28, height: 28, marginRight: 8 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

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
              // className="w-[48%] py-3 border border-gray-200 rounded-md items-center justify-center"
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/124/124010.png",
                }}
                style={{ width: 28, height: 28, marginRight: 8 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/sign-up" className="text-primary">
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
