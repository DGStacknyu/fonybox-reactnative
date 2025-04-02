import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const OAuthButton = ({
  title = "Login",
  icon,
  handlePress,
  isLoading,
  containerStyles,
  textStyles,
}: {
  title: string;
  icon?: any;
  handlePress: () => void;
  isLoading?: boolean;
  containerStyles?: string;
  textStyles?: string;
}) => {
  const buttonTitle = title.toLowerCase().includes("login with")
    ? title
    : `Login with ${title}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-white rounded-full py-4 px-5 my-2 ${
        isLoading ? "opacity-50" : ""
      } ${containerStyles || ""}`}
      disabled={isLoading}
    >
      <View className="flex-row items-center justify-center">
        <View className="absolute left-0">{icon}</View>
        <View className="w-full items-center justify-center">
          <Text
            className={`text-gray-700 text-lg font-pmedium ${textStyles || ""}`}
          >
            {buttonTitle}
          </Text>
        </View>

        {isLoading && (
          <View className="absolute right-0">
            <ActivityIndicator
              animating={isLoading}
              color="#bbb"
              size="small"
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default OAuthButton;
