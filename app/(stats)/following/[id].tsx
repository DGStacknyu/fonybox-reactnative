import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RecordModel } from "pocketbase";
import { useGlobalContext } from "@/context/AuthContext";
import { getFollowingList, toggleFollowStatus } from "@/lib/FollowStatus";
import UserList from "@/components/UserList";

const FollowingList = () => {
  const { id } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [following, setFollowing] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchFollowing = useCallback(
    async (pageNum = 1, shouldRefresh = false) => {
      if (!id || !user) {
        setError("User ID is missing");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const perPage = 20;
        // Get following list with current user ID to check follow status
        const result = await getFollowingList(
          id as string,
          user.id,
          pageNum,
          perPage
        );

        const followingUsers = result.items
          .map((follow) => follow.expand?.following as RecordModel)
          .filter(Boolean);

        if (shouldRefresh) {
          setFollowing(followingUsers);
        } else {
          setFollowing((prev) => [...prev, ...followingUsers]);
        }

        setHasMore(followingUsers.length === perPage);
        setPage(pageNum);
        setError("");
      } catch (err) {
        console.error("Error fetching following:", err);
        setError("Failed to load following");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [id, user]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchFollowing(1, true);
  }, [fetchFollowing]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    fetchFollowing(page + 1, false);
  }, [loadingMore, hasMore, page, fetchFollowing]);

  const handleFollowToggle = useCallback(
    async (followingId: string) => {
      if (!user) return;

      // Skip toggle for current user
      if (followingId === user.id) return;

      setFollowLoading((prev) => ({ ...prev, [followingId]: true }));

      try {
        // Find the following user in our list
        const followingIndex = following.findIndex((f) => f.id === followingId);
        if (followingIndex === -1) return;

        const followingUser = following[followingIndex];
        const currentStatus = followingUser.followStatus?.isFollowing || false;

        // Toggle the follow status
        const result = await toggleFollowStatus(
          user.id,
          followingId,
          currentStatus
        );

        // Update the following user in our list with new status
        const updatedFollowing = [...following];
        updatedFollowing[followingIndex] = {
          ...updatedFollowing[followingIndex],
          followStatus: result,
        };

        setFollowing(updatedFollowing);
      } catch (error) {
        console.error("Error toggling follow status:", error);
      } finally {
        setFollowLoading((prev) => ({ ...prev, [followingId]: false }));
      }
    },
    [user, following]
  );

  useEffect(() => {
    fetchFollowing(1, true);
  }, [fetchFollowing]);

  const profileUsername =
    following.length > 0 && id === following[0]?.expand?.follower?.id
      ? following[0]?.expand?.follower?.username
      : "User";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-bold">Following</Text>
        </View>
        <Text className="text-gray-500">
          {id === user?.id
            ? "You're following"
            : `@${profileUsername} is following`}
        </Text>
      </View>

      <UserList
        users={following}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
        followLoading={followLoading}
        onFollowToggle={handleFollowToggle}
        emptyMessage={
          id === user?.id
            ? "You're not following anyone yet"
            : "This user isn't following anyone yet"
        }
        error={error}
      />
    </SafeAreaView>
  );
};

export default FollowingList;
