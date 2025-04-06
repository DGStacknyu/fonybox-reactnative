import { pb } from "@/components/pocketbaseClient";

export const checkFollowStatus = async (
  currentUserId: string,
  profileUserId: string
) => {
  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `follower="${currentUserId}" && following="${profileUserId}"`,
    });

    const mutualResult = await pb.collection("follows").getList(1, 1, {
      filter: `follower="${profileUserId}" && following="${currentUserId}" && status="accepted"`,
    });

    if (result.items.length > 0) {
      if (mutualResult.items.length > 0) {
        return { isFollowing: true, followStatus: "accepted" };
      } else {
        return { isFollowing: true, followStatus: result.items[0].status };
      }
    } else {
      return { isFollowing: false, followStatus: "pending" };
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
    return { isFollowing: false, followStatus: "pending" };
  }
};

export const toggleFollowStatus = async (
  currentUserId: string,
  targetUserId: string,
  isFollowing: boolean
) => {
  try {
    if (!isFollowing) {
      await pb.collection("follows").create({
        follower: currentUserId,
        following: targetUserId,
        status: "pending",
      });
      return { isFollowing: true, followStatus: "pending" };
    } else {
      const result = await pb.collection("follows").getList(1, 1, {
        filter: `follower="${currentUserId}" && following="${targetUserId}"`,
      });

      if (result.items.length > 0) {
        await pb.collection("follows").delete(result.items[0].id);
      }

      return { isFollowing: false, followStatus: "pending" };
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const record = await pb.collection("users").getOne(userId);
    return record;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Get follower count for a user
export const getFollowerCount = async (userId: string): Promise<number> => {
  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `following = "${userId}" && status = "accepted"`,
    });

    return result.totalItems;
  } catch (error) {
    console.error("Error getting follower count:", error);
    return 0;
  }
};

// Get following count for a user
export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `follower = "${userId}" && status = "accepted"`,
    });

    return result.totalItems;
  } catch (error) {
    console.error("Error getting following count:", error);
    return 0;
  }
};

export const getPostCount = async (userId: string): Promise<number> => {
  try {
    const result = await pb.collection("posts").getList(1, 1, {
      filter: `user = "${userId}"`,
    });

    return result.totalItems;
  } catch (error) {
    console.error("Error getting post count:", error);
    return 0;
  }
};

export const getPendingFollowersCount = async (
  userId: string
): Promise<number> => {
  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `following = "${userId}" && status = "pending"`,
    });

    return result.totalItems;
  } catch (error) {
    console.error("Error getting pending follower count:", error);
    return 0;
  }
};

export const getFollowersList = async (
  userId: string,
  page: number = 1,
  perPage: number = 20
) => {
  try {
    const result = await pb.collection("follows").getList(page, perPage, {
      filter: `following = "${userId}" && status = "accepted"`,
      expand: "follower",
      sort: "-created",
      $cancelKey: `followers-list-${userId}-${page}`,
    });

    return result;
  } catch (error) {
    console.error("Error getting followers list:", error);
    throw error;
  }
};

export const getFollowingList = async (
  userId: string,
  page: number = 1,
  perPage: number = 20
) => {
  try {
    const result = await pb.collection("follows").getList(page, perPage, {
      filter: `follower = "${userId}" && status = "accepted"`,
      expand: "following",
      sort: "-created",
      $cancelKey: `following-list-${userId}-${page}`,
    });

    return result;
  } catch (error) {
    console.error("Error getting following list:", error);
    throw error;
  }
};
