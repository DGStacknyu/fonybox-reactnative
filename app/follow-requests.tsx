import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/lib/AuthContext";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { RecordModel } from "pocketbase";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FollowRequests = () => {
  const { user } = useGlobalContext();
  const [requests, setRequests] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      if (!user || !user.id) return;

      const result = await pb.collection("follows").getList(1, 50, {
        filter: `following="${user.id}" && status="pending"`,
        expand: "follower",
        sort: "-created",
      });

      setRequests(result.items);
      setError("");
    } catch (error) {
      console.error("Error fetching follow requests:", error);
      setError("Failed to load follow requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      await pb.collection("follows").update(requestId, {
        status: "accepted",
      });

      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await pb.collection("follows").delete(requestId);
      fetchRequests();
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  const renderRequestItem = ({ item }: any) => {
    const requester = item.expand?.follower;
    if (!requester) return null;

    return (
      <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => router.push(`/user-profile/${requester.id}`)}
        >
          <Image
            source={{
              uri: pbFileUrl(
                requester.collectionId || "",
                requester.id || "",
                requester.avatar
              ),
            }}
            className="w-14 h-14 rounded-full bg-gray-200"
          />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800">{requester.name}</Text>
            <Text className="text-gray-500">@{requester.username}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.created).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleDecline(item.id)}
            className="bg-gray-200 rounded-full h-10 w-10 items-center justify-center mr-2"
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAccept(item.id)}
            className="bg-red-500 rounded-full h-10 w-10 items-center justify-center"
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View className="items-center justify-center py-16">
        <Ionicons name="people-outline" size={60} color="#ccc" />
        <Text className="text-gray-400 mt-4 text-center px-6">
          No pending follow requests
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ChatListHeader title="Follow Requests" />

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="mt-4 text-gray-600">Loading requests...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-4 bg-gray-200 px-6 py-3 rounded-lg"
            onPress={onRefresh}
          >
            <Text className="font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default FollowRequests;
