import { images } from "@/constants";
import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700;

const OnboardingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-red-500 relative">
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "dark-content"}
      />

      <View className="absolute top-0 left-0 w-40 h-40 bg-red-400 rounded-full opacity-40" />
      <View className="absolute bottom-36 right-0 w-40 h-40 bg-red-400 rounded-full opacity-30" />

      <View
        className="flex-row items-center justify-between px-6"
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight ?? 0) + 10
              : 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white font-medium text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 px-5"
          style={{
            justifyContent: "space-between",
            minHeight:
              height -
              (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) -
              100,
          }}
        >
          <View className="mt-5 items-end" style={{ zIndex: 2 }}>
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                width: isSmallDevice ? "85%" : "80%",
                paddingHorizontal: isSmallDevice ? 16 : 24,
                paddingVertical: isSmallDevice ? 12 : 20,
              }}
            >
              <Text
                className="text-center text-rose-400 font-semibold"
                style={{
                  fontSize: isSmallDevice ? 16 : 20,
                  lineHeight: isSmallDevice ? 22 : 28,
                }}
              >
                I have many questions in my hand but I don't know whom to ask to
                get knowledge
              </Text>
            </View>
          </View>

          <View
            className="items-center"
            style={{
              position: "absolute",
              top: isSmallDevice ? 100 : 140,
              left: 0,
              width: width,
              zIndex: 10,
            }}
          >
            <Image
              source={images.women}
              style={{
                width: isSmallDevice ? width * 0.6 : width * 0.7,
                height: isSmallDevice ? width * 0.6 : width * 0.7,
                right: isSmallDevice ? -30 : -20,
                left: isSmallDevice ? 0 : -60,
                bottom: isSmallDevice ? -20 : -30,
                top: isSmallDevice ? 0 : -50,
              }}
              resizeMode="contain"
            />
          </View>

          <View style={{ height: isSmallDevice ? width * 0.6 : width * 0.7 }} />

          <View className="mb-4" style={{ zIndex: 3 }}>
            <View
              className="bg-white rounded-3xl relative"
              style={{
                paddingHorizontal: isSmallDevice ? 16 : 24,
                paddingVertical: isSmallDevice ? 12 : 20,
                paddingBottom: isSmallDevice ? 50 : 60,
                marginBottom: isSmallDevice ? 40 : 50,
              }}
            >
              <Text
                className="text-rose-400 font-semibold"
                style={{
                  fontSize: isSmallDevice ? 16 : 20,
                  lineHeight: isSmallDevice ? 24 : 30,
                  paddingRight: isSmallDevice ? 40 : 60,
                }}
              >
                You can ask question to anyone who is expert in particular field
                through voice locally & nationally by using "FonyBox"
              </Text>
              <Image
                source={images.record}
                style={{
                  position: "absolute",
                  right: isSmallDevice ? -30 : -20,
                  bottom: isSmallDevice ? -20 : -30,
                  width: isSmallDevice ? width * 0.4 : width * 0.5,
                  height: isSmallDevice ? width * 0.4 : width * 0.5,
                  top: isSmallDevice ? 0 : 100,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="items-start mb-8">
            <TouchableOpacity
              className="bg-white rounded-full shadow"
              style={{
                paddingHorizontal: 30,
                paddingVertical: 12,
              }}
              onPress={() => router.navigate("/home")}
            >
              <Text
                className="text-rose-300 font-medium"
                style={{ fontSize: isSmallDevice ? 14 : 16 }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
