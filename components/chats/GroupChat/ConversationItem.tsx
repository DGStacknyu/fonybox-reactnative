import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export const ConversationItem = ({ conversation, onPress }: any) => {
  // Check if this is a group chat with a sender name
  const isGroupWithSender =
    conversation.isGroup && conversation.lastMessage.sender;

  return (
    <>
      <View>
        <TouchableOpacity
          className="flex-row items-center px-5 py-3 bg-white"
          onPress={() => onPress(conversation)}
        >
          <View className="relative">
            {conversation.user.avatar ? (
              <Image
                source={{ uri: conversation.user.avatar }}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: conversation.user.color }}
              >
                <Text className="text-lg text-gray-700">
                  {conversation.user.initial}
                </Text>
              </View>
            )}

            {/* Show online status indicator for individual chats */}
            {!conversation.isGroup && conversation.user.status === "Online" && (
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></View>
            )}
          </View>

          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text
                className={`font-semibold text-lg ${
                  conversation.unread ? "text-black" : "text-gray-700"
                }`}
              >
                {conversation.user.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {conversation.lastMessage.timestamp}
              </Text>
            </View>

            {/* Second row with message info and member count */}
            <View className="flex-row items-center justify-between mt-0.5">
              <View className="flex-row items-center flex-1">
                <Ionicons name="mic" size={16} color="#637381" />
                <Text
                  className={`text-base ml-1 ${
                    conversation.unread
                      ? "text-gray-700 font-medium"
                      : "text-gray-500"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {isGroupWithSender
                    ? `${conversation.lastMessage.sender}: Voice (${conversation.lastMessage.duration})`
                    : `Voice message (${conversation.lastMessage.duration})`}
                </Text>

                {/* Message count badge */}
                {conversation.unread && (
                  <View className="ml-2 bg-[#F52936] px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-medium">
                      {conversation.messageCount}
                    </Text>
                  </View>
                )}
              </View>

              {/* Display member count for group chats */}
              {conversation.isGroup && (
                <Text className="text-xs text-gray-500">
                  {conversation.user.status}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View className="h-px bg-gray-100 my-1.5" />
      </View>
    </>
  );
};
