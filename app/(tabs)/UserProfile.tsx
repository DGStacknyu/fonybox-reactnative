import React, { useCallback, useState } from "react";
import { FlatList, Platform, Text, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  RefreshControl,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import PostCard from "@/components/posts/PostCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileTabs from "@/components/profile/ProfileTabs";
import CommentsBottomSheet from "@/components/common/CommentsBottomSheet";

import { postData, savedData } from "@/constants/chats";
import useCurrentUserProfile from "@/hooks/useCurrentUserProfile";

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

  const currentData = activeTab === "posts" ? postData : savedData;
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserProfile]);
  const renderPostItem = ({ item }: any) => (
    <PostCard post={item} onOpenComments={handleOpenComments} />
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
