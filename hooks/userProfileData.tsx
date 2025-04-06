import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "@/lib/AuthContext";
import { pb } from "@/components/pocketbaseClient";
import {
  getFollowerCount,
  getFollowingCount,
  getPostCount,
  getFollowStatus,
  toggleFollowStatus,
} from "@/lib/FollowStatus";
import { RecordModel } from "pocketbase";

const useProfileData = () => {
  const { id } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [userData, setUserData] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [followStatus, setFollowStatus] = useState(null);
  const commentsSheetRef = useRef(null);

  const [userStats, setUserStats] = useState({
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
  });

  const fetchUserStats = async (userId: string) => {
    try {
      const followers = await getFollowerCount(userId);
      const following = await getFollowingCount(userId);
      const posts = await getPostCount(userId);

      setUserStats({
        followerCount: followers,
        followingCount: following,
        postCount: posts,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userRecord = await pb.collection("users").getOne(id as string);
      setUserData(userRecord);

      await fetchUserStats(id as string);

      if (user && user.id !== id) {
        const status = await getFollowStatus(user.id, id as string);
        console.log("Fetched follow status:", status);
        setFollowStatus(status);
      }
      setError("");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      setFollowStatus(null);
      fetchUserData();
    }
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    setFollowStatus(null);
    fetchUserData();
  };

  const handleOpenComments = (postId: any) => {
    commentsSheetRef.current?.present();
  };

  const shouldShowPosts = () => {
    if (!userData) return false;
    if (user && user.id === userData.id) return true;
    if (userData.account_type === "public") return true;
    return followStatus === "accepted";
  };

  return {
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
    userStats,
  };
};

export default useProfileData;

// useProfileActions.tsx

export const useProfileActions = (
  userData: any,
  user: any,
  followStatus: any
) => {
  const [isFollowing, setIsFollowing] = useState(
    followStatus === "accepted" || followStatus === "pending"
  );
  const [currentStatus, setCurrentStatus] = useState(followStatus);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(followStatus === "accepted" || followStatus === "pending");
    setCurrentStatus(followStatus);
    console.log(
      "useProfileActions received followStatus update:",
      followStatus
    );
  }, [followStatus]);

  const handleFollow = async () => {
    if (!userData || userData.id === user.id) return;

    const wasFollowing = isFollowing;
    const oldStatus = currentStatus;

    if (!isFollowing) {
      setIsFollowing(true);
      setCurrentStatus("pending");
    } else {
      setIsFollowing(false);
      setCurrentStatus(null);
    }

    setFollowLoading(true);

    try {
      const result = await toggleFollowStatus(
        user.id,
        userData.id,
        wasFollowing
      );

      setIsFollowing(result.isFollowing);
      setCurrentStatus(result.followStatus);
      console.log("After toggle, new status:", result.followStatus);

      await getFollowerCount(userData.id);
    } catch (error) {
      console.error("Error updating follow status:", error);
      setIsFollowing(wasFollowing);
      setCurrentStatus(oldStatus);
    } finally {
      setFollowLoading(false);
    }
  };

  const canMessage = useCallback(() => {
    if (!userData) return false;
    if (user.id === userData.id) return false;
    if (userData.account_type === "public") return true;
    return currentStatus === "accepted";
  }, [userData, user, currentStatus]);

  return {
    isFollowing,
    followLoading,
    handleFollow,
    canMessage,
    followStatus: currentStatus,
  };
};
