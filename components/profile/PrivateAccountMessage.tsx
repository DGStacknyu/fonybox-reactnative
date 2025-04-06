import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const PrivateAccountMessage = () => {
  return (
    <View className="mt-12 items-center">
      <FontAwesome name="lock" size={40} color="#ccc" />
      <Text className="text-gray-500 mt-4 text-center px-6 text-base">
        This account is private. Follow this user to see their posts.
      </Text>
    </View>
  );
};

export default PrivateAccountMessage;
