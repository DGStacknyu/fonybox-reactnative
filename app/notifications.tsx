import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";

const NOTIFICATIONS = [
  {
    title: "Today",
    data: [
      {
        id: "1",
        user: {
          name: "Oban robert",
          avatar: null,
          initial: "O",
        },
        message: "respond to your story",
        timestamp: "1 min ago",
        unread: false,
      },
      {
        id: "2",
        user: {
          name: "Natalia",
          avatar: null,
          initial: "N",
        },
        message: "Like your story",
        timestamp: "20 min ago",
        unread: true,
      },
      {
        id: "3",
        user: {
          name: "Roben",
          avatar: null,
          initial: "R",
        },
        message: "Started follow you",
        timestamp: "45 min ago",
        unread: false,
      },
    ],
  },
  {
    title: "Yesterday",
    data: [
      {
        id: "4",
        user: {
          name: "Anggi",
          avatar: null,
          initial: "A",
        },
        message: "Started followed you",
        timestamp: "1 day ago",
        unread: false,
      },
      {
        id: "5",
        user: {
          name: "Pedro",
          avatar: null,
          initial: "P",
        },
        message: "Like your story",
        timestamp: "1day ago",
        unread: false,
      },
      {
        id: "6",
        user: {
          name: "Mia",
          avatar: null,
          initial: "M",
        },
        message: "Respond your story",
        timestamp: "1 day ago",
        unread: false,
      },
    ],
  },
  {
    title: "This week",
    data: [
      {
        id: "7",
        user: {
          name: "Ermi",
          avatar: null,
          initial: "E",
        },
        message: "Like your story",
        timestamp: "1 week ago",
        unread: false,
      },
    ],
  },
];

const Header = () => {
  return (
    <View
      className="px-5 pt-3 pb-0 bg-white"
      style={{ paddingTop: Platform.select({ ios: 0, android: 50 }) }}
    >
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="pr-4 absolute left-0 z-10"
        >
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>

        <Text className="text-2xl font-medium text-primary w-full text-center">
          Notifications
        </Text>
      </View>
    </View>
  );
};

const NotificationItem = ({ item }: any) => {
  return (
    <View className="px-5 py-3">
      <TouchableOpacity className="flex-row items-center">
        {item.user.avatar ? (
          <Image
            source={{ uri: item.user.avatar }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-lg text-gray-700">{item.user.initial}</Text>
          </View>
        )}

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text
              className={`font-semibold text-lg ${
                item.unread ? "text-black" : "text-gray-900"
              }`}
            >
              {item.user.name}
            </Text>
            <Text className="text-gray-500 text-sm">{item.timestamp}</Text>
          </View>

          <Text
            className={`text-base ${
              item.unread ? "text-black font-medium" : "text-gray-500"
            } mt-0.5`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.message}
          </Text>
        </View>

        {item.unread && (
          <View className="w-3 h-3 rounded-full bg-blue-500 ml-2" />
        )}
      </TouchableOpacity>
      <View className="h-px bg-gray-100 mt-3" />
    </View>
  );
};

// Section Header Component
const SectionHeader = ({ title }: any) => (
  <View className="px-5 py-2 bg-gray-50">
    <Text className="text-sm font-medium text-gray-500">{title}</Text>
  </View>
);

const Notifications = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <Header />

      <SectionList
        sections={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader title={title} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />
    </SafeAreaView>
  );
};

export default Notifications;
