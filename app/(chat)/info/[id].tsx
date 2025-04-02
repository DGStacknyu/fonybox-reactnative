// (Chat)/info/[id].tsx

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  Image,
} from "react-native";

// Sample conversations data (similar to what's used in chat screens)
const SAMPLE_CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Hossein Azarbad",
      avatar: null,
      initial: "H",
      color: "#F0D3F7",
      hasStory: true,
      status: "Online",
      phone: "+1 (555) 123-4567",
      email: "hossein.a@example.com",
      joinedDate: "January 2023",
    },
    sharedMedia: [
      { id: "m1", type: "voice", duration: "0:15", timestamp: "Jan 15, 2025" },
      { id: "m2", type: "voice", duration: "0:23", timestamp: "Jan 16, 2025" },
      { id: "m3", type: "voice", duration: "0:12", timestamp: "Jan 18, 2025" },
      { id: "m4", type: "voice", duration: "0:42", timestamp: "Jan 22, 2025" },
      { id: "m5", type: "voice", duration: "0:28", timestamp: "Jan 25, 2025" },
    ],
  },
  {
    id: "2",
    user: {
      name: "Marvin McKinney",
      avatar: null,
      initial: "M",
      color: "#EEEEEE",
      hasStory: false,
      status: "Online",
      phone: "+1 (555) 987-6543",
      email: "marvin.m@example.com",
      joinedDate: "March 2023",
    },
    sharedMedia: [
      { id: "m1", type: "voice", duration: "0:08", timestamp: "Feb 10, 2025" },
      { id: "m2", type: "voice", duration: "0:19", timestamp: "Feb 11, 2025" },
      { id: "m3", type: "voice", duration: "0:31", timestamp: "Feb 15, 2025" },
    ],
  },
  {
    id: "3",
    user: {
      name: "Sarah Johnson",
      avatar: null,
      initial: "S",
      color: "#E3F5FF",
      hasStory: true,
      status: "Last seen 2h ago",
      phone: "+1 (555) 234-5678",
      email: "sarah.j@example.com",
      joinedDate: "November 2022",
    },
    sharedMedia: [
      { id: "m1", type: "voice", duration: "1:05", timestamp: "Mar 3, 2025" },
      { id: "m2", type: "voice", duration: "0:47", timestamp: "Mar 4, 2025" },
    ],
  },
  // Additional conversations would be here
];

const SingleChatInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [conversation, setConversation] = useState(
    SAMPLE_CONVERSATIONS.find((convo) => convo.id === id)
  );
  const [notifications, setNotifications] = useState(true);
  const [muteChat, setMuteChat] = useState(false);

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Chat not found</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#F52936] rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBlockUser = () => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${conversation.user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            // In a real app, you would block the user via your backend
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // In a real app, you would clear the chat history
            Alert.alert("Success", "Chat history cleared");
            router.back();
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    Alert.alert(
      "Report User",
      "Please select a reason for reporting this user",
      [
        {
          text: "Spam",
          onPress: () =>
            Alert.alert("Report Submitted", "Thank you for your report."),
        },
        {
          text: "Inappropriate Content",
          onPress: () =>
            Alert.alert("Report Submitted", "Thank you for your report."),
        },
        {
          text: "Harassment",
          onPress: () =>
            Alert.alert("Report Submitted", "Thank you for your report."),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#EEEEEE]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>
        <Text className="text-lg font-medium">Contact Info</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        <View className="items-center mt-6 px-5">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: conversation.user.color }}
          >
            <Text className="text-3xl">{conversation.user.initial}</Text>
          </View>
          <Text className="text-xl font-semibold mb-2">
            {conversation.user.name}
          </Text>
          <Text className="text-base text-gray-600">
            {conversation.user.status}
          </Text>
        </View>

        {/* Action Buttons */}
        {/* <View className="flex-row justify-center mt-6 mb-4">
          <TouchableOpacity className="items-center mx-4">
            <View className="w-12 h-12 rounded-full bg-[#F5F5F5] items-center justify-center mb-1">
              <Ionicons name="call-outline" size={22} color="#637381" />
            </View>
            <Text className="text-xs text-gray-600">Call</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mx-4">
            <View className="w-12 h-12 rounded-full bg-[#F5F5F5] items-center justify-center mb-1">
              <Ionicons name="videocam-outline" size={22} color="#637381" />
            </View>
            <Text className="text-xs text-gray-600">Video</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mx-4">
            <View className="w-12 h-12 rounded-full bg-[#F5F5F5] items-center justify-center mb-1">
              <Ionicons name="search-outline" size={22} color="#637381" />
            </View>
            <Text className="text-xs text-gray-600">Search</Text>
          </TouchableOpacity>
        </View> */}

        {/* Contact Info */}
        <View className="mt-4 ">
          <Text className="text-lg font-medium mb-3 px-5">Contact Info</Text>
          <View className="bg-gray-50 rounded-lg px-1.5">
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="call-outline" size={20} color="#637381" />
              <View className="ml-3">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-base">{conversation.user.phone}</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4">
              <Ionicons name="mail-outline" size={20} color="#637381" />
              <View className="ml-3">
                <Text className="text-xs text-gray-500">Email</Text>
                <Text className="text-base">{conversation.user.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        {/* <View className="mt-6 ">
          <Text className="text-lg font-medium mb-3 px-5">Settings</Text>
          <View className="bg-gray-50 rounded-lg">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-base px-1.5">Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#D1D1D6", true: "#F5293650" }}
                thumbColor={notifications ? "#F52936" : "#F4F4F4"}
              />
            </View>

            <View className="flex-row justify-between items-center p-4">
              <Text className="text-base px-1.5">Mute Chat</Text>
              <Switch
                value={muteChat}
                onValueChange={setMuteChat}
                trackColor={{ false: "#D1D1D6", true: "#F5293650" }}
                thumbColor={muteChat ? "#F52936" : "#F4F4F4"}
              />
            </View>
          </View>
        </View> */}

        {/* Shared Media */}
        <View className="mt-6 ">
          <View className="flex-row justify-between items-center mb-3 px-5">
            <Text className="text-lg font-medium">Shared Media</Text>
            <TouchableOpacity>
              <Text className="text-[#F52936]">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5 "
          >
            {conversation.sharedMedia.map((media) => (
              <TouchableOpacity
                key={media.id}
                className="mr-3 mb-2 bg-gray-100 rounded-lg p-3"
                style={{ width: 120 }}
              >
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="mic" size={24} color="#637381" />
                </View>
                <Text className="text-center text-sm text-gray-700">
                  Voice ({media.duration})
                </Text>
                <Text className="text-center text-xs text-gray-500 mt-1">
                  {media.timestamp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Danger Zone */}
        <View className="mt-8 mb-10 ">
          <Text className="text-lg font-medium mb-3 text-gray-700 px-5">
            Privacy & Support
          </Text>
          <View className="bg-gray-50 rounded-lg px-1.5">
            <TouchableOpacity
              className="p-4 border-b border-gray-100 flex-row items-center"
              onPress={handleBlockUser}
            >
              <Ionicons
                name="person-remove-outline"
                size={20}
                color="#F52936"
              />
              <Text className="ml-3 text-[#F52936]">Block User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 border-b border-gray-100 flex-row items-center"
              onPress={handleClearChat}
            >
              <Ionicons name="trash-outline" size={20} color="#F52936" />
              <Text className="ml-3 text-[#F52936]">Clear Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={handleReportUser}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#F52936" />
              <Text className="ml-3 text-[#F52936]">Report User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SingleChatInfoScreen;
