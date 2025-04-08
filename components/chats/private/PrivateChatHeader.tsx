import React from "react";
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export const PrivateChatHeader = ({ chatDetails }: { chatDetails: any }) => {
  return (
    <View
      className="flex-row items-center px-5 py-2.5 border-b border-[#EEEEEE]"
      style={{
        paddingTop:
          Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 20 : 0,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#637381" />
      </TouchableOpacity>

      <View className="ml-4 flex-row items-center flex-1">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: chatDetails.user.color }}
        >
          <Text className="text-base">{chatDetails.user.initial}</Text>
        </View>

        <View className="ml-2.5">
          <Text className="text-lg font-medium">{chatDetails.user.name}</Text>
          <Text className="text-sm text-[#637381]">
            {chatDetails.user.status}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="ml-2"
        onPress={() => router.push(`/(chat)/info/${chatDetails.id}`)}
      >
        <Ionicons name="information-circle-outline" size={30} color="#637381" />
      </TouchableOpacity>
    </View>
  );
};
