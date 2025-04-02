import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, TextInput, View } from "react-native";

// Search Bar Component
export const ChatListSearch = ({ onSearchChange }: any) => {
  return (
    <View className="px-5 py-3 bg-white mb-1">
      <View
        className="flex-row items-center bg-[#F5F5F5] shadow-inner rounded-full px-4"
        style={{ height: Platform.select({ ios: 44, android: 40 }) }}
      >
        <Ionicons name="search-outline" size={20} color="#637381" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-500"
          placeholder="Search voice chats..."
          placeholderTextColor="#9CA3AF"
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};
