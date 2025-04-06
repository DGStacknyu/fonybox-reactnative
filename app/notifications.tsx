import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { pb } from "@/components/pocketbaseClient";
import { NOTIFICATIONS } from "@/constants/chats";
import { useGlobalContext } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  SectionList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getFollowRequestCount = async (userId: any) => {
  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `following="${userId}" && status="pending"`,
      countOnly: true,
    });

    return result.totalItems;
  } catch (error) {
    console.error("Error fetching follow request count:", error);
    return 0;
  }
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

const SectionHeader = ({ title }: any) => (
  <View className="px-5 py-2 bg-gray-50">
    <Text className="text-sm font-medium text-gray-500">{title}</Text>
  </View>
);

const Notifications = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestCount = async () => {
      if (user && user.id) {
        try {
          const count = await getFollowRequestCount(user.id);
          setRequestCount(count);
        } catch (error) {
          console.error("Error fetching request count:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchRequestCount();
    const interval = setInterval(fetchRequestCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ChatListHeader title="Notifications" />
      <TouchableOpacity
        className="px-5 py-3 bg-white flex-row items-center justify-between"
        onPress={() => router.push("/follow-requests")}
      >
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={24} color="#333" />
          <Text className="font-semibold text-lg text-black ml-3">
            Follow Requests
          </Text>
        </View>

        <View className="flex-row items-center">
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : requestCount > 0 ? (
            <>
              <View className="bg-red-500 rounded-full px-2 py-0.5 mr-2">
                <Text className="text-white font-bold">{requestCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#666" />
          )}
        </View>
      </TouchableOpacity>

      <View className="h-px bg-gray-100 " />

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
