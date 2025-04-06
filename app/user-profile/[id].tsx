import React from "react";
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
import ProfileTabs from "@/components/profile/ProfileTabs";
import PrivateAccountMessage from "@/components/profile/PrivateAccountMessage";
import CommentsBottomSheet from "@/components/common/CommentsBottomSheet";

import { postData, savedData } from "@/constants/chats";
import useProfileData from "@/hooks/userProfileData";

const UserProfileDetails = () => {
  const {
    userData,
    loading,
    refreshing,
    error,
    user,
    activeTab,
    setActiveTab,
    followStatus,
    commentsSheetRef,
    handleRefresh,
    handleOpenComments,
    shouldShowPosts,
  } = useProfileData();

  const currentData = activeTab === "posts" ? postData : savedData;

  const renderPostItem = ({ item }: any) => (
    <PostCard post={item} onOpenComments={handleOpenComments} />
  );

  const renderHeader = () => {
    if (!userData) return null;

    return (
      <View>
        <ProfileHeader userData={userData} />
        <ProfileStats userData={userData} />
        <ProfileActions
          userData={userData}
          user={user}
          followStatus={followStatus}
        />

        {shouldShowPosts() ? (
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <PrivateAccountMessage />
        )}
        <View className="mt-4" />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600">Loading user profile...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
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
            data={shouldShowPosts() ? currentData : []}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#EF4444"]}
                tintColor="#EF4444"
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

export default UserProfileDetails;
