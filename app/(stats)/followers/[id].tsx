import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RecordModel } from "pocketbase";
import { useGlobalContext } from "@/lib/AuthContext";
import {
  getFollowersList,
  checkFollowStatus,
  toggleFollowStatus,
} from "@/lib/FollowStatus";
import UserList from "@/components/UserList";

const FollowersList = () => {
  const { id } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [followers, setFollowers] = useState<RecordModel[]>([]);
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

  const fetchFollowers = useCallback(
    async (pageNum = 1, shouldRefresh = false) => {
      if (!id) {
        setError("User ID is missing");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const perPage = 20;
        const result = await getFollowersList(id as string, pageNum, perPage);

        const followerUsers = result.items
          .map((follow) => {
            // Extract the follower user from the expanded data
            return follow.expand?.follower as RecordModel;
          })
          .filter(Boolean); // Filter out any undefined values

        if (shouldRefresh) {
          setFollowers(followerUsers);
        } else {
          setFollowers((prev) => [...prev, ...followerUsers]);
        }

        setHasMore(followerUsers.length === perPage);
        setPage(pageNum);

        // Check follow status for each follower
        if (user && followerUsers.length > 0) {
          const statuses: {
            [key: string]: { isFollowing: boolean; followStatus: string };
          } = {};

          await Promise.all(
            followerUsers.map(async (follower) => {
              if (follower.id !== user.id) {
                const status = await checkFollowStatus(user.id, follower.id);
                statuses[follower.id] = status;
              }
            })
          );

          setFollowStatuses((prev) => ({ ...prev, ...statuses }));
        }

        setError("");
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError("Failed to load followers");
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
    fetchFollowers(1, true);
  }, [fetchFollowers]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    fetchFollowers(page + 1, false);
  }, [loadingMore, hasMore, page, fetchFollowers]);

  const handleFollowToggle = useCallback(
    async (followerId: string) => {
      if (!user || user.id === followerId) return;

      setFollowLoading((prev) => ({ ...prev, [followerId]: true }));

      try {
        const currentStatus = followStatuses[followerId];
        const isCurrentlyFollowing = currentStatus?.isFollowing || false;

        const result = await toggleFollowStatus(
          user.id,
          followerId,
          isCurrentlyFollowing
        );

        setFollowStatuses((prev) => ({
          ...prev,
          [followerId]: result,
        }));
      } catch (error) {
        console.error("Error toggling follow status:", error);
      } finally {
        setFollowLoading((prev) => ({ ...prev, [followerId]: false }));
      }
    },
    [user, followStatuses]
  );

  useEffect(() => {
    fetchFollowers(1, true);
  }, [fetchFollowers]);

  const profileUsername =
    followers.length > 0 && id === followers[0]?.expand?.following?.id
      ? followers[0]?.expand?.following?.username
      : "User";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-bold">Followers</Text>
        </View>
        <Text className="text-gray-500">
          {id === user?.id
            ? "Your followers"
            : `@${profileUsername}'s followers`}
        </Text>
      </View>

      <UserList
        users={followers}
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
            ? "You don't have any followers yet"
            : "This user doesn't have any followers yet"
        }
        error={error}
      />
    </SafeAreaView>
  );
};

export default FollowersList;
