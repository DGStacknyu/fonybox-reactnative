import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export const ChatListHeader = ({ title, showAddButton = false }: any) => {
  const handleAddNewGroup = () => {
    router.push("/(GroupChat)/create-group");
  };

  return (
    <View
      className="px-5 pt-3 mt-3 pb-0 bg-white"
      style={{ paddingTop: Platform.select({ ios: 0, android: 50 }) }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()} className="z-10">
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>

        <Text className="text-xl font-medium text-primary">{title}</Text>

        {showAddButton ? (
          <TouchableOpacity onPress={handleAddNewGroup} className="z-10">
            <Ionicons name="add-circle-outline" size={28} color="#637381" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
    </View>
  );
};
