import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RecordModel } from "pocketbase";
import { useGlobalContext } from "@/lib/AuthContext";
import {
  getFollowingList,
  checkFollowStatus,
  toggleFollowStatus,
} from "@/lib/FollowStatus";
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
  const [followStatuses, setFollowStatuses] = useState<{
    [key: string]: { isFollowing: boolean; followStatus: string };
  }>({});
  const [followLoading, setFollowLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchFollowing = useCallback(
    async (pageNum = 1, shouldRefresh = false) => {
      if (!id) {
        setError("User ID is missing");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const perPage = 20;
        const result = await getFollowingList(id as string, pageNum, perPage);

        const followingUsers = result.items
          .map((follow) => {
            return follow.expand?.following as RecordModel;
          })
          .filter(Boolean);

        if (shouldRefresh) {
          setFollowing(followingUsers);
        } else {
          setFollowing((prev) => [...prev, ...followingUsers]);
        }

        setHasMore(followingUsers.length === perPage);
        setPage(pageNum);

        if (user && followingUsers.length > 0) {
          const statuses: {
            [key: string]: { isFollowing: boolean; followStatus: string };
          } = {};

          await Promise.all(
            followingUsers.map(async (followingUser) => {
              if (followingUser.id !== user.id) {
                const status = await checkFollowStatus(
                  user.id,
                  followingUser.id
                );
                statuses[followingUser.id] = status;
              }
            })
          );

          setFollowStatuses((prev) => ({ ...prev, ...statuses }));
        }

        setError("");
      } catch (err) {
        console.error("Error fetching following users:", err);
        setError("Failed to load following users");
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
    async (followingUserId: string) => {
      if (!user || user.id === followingUserId) return;

      setFollowLoading((prev) => ({ ...prev, [followingUserId]: true }));

      try {
        const currentStatus = followStatuses[followingUserId];
        const isCurrentlyFollowing = currentStatus?.isFollowing || false;

        const result = await toggleFollowStatus(
          user.id,
          followingUserId,
          isCurrentlyFollowing
        );

        setFollowStatuses((prev) => ({
          ...prev,
          [followingUserId]: result,
        }));
      } catch (error) {
        console.error("Error toggling follow status:", error);
      } finally {
        setFollowLoading((prev) => ({ ...prev, [followingUserId]: false }));
      }
    },
    [user, followStatuses]
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
            ? "People you follow"
            : `People @${profileUsername} follows`}
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
        followStatuses={followStatuses}
        followLoading={followLoading}
        onFollowToggle={handleFollowToggle}
        emptyMessage={
          id === user?.id
            ? "You aren't following anyone yet"
            : "This user isn't following anyone yet"
        }
        error={error}
      />
    </SafeAreaView>
  );
};

export default FollowingList;
