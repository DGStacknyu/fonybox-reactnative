import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import PostCard from "@/components/posts/PostCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileActions from "@/components/profile/ProfileActions";
import PrivateAccountMessage from "@/components/profile/PrivateAccountMessage";
import CommentsBottomSheet from "@/components/common/CommentsBottomSheet";

import useProfileData from "@/hooks/userProfileData";
import { getPosts } from "@/lib/get-post-data/post-fucntions";
import { RecordModel } from "pocketbase";

const UserProfileDetails = () => {
  const {
    userData,
    loading,
    refreshing: profileRefreshing,
    error,
    user,
    followStatus,
    commentsSheetRef,
    handleRefresh: refreshProfileData,
    handleOpenComments,
    shouldShowPosts,
    userStats,
  } = useProfileData();

  // Add state for posts data
  const [userPosts, setUserPosts] = useState<RecordModel[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fetchUserPosts = async () => {
    if (!userData?.id) return;

    setPostsLoading(true);
    try {
      const postsData = await getPosts({
        page,
        perPage,
        userId: userData.id,
        filter: `user="${userData.id}"`,
      });
      setUserPosts(postsData.items || []);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserPosts();
    }
  }, [userData?.id]);

  // Handler for post updates
  const handlePostUpdated = useCallback(() => {
    fetchUserPosts();
  }, []);

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfileData();
      await fetchUserPosts();
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfileData]);

  // Empty state component
  const renderEmptyState = () => {
    if (postsLoading) {
      return null;
    }

    const isCurrentUser = user?.id === userData?.id;

    return (
      <View className="flex-1 justify-center items-center py-10">
        <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
        <Text className="text-gray-500 text-base mb-6 text-center px-8">
          {isCurrentUser
            ? "You haven't posted anything yet"
            : "This user hasn't posted anything yet"}
        </Text>
      </View>
    );
  };

  const renderPostItem = ({ item }: any) => (
    <PostCard
      post={item}
      onOpenComments={handleOpenComments}
      onPostUpdated={handlePostUpdated}
    />
  );

  const renderHeader = () => {
    if (!userData) return null;
    const isCurrentUser = user?.id === userData?.id;

    return (
      <View>
        <ProfileHeader userData={userData} isCurrentUser={isCurrentUser} />
        <ProfileStats
          userData={userData}
          userStats={userStats}
          loading={loading}
          isCurrentUser={isCurrentUser}
        />
        <ProfileActions
          userData={userData}
          user={user}
          followStatus={followStatus}
          isCurrentUser={isCurrentUser}
        />
        {!shouldShowPosts() && <PrivateAccountMessage />}
        <View className="mt-4" />
      </View>
    );
  };

  if (loading && !refreshing && !profileRefreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600">Loading user profile...</Text>
      </View>
    );
  }

  if (error && !refreshing && !profileRefreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-gray-200 px-6 py-3 rounded-lg"
          onPress={handleRefresh}
        >
          <Text className="font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-5">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text className="ml-4 text-lg font-bold text-gray-700">
                {userData?.username}
              </Text>
            </View>
          </View>

          <FlatList
            data={shouldShowPosts() ? userPosts : []}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || profileRefreshing}
                onRefresh={handleRefresh}
                colors={["#EF4444"]}
                tintColor="#EF4444"
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: Platform.select({
                ios: 50,
                android: 70,
              }),
              paddingLeft: 15,
              paddingRight: 15,
            }}
          />

          <CommentsBottomSheet
            commentsSheetRef={commentsSheetRef}
            user={user}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default UserProfileDetails;
