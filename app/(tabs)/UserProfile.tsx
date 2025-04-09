import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, Text, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  RefreshControl,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import CommentsBottomSheet from "@/components/common/CommentsBottomSheet";
import PostCard from "@/components/posts/PostCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs from "@/components/profile/ProfileTabs";

import useCurrentUserProfile from "@/hooks/useCurrentUserProfile";
import { getPosts, getSavedPosts } from "@/lib/get-post-data/post-fucntions";
import { RecordModel } from "pocketbase";

const UserProfile = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    commentsSheetRef,
    handleOpenComments,
    logout,
    userStats,
    loading,
    refreshUserProfile,
    followStatus,
  } = useCurrentUserProfile();
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user]);

  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState<RecordModel[]>([]);
  const [savedPosts, setSavedPosts] = useState<RecordModel[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fetchUserPosts = async () => {
    if (!user?.id) return;

    setPostsLoading(true);
    try {
      const postsData = await getPosts({
        page,
        perPage,
        userId: user.id,
        filter: `user="${user.id}"`,
      });
      setUserPosts(postsData.items || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (!user?.id) return;

    setSavedLoading(true);
    try {
      const savedPostsData = await getSavedPosts(user.id, page, perPage);
      setSavedPosts(savedPostsData.items || []);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
      fetchSavedPosts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchUserPosts();
    } else if (activeTab === "saved") {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const handlePostUpdated = useCallback(() => {
    if (activeTab === "posts") {
      fetchUserPosts();
    } else if (activeTab === "saved") {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
      if (activeTab === "posts") {
        await fetchUserPosts();
      } else if (activeTab === "saved") {
        await fetchSavedPosts();
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserProfile, activeTab]);

  const currentData = activeTab === "posts" ? userPosts : savedPosts;
  const isLoading = activeTab === "posts" ? postsLoading : savedLoading;

  const renderEmptyState = () => {
    if (isLoading) {
      return null;
    }

    if (activeTab === "posts") {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
          <Text className="text-gray-500 text-base mb-6 text-center px-8">
            Create your first post by pressing the voice button below
          </Text>
        </View>
      );
    } else {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-gray-600 text-lg mb-2">No saved posts yet</Text>
          <Text className="text-gray-500 text-base text-center px-8">
            When you save posts, they'll appear here
          </Text>
        </View>
      );
    }
  };

  const renderPostItem = ({ item }: any) => (
    <PostCard
      post={item}
      onOpenComments={handleOpenComments}
      onPostUpdated={handlePostUpdated}
    />
  );

  const renderHeader = () => (
    <View>
      <ProfileHeader userData={user} isCurrentUser={true} />
      <ProfileStats
        userData={user}
        userStats={userStats}
        loading={loading}
        isCurrentUser={true}
      />
      <ProfileActions
        userData={user}
        user={user}
        isCurrentUser={true}
        followStatus={followStatus}
      />
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <View className="mt-4" />
    </View>
  );

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
                {user?.username}
              </Text>
            </View>
            <TouchableOpacity onPress={logout}>
              <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentData}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]}
                tintColor="#3b82f6"
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

export default UserProfile;
