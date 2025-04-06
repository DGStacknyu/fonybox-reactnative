import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalContext } from "@/lib/AuthContext";
import BottomSheet from "@gorhom/bottom-sheet";

interface UserStats {
  followers: number;
  following: number;
  posts: number;
}

const useCurrentUserProfile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { logout, user, pb } = useGlobalContext();
  const commentsSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%", "100%"], []);
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

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserStats = async () => {
      setLoading(true);
      try {
        const followersResult = await pb.collection("follows").getList(1, 100, {
          filter: `following="${user.id}"`,
        });

        const followingResult = await pb.collection("follows").getList(1, 100, {
          filter: `follower="${user.id}"`,
        });

        const postsResult = await pb.collection("posts").getList(1, 1, {
          filter: `user="${user.id}"`,
        });

        setUserStats({
          followers: followersResult.totalItems,
          following: followingResult.totalItems,
          posts: postsResult.totalItems,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id, pb]);

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
  };
};

export default useCurrentUserProfile;
