// import { pb } from "@/components/pocketbaseClient";

// export const checkFollowStatus = async (
//   currentUserId: string,
//   profileUserId: string
// ) => {
//   // If checking follow status for current user, return special status
//   if (currentUserId === profileUserId) {
//     return { isCurrentUser: true, isFollowing: false, followStatus: "self" };
//   }

//   try {
//     const result = await pb.collection("follows").getList(1, 1, {
//       filter: `follower="${currentUserId}" && following="${profileUserId}"`,
//     });

//     const mutualResult = await pb.collection("follows").getList(1, 1, {
//       filter: `follower="${profileUserId}" && following="${currentUserId}" && status="accepted"`,
//     });

//     if (result.items.length > 0) {
//       if (mutualResult.items.length > 0) {
//         return { isFollowing: true, followStatus: "accepted" };
//       } else {
//         return { isFollowing: true, followStatus: result.items[0].status };
//       }
//     } else {
//       return { isFollowing: false, followStatus: "pending" };
//     }
//   } catch (error) {
//     console.error("Error checking follow status:", error);
//     return { isFollowing: false, followStatus: "pending" };
//   }
// };

// export const toggleFollowStatus = async (
//   currentUserId: string,
//   targetUserId: string,
//   isFollowing: boolean
// ) => {
//   // Prevent toggling follow status on yourself
//   if (currentUserId === targetUserId) {
//     return { isCurrentUser: true, isFollowing: false, followStatus: "self" };
//   }

//   try {
//     if (!isFollowing) {
//       await pb.collection("follows").create({
//         follower: currentUserId,
//         following: targetUserId,
//         status: "pending",
//       });
//       return { isFollowing: true, followStatus: "pending" };
//     } else {
//       const result = await pb.collection("follows").getList(1, 1, {
//         filter: `follower="${currentUserId}" && following="${targetUserId}"`,
//       });

//       if (result.items.length > 0) {
//         await pb.collection("follows").delete(result.items[0].id);
//       }

//       return { isFollowing: false, followStatus: "pending" };
//     }
//   } catch (error) {
//     console.error("Error updating follow status:", error);
//     throw error;
//   }
// };

// export const getUserProfile = async (userId: string) => {
//   try {
//     const record = await pb.collection("users").getOne(userId);
//     return record;
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     throw error;
//   }
// };

// // Get follower count for a user
// export const getFollowerCount = async (userId: string): Promise<number> => {
//   try {
//     const result = await pb.collection("follows").getList(1, 1, {
//       filter: `following = "${userId}" && status = "accepted"`,
//     });

//     return result.totalItems;
//   } catch (error) {
//     console.error("Error getting follower count:", error);
//     return 0;
//   }
// };

// // Get following count for a user
// export const getFollowingCount = async (userId: string): Promise<number> => {
//   try {
//     const result = await pb.collection("follows").getList(1, 1, {
//       filter: `follower = "${userId}" && status = "accepted"`,
//     });

//     return result.totalItems;
//   } catch (error) {
//     console.error("Error getting following count:", error);
//     return 0;
//   }
// };

// export const getPostCount = async (userId: string): Promise<number> => {
//   try {
//     const result = await pb.collection("posts").getList(1, 1, {
//       filter: `user = "${userId}"`,
//     });

//     return result.totalItems;
//   } catch (error) {
//     console.error("Error getting post count:", error);
//     return 0;
//   }
// };

// export const getPendingFollowersCount = async (
//   userId: string
// ): Promise<number> => {
//   try {
//     const result = await pb.collection("follows").getList(1, 1, {
//       filter: `following = "${userId}" && status = "pending"`,
//     });

//     return result.totalItems;
//   } catch (error) {
//     console.error("Error getting pending follower count:", error);
//     return 0;
//   }
// };

// export const getFollowersList = async (
//   userId: string,
//   currentUserId: string,
//   page: number = 1,
//   perPage: number = 20
// ) => {
//   try {
//     const result = await pb.collection("follows").getList(page, perPage, {
//       filter: `following = "${userId}" && status = "accepted"`,
//       expand: "follower",
//       sort: "-created",
//       $cancelKey: `followers-list-${userId}-${page}`,
//     });

//     // Process the results to add isCurrentUser flag
//     const processedItems = result.items.map((item) => {
//       const follower = item.expand?.follower;
//       if (follower) {
//         // Add the isCurrentUser flag to each follower
//         follower.isCurrentUser = follower.id === currentUserId;
//       }
//       return item;
//     });

//     // Return result with processed items
//     return {
//       ...result,
//       items: processedItems,
//     };
//   } catch (error) {
//     console.error("Error getting followers list:", error);
//     throw error;
//   }
// };

// export const getFollowingList = async (
//   userId: string,
//   currentUserId: string,
//   page: number = 1,
//   perPage: number = 20
// ) => {
//   try {
//     const result = await pb.collection("follows").getList(page, perPage, {
//       filter: `follower = "${userId}" && status = "accepted"`,
//       expand: "following",
//       sort: "-created",
//       $cancelKey: `following-list-${userId}-${page}`,
//     });

//     // Process the results to add isCurrentUser flag
//     const processedItems = result.items.map((item) => {
//       const following = item.expand?.following;
//       if (following) {
//         // Add the isCurrentUser flag to each followed user
//         following.isCurrentUser = following.id === currentUserId;
//       }
//       return item;
//     });

//     // Return result with processed items
//     return {
//       ...result,
//       items: processedItems,
//     };
//   } catch (error) {
//     console.error("Error getting following list:", error);
//     throw error;
//   }
// };

// // Convenience function to get followers with follow status information
// export const getFollowersWithStatus = async (
//   userId: string,
//   currentUserId: string,
//   page: number = 1,
//   perPage: number = 20
// ) => {
//   try {
//     // Get followers list
//     const followersResult = await getFollowersList(
//       userId,
//       currentUserId,
//       page,
//       perPage
//     );

//     // If current user is viewing their own followers, we don't need to check follow status
//     if (userId === currentUserId) {
//       return followersResult;
//     }

//     // For each follower that isn't the current user, check if current user follows them
//     const followersWithStatus = await Promise.all(
//       followersResult.items.map(async (item) => {
//         const follower = item.expand?.follower;
//         if (follower && !follower.isCurrentUser) {
//           try {
//             const status = await checkFollowStatus(currentUserId, follower.id);
//             follower.followStatus = status;
//           } catch (error) {
//             console.error(
//               `Error getting follow status for ${follower.id}:`,
//               error
//             );
//             follower.followStatus = {
//               isFollowing: false,
//               followStatus: "error",
//             };
//           }
//         }
//         return item;
//       })
//     );

//     return {
//       ...followersResult,
//       items: followersWithStatus,
//     };
//   } catch (error) {
//     console.error("Error getting followers with status:", error);
//     throw error;
//   }
// };

// // Convenience function to get following with follow status information
// export const getFollowingWithStatus = async (
//   userId: string,
//   currentUserId: string,
//   page: number = 1,
//   perPage: number = 20
// ) => {
//   try {
//     // Get following list
//     const followingResult = await getFollowingList(
//       userId,
//       currentUserId,
//       page,
//       perPage
//     );

//     // If current user is viewing their own following, we don't need to check follow status
//     if (userId === currentUserId) {
//       return followingResult;
//     }

//     // For each following user that isn't the current user, check if current user follows them
//     const followingWithStatus = await Promise.all(
//       followingResult.items.map(async (item) => {
//         const following = item.expand?.following;
//         if (following && !following.isCurrentUser) {
//           try {
//             const status = await checkFollowStatus(currentUserId, following.id);
//             following.followStatus = status;
//           } catch (error) {
//             console.error(
//               `Error getting follow status for ${following.id}:`,
//               error
//             );
//             following.followStatus = {
//               isFollowing: false,
//               followStatus: "error",
//             };
//           }
//         }
//         return item;
//       })
//     );

//     return {
//       ...followingResult,
//       items: followingWithStatus,
//     };
//   } catch (error) {
//     console.error("Error getting following with status:", error);
//     throw error;
//   }
// };
import { pb } from "@/components/pocketbaseClient";

export const checkFollowStatus = async (
  currentUserId: string,
  profileUserId: string
) => {
  // Don't check follow status if it's the current user
  if (currentUserId === profileUserId) {
    return { isCurrentUser: true, isFollowing: false, followStatus: "self" };
  }

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
  if (currentUserId === targetUserId) {
    return { isCurrentUser: true, isFollowing: false, followStatus: "self" };
  }

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

      return { isFollowing: false, followStatus: null };
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
  }
};

export const getFollowStatus = async (
  currentUserId: string,
  targetUserId: string
) => {
  if (currentUserId === targetUserId) {
    return null;
  }

  try {
    const result = await pb.collection("follows").getList(1, 1, {
      filter: `follower="${currentUserId}" && following="${targetUserId}"`,
    });

    if (result.items.length === 0) {
      console.log("No follow relationship found");
      return null;
    }

    return result.items[0].status;
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return null;
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
  currentUserId: string,
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

    // If viewing your own followers list, fetch your following list to check who you follow back
    let followingMap = {};
    if (userId === currentUserId) {
      try {
        // Get all users the current user is following
        const followingResult = await pb.collection("follows").getList(1, 200, {
          filter: `follower = "${currentUserId}" && status = "accepted"`,
        });

        // Create a map for quick lookup
        followingMap = followingResult.items.reduce((map, item) => {
          map[item.following] = true;
          return map;
        }, {});
      } catch (err) {
        console.error("Error fetching following list:", err);
      }
    }

    // Process items to add current user info and follow status
    const processedItems = await Promise.all(
      result.items.map(async (item) => {
        const follower = item.expand?.follower;
        if (follower) {
          follower.isCurrentUser = follower.id === currentUserId;
          if (userId === currentUserId) {
            const isFollowingBack = followingMap[follower.id] || false;
            follower.followStatus = {
              isFollowing: isFollowingBack,
              followStatus: isFollowingBack ? "accepted" : "pending",
            };
          } else if (!follower.isCurrentUser) {
            try {
              const status = await checkFollowStatus(
                currentUserId,
                follower.id
              );
              follower.followStatus = status;
            } catch (err) {
              console.error("Error checking follow status:", err);
              follower.followStatus = {
                isFollowing: false,
                followStatus: "pending",
              };
            }
          }
        }
        return item;
      })
    );

    return {
      ...result,
      items: processedItems,
    };
  } catch (error) {
    console.error("Error getting followers list:", error);
    throw error;
  }
};
export const getFollowingList = async (
  userId: string,
  currentUserId: string,
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

    // Process items to add current user info and follow status
    const processedItems = await Promise.all(
      result.items.map(async (item) => {
        const following = item.expand?.following;
        if (following) {
          // Mark if this is the current user
          following.isCurrentUser = following.id === currentUserId;

          // If viewing your own following list, mark all users as being followed by you
          if (userId === currentUserId) {
            following.followStatus = {
              isFollowing: true,
              followStatus: "accepted",
            };
          }
          // If not the current user and viewing someone else's list,
          // check if the current user is following this person
          else if (!following.isCurrentUser) {
            try {
              const status = await checkFollowStatus(
                currentUserId,
                following.id
              );
              following.followStatus = status;
            } catch (err) {
              console.error("Error checking follow status:", err);
              following.followStatus = {
                isFollowing: false,
                followStatus: "pending",
              };
            }
          }
        }
        return item;
      })
    );

    return {
      ...result,
      items: processedItems,
    };
  } catch (error) {
    console.error("Error getting following list:", error);
    throw error;
  }
};
