import Loader from "@/components/Loader";
import AuthCustomButton from "@/components/oAuthCustomButton";
import { images } from "@/constants";
import { useGlobalContext } from "@/context/AuthContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const { loading, isLogged } = useGlobalContext();
  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <LinearGradient colors={["#F96262", "#F52936"]} style={{ flex: 1 }}>
      <SafeAreaView className="h-full">
        <Loader isLoading={loading} />

        <ScrollView
          contentContainerStyle={{
            marginTop: 220,
          }}
        >
          <View className="w-full flex justify-between items-center h-full px-4">
            <Image
              source={images.MainLogo}
              className="max-w-[380px] w-full h-[298px]"
              resizeMode="contain"
            />

            <View>
              <Text className="text-2xl text-white font-bold text-center mb-6">
                Select Option
              </Text>
              <AuthCustomButton
                title="Login with Google"
                icon={<Ionicons name="logo-google" size={24} color="#EA4335" />}
                handlePress={() => router.push("/sign-in")}
                containerStyles="w-full mb-3"
              />
              <AuthCustomButton
                title="Login with Facebook"
                icon={
                  <FontAwesome5 name="facebook-f" size={24} color="#1877F2" />
                }
                handlePress={() => router.push("/sign-in")}
                containerStyles="w-full mb-3"
              />
              <AuthCustomButton
                title="Login with Email"
                icon={<Ionicons name="mail" size={24} color="#" />}
                handlePress={() => router.push("/sign-in")}
                containerStyles="w-full mb-6"
              />

              <View className="flex flex-row justify-center items-center">
                <Text className="text-lg text-white font-pregular">
                  Don’t have any account?
                </Text>
                <Link
                  href="/sign-up"
                  className="text-lg font-psemibold text-white ml-2 underline"
                >
                  Sign Up
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
        <StatusBar backgroundColor="transparent" translucent style="light" />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomePage;
