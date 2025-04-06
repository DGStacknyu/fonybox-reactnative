import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const ProfileTabs = ({ activeTab, setActiveTab }: any) => {
  return (
    <View className="mt-8">
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("posts")}
          className="flex-1"
        >
          <View className="items-center pb-2">
            <Text
              className={
                activeTab === "posts"
                  ? "text-red-500 font-medium"
                  : "text-gray-400 font-medium"
              }
            >
              Posts
            </Text>
          </View>
          <View
            className={
              activeTab === "posts"
                ? "border-b-2 border-red-500"
                : "border-b border-gray-200"
            }
          ></View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("saved")}
          className="flex-1"
        >
          <View className="items-center pb-2">
            <Text
              className={
                activeTab === "saved"
                  ? "text-red-500 font-medium"
                  : "text-gray-400 font-medium"
              }
            >
              Saved Posts
            </Text>
          </View>
          <View
            className={
              activeTab === "saved"
                ? "border-b-2 border-red-500"
                : "border-b border-gray-200"
            }
          ></View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileTabs;
