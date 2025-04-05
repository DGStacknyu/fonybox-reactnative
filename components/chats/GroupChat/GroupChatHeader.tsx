import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export const GroupChatHeader = ({ groupDetails }: any) => {
  const handleGroupInfoPress = () => {
    router.push(`/(GroupChat)/info/${groupDetails.id}`);
  };

  return (
    <View
      className="flex-row items-center px-5 py-2.5 border-b border-[#EEEEEE]"
      style={{
        paddingTop:
          Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 10,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#637381" />
      </TouchableOpacity>

      <TouchableOpacity
        className="ml-4 flex-row items-center flex-1"
        onPress={handleGroupInfoPress}
      >
        <Image
          source={{ uri: groupDetails.avatar }}
          className="w-14 h-14 rounded-full"
        />
        <View className="ml-2.5">
          <Text className="text-lg font-medium">{groupDetails.name}</Text>
          <Text className="text-sm text-[#637381]">
            {groupDetails.memberCount} members
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity className="ml-2" onPress={handleGroupInfoPress}>
        <Ionicons name="information-circle-outline" size={30} color="#637381" />
      </TouchableOpacity>
    </View>
  );
};
