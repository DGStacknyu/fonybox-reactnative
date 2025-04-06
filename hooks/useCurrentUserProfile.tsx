import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalContext } from "@/lib/AuthContext";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  getFollowerCount,
  getFollowingCount,
  getPostCount,
} from "@/lib/FollowStatus";

interface UserStats {
  followers: number;
  following: number;
  posts: number;
}

const useCurrentUserProfile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { logout, user, pb } = useGlobalContext();
  const commentsSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);
  const snapPoints = useMemo(() => ["75%", "100%"], []);
  const [followStatus, setFollowStatus] = useState(null);
  const [userStats, setUserStats] = useState<UserStats>({
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleSheetChanges = useCallback((index: any) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleOpenComments = useCallback(() => {
    commentsSheetRef.current?.snapToIndex(0);
  }, []);

  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const followers = await getFollowerCount(user.id);
      const following = await getFollowingCount(user.id);
      const posts = await getPostCount(user.id);

      setUserStats({
        followers,
        following,
        posts,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshUserProfile = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserStats();
      return true;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserStats]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    user,
    activeTab,
    setActiveTab,
    commentsSheetRef,
    snapPoints,
    handleSheetChanges,
    handleOpenComments,
    logout,
    userStats,
    loading,
    refreshing,
    refreshUserProfile,
    followStatus,
    setFollowStatus,
  };
};

export default useCurrentUserProfile;
