// useProfileData.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "@/lib/AuthContext";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  checkFollowStatus,
  getUserProfile,
  getFollowerCount,
  getFollowingCount,
  getPostCount,
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState("pending");
  const [followLoading, setFollowLoading] = useState(false);
  const [mutualFollow, setMutualFollow] = useState(false);

  // Stats counts
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  // Bottom sheet ref
  const commentsSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%", "100%"], []);

  const handleSheetChanges = useCallback((index: any) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleOpenComments = useCallback(() => {
    commentsSheetRef.current?.snapToIndex(0);
  }, []);

  const fetchUserStats = async (userId: string) => {
    try {
      const followers = await getFollowerCount(userId);
      const following = await getFollowingCount(userId);
      const posts = await getPostCount(userId);

      setFollowerCount(followers);
      setFollowingCount(following);
      setPostCount(posts);

      // Add the counts to userData for easier access
      setUserData((prevData) => ({
        ...(prevData as RecordModel),
        followerCount: followers,
        followingCount: following,
        postCount: posts,
      }));
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchProfileData = useCallback(async () => {
    if (!id) {
      setError("No user ID provided");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const record = await getUserProfile(id);
      setUserData(record);

      // Fetch user stats
      await fetchUserStats(id);

      if (user && user.id && user.id !== id) {
        const status = await checkFollowStatus(user.id, id);
        setIsFollowing(status.isFollowing);
        setFollowStatus(status.followStatus);

        const mutualStatus = await checkFollowStatus(id, user.id);
        setMutualFollow(
          status.isFollowing &&
            status.followStatus === "accepted" &&
            mutualStatus.isFollowing &&
            mutualStatus.followStatus === "accepted"
        );
      }

      setError("");
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  const shouldShowPosts = useCallback(() => {
    if (!userData) return false;
    if (user.id === userData.id) return true;
    if (userData.account_type === "public") return true;
    return followStatus === "accepted";
  }, [userData, user, followStatus]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    userData,
    loading,
    refreshing,
    error,
    user,
    activeTab,
    setActiveTab,
    isFollowing,
    followStatus,
    followLoading,
    mutualFollow,
    commentsSheetRef,
    snapPoints,
    handleSheetChanges,
    handleOpenComments,
    fetchProfileData,
    handleRefresh,
    shouldShowPosts,
  };
};

export default useProfileData;

// useProfileActions.tsx

export const useProfileActions = (
  userData: any,
  user: any,
  followStatus: any
) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!userData || userData.id === user.id) return;

    setFollowLoading(true);

    try {
      const result = await toggleFollowStatus(
        user.id,
        userData.id,
        isFollowing
      );
      setIsFollowing(result.isFollowing);

      // Refresh follower count after follow/unfollow
      await getFollowerCount(userData.id);
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const canMessage = useCallback(() => {
    if (!userData) return false;
    if (user.id === userData.id) return false;
    if (userData.account_type === "public") return true;
    return followStatus === "accepted";
  }, [userData, user, followStatus]);

  return {
    isFollowing,
    followLoading,
    handleFollow,
    canMessage,
  };
};
