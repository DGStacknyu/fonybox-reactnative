import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import ProfileAvatar from "./ProfileAvatar";
import { pbFileUrl } from "@/lib/getData/GetVideos";

const UserList = ({
  users,
  loading,
  refreshing,
  onRefresh,
  onEndReached,
  loadingMore,
  hasMore,
  followLoading,
  onFollowToggle,
  emptyMessage,
  error,
}: any) => {
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 flex items-center justify-center">
        <ActivityIndicator size="small" color="#EF4444" />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-500">Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-500 mb-2">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-gray-200 px-6 py-3 rounded-lg"
          onPress={onRefresh}
        >
          <Text className="font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-gray-500 text-center">{emptyMessage}</Text>
      </View>
    );
  }

  const renderFollowButton = (user: any) => {
    const userId = user.id;
    const isCurrentUser = user.isCurrentUser;
    const isLoading = followLoading[userId] || false;

    // If this is the current user, show "YOU" badge
    if (isCurrentUser) {
      return (
        <View className="bg-gray-100 rounded-lg py-2 px-6">
          <Text className="font-medium text-gray-600">YOU</Text>
        </View>
      );
    }

    // Get follow status from the user object
    const status = user.followStatus || {
      isFollowing: false,
      followStatus: "pending",
    };

    const isFollowing = status.isFollowing;
    const followStatus = status.followStatus;

    let buttonClass = isFollowing
      ? "bg-white border border-red-500"
      : "bg-red-500";

    let textClass = isFollowing ? "text-red-500" : "text-white";

    let buttonText = "Follow";
    if (isFollowing) {
      buttonText = followStatus === "accepted" ? "Following" : "Requested";
    }

    return (
      <TouchableOpacity
        className={`rounded-lg py-2 px-6 items-center ${buttonClass}`}
        onPress={() => onFollowToggle(userId)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? "#EF4444" : "#FFFFFF"}
          />
        ) : (
          <Text className={`font-medium ${textClass}`}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const user = item;
    const hasAvatar = user.avatar && user.collectionId && user.id;

    return (
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
        onPress={() => router.push(`/profile/${user.id}`)}
      >
        <View className="flex-row items-center">
          <ProfileAvatar
            imageUrl={
              hasAvatar
                ? pbFileUrl(user.collectionId, user.id, user.avatar)
                : null
            }
            name={user.name}
            size={50}
            textSizeClass="text-lg"
          />
          <View className="ml-3">
            <Text className="font-semibold">
              {user.name}{" "}
              {user.isCurrentUser && (
                <Text className="text-gray-500">(You)</Text>
              )}
            </Text>
            <Text className="text-gray-500">@{user.username}</Text>
          </View>
        </View>

        {onFollowToggle && renderFollowButton(user)}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#EF4444"]}
          tintColor="#EF4444"
        />
      }
      onEndReached={hasMore ? onEndReached : null}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
};

export default UserList;
