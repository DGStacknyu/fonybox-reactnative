import { pb } from "@/components/pocketbaseClient";
import { Platform } from "react-native";
import { pbFileUrl } from "../getData/GetVideos";

// function formatTimeAgo(date: number | Date) {
//   const now = new Date();
//   const diffInSeconds = Math.floor((now - date) / 1000);

//   if (diffInSeconds < 60) {
//     return "just now";
//   }

//   const diffInMinutes = Math.floor(diffInSeconds / 60);
//   if (diffInMinutes < 60) {
//     return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
//   }

//   const diffInHours = Math.floor(diffInMinutes / 60);
//   if (diffInHours < 24) {
//     return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
//   }

//   const diffInDays = Math.floor(diffInHours / 24);
//   if (diffInDays < 30) {
//     return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
//   }

//   const diffInMonths = Math.floor(diffInDays / 30);
//   if (diffInMonths < 12) {
//     return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
//   }

//   const diffInYears = Math.floor(diffInMonths / 12);
//   return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
// }

export const createPost = async ({
  audioUri,
  userId,
  caption,
  imageUri,
}: any) => {
  if (!audioUri || !userId) {
    throw new Error("Audio and user ID are required");
  }

  try {
    const formData = new FormData();
    formData.append("user", userId);
    formData.append("caption", caption || "");
    const audioFilename = audioUri.split("/").pop();
    formData.append("audio_url", {
      uri: Platform.OS === "ios" ? audioUri.replace("file://", "") : audioUri,
      name: audioFilename || "recording.m4a",
      type: "audio/m4a",
    });
    if (imageUri) {
      const imageFilename = imageUri.split("/").pop();
      formData.append("image", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        name: imageFilename || "image.jpg",
        type: "image/jpeg",
      });
    }
    const record = await pb.collection("posts").create(formData);
    return record;
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

// export const getPosts = async ({
//   userId,
//   currentUserId,
//   page = 1,
//   perPage = 20,
//   ...options
// }: any) => {
//   try {
//     // Get the posts first
//     const records = await pb.collection("posts").getList(page, perPage, {
//       sort: options.sortBy || "-created",
//       filter: options.filter || "",
//       expand: "user",
//     });

//     // Process the posts
//     const processedItems = await Promise.all(
//       records.items.map(async (post) => {
//         // Check if current user liked this post
//         let isLiked = false;
//         let isSaved = false;

//         if (currentUserId) {
//           // Check liked_posts table
//           const likedResult = await pb.collection("liked_posts").getList(1, 1, {
//             filter: `post="${post.id}" && user="${currentUserId}"`,
//           });
//           isLiked = likedResult.items.length > 0;

//           // Check saved_posts table
//           const savedResult = await pb.collection("saved_posts").getList(1, 1, {
//             filter: `post="${post.id}" && user="${currentUserId}"`,
//           });
//           isSaved = savedResult.items.length > 0;
//         }

//         return {
//           ...post,
//           imageUrl: post.image ? pbFileUrl("posts", post.id, post.image) : null,
//           audioUrl: post.audio_url
//             ? pbFileUrl("posts", post.id, post.audio_url)
//             : null,
//           avatar: post.expand?.user?.avatar
//             ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
//             : "https://via.placeholder.com/100",
//           username: post.expand?.user?.name || "Unknown User",
//           timeAgo: formatTimeAgo(new Date(post.created)),
//           likes: post.likes?.length || 0,
//           shares: 0,
//           isLiked: isLiked,
//           isSaved: isSaved,
//         };
//       })
//     );

//     return {
//       ...records,
//       items: processedItems,
//     };
//   } catch (error) {
//     console.error("Failed to fetch posts:", error);
//     throw error;
//   }
// };
// export const deletePost = async (postId: string) => {
//   try {
//     await pb.collection("posts").delete(postId);
//   } catch (error) {
//     console.error("Failed to delete post:", error);
//     throw error;
//   }
// };

// export const getPostById = async (postId: string) => {
//   try {
//     const post = await pb.collection("posts").getOne(postId, {
//       expand: "user",
//     });
//     return {
//       ...post,
//       imageUrl: post.image ? pbFileUrl("posts", post.id, post.image) : null,
//       audioUrl: post.audio_url
//         ? pbFileUrl("posts", post.id, post.audio_url)
//         : null,
//       avatar: post.expand?.user?.avatar
//         ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
//         : "https://via.placeholder.com/100",
//       username: post.expand?.user?.name || "Unknown User",
//       timeAgo: formatTimeAgo(new Date(post.created)),
//       likes: post.likes?.length || 0,
//       shares: 0,
//     };
//   } catch (error) {
//     console.error("Failed to fetch post:", error);
//     throw error;
//   }
// };

// export const likePost = async (postId: string, userId: string) => {
//   try {
//     const existingLikes = await pb.collection("liked_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingLikes.items.length > 0) {
//       return existingLikes.items[0];
//     }

//     const likeRecord = await pb.collection("liked_posts").create({
//       post: postId,
//       user: userId,
//     });

//     const post = await pb.collection("posts").getOne(postId);
//     const updatedLikes = [...(post.likes || [])];

//     if (!updatedLikes.includes(userId)) {
//       updatedLikes.push(userId);
//       await pb.collection("posts").update(postId, {
//         likes: updatedLikes,
//       });
//     }

//     return likeRecord;
//   } catch (error) {
//     console.error("Failed to like post:", error);
//     throw error;
//   }
// };

// export const unlikePost = async (postId: string, userId: string) => {
//   try {
//     const existingLikes = await pb.collection("liked_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingLikes.items.length > 0) {
//       await pb.collection("liked_posts").delete(existingLikes.items[0].id);
//     }

//     const post = await pb.collection("posts").getOne(postId);
//     const updatedLikes = (post.likes || []).filter(
//       (id: string) => id !== userId
//     );

//     await pb.collection("posts").update(postId, {
//       likes: updatedLikes,
//     });
//   } catch (error) {
//     console.error("Failed to unlike post:", error);
//     throw error;
//   }
// };

// export const hasUserLikedPost = async (postId: string, userId: string) => {
//   try {
//     const existingLikes = await pb.collection("liked_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     return existingLikes.items.length > 0;
//   } catch (error) {
//     console.error("Failed to check if user liked post:", error);
//     return false;
//   }
// };

// export const savePost = async (postId: string, userId: string) => {
//   try {
//     const existingSaves = await pb.collection("saved_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingSaves.items.length > 0) {
//       return existingSaves.items[0];
//     }

//     const saveRecord = await pb.collection("saved_posts").create({
//       post: postId,
//       user: userId,
//     });

//     return saveRecord;
//   } catch (error) {
//     console.error("Failed to save post:", error);
//     throw error;
//   }
// };

// export const unsavePost = async (postId: string, userId: string) => {
//   try {
//     // Find the save record to delete
//     const existingSaves = await pb.collection("saved_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingSaves.items.length > 0) {
//       // Delete the save record
//       await pb.collection("saved_posts").delete(existingSaves.items[0].id);
//     }
//   } catch (error) {
//     console.error("Failed to unsave post:", error);
//     throw error;
//   }
// };

// export const hasUserSavedPost = async (postId: string, userId: string) => {
//   try {
//     const existingSaves = await pb.collection("saved_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     return existingSaves.items.length > 0;
//   } catch (error) {
//     console.error("Failed to check if user saved post:", error);
//     return false;
//   }
// };

// export const getSavedPosts = async (userId: string, page = 1, perPage = 20) => {
//   try {
//     const savedPostsRecords = await pb
//       .collection("saved_posts")
//       .getList(page, perPage, {
//         filter: `user="${userId}"`,
//         expand: "post,post.user",
//         sort: "-created",
//       });

//     // Process the items to make them match the format from getPosts
//     const processedItems = savedPostsRecords.items
//       .map((savedPost) => {
//         const post = savedPost.expand?.post;
//         if (!post) return null;

//         return {
//           ...post,
//           imageUrl: post.image ? pbFileUrl("posts", post.id, post.image) : null,
//           audioUrl: post.audio_url
//             ? pbFileUrl("posts", post.id, post.audio_url)
//             : null,
//           avatar: post.expand?.user?.avatar
//             ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
//             : "https://via.placeholder.com/100",
//           username: post.expand?.user?.name || "Unknown User",
//           timeAgo: formatTimeAgo(new Date(post.created)),
//           likes: post.likes?.length || 0,
//           shares: 0,
//           savedAt: savedPost.created,
//         };
//       })
//       .filter(Boolean);

//     return {
//       ...savedPostsRecords,
//       items: processedItems,
//     };
//   } catch (error) {
//     console.error("Failed to fetch saved posts:", error);
//     throw error;
//   }
// };

// export const getLikedPosts = async (userId: string, page = 1, perPage = 20) => {
//   try {
//     const likedPostsRecords = await pb
//       .collection("liked_posts")
//       .getList(page, perPage, {
//         filter: `user="${userId}"`,
//         expand: "post,post.user",
//         sort: "-created",
//       });

//     const processedItems = likedPostsRecords.items
//       .map((likedPost) => {
//         const post = likedPost.expand?.post;
//         if (!post) return null;

//         return {
//           ...post,
//           imageUrl: post.image ? pbFileUrl("posts", post.id, post.image) : null,
//           audioUrl: post.audio_url
//             ? pbFileUrl("posts", post.id, post.audio_url)
//             : null,
//           avatar: post.expand?.user?.avatar
//             ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
//             : "https://via.placeholder.com/100",
//           username: post.expand?.user?.name || "Unknown User",
//           timeAgo: formatTimeAgo(new Date(post.created)),
//           likes: post.likes?.length || 0,
//           shares: 0,
//           likedAt: likedPost.created,
//         };
//       })
//       .filter(Boolean);
//     console.log("likedPostsRecords", likedPostsRecords);
//     return {
//       ...likedPostsRecords,
//       items: processedItems,
//     };
//   } catch (error) {
//     console.error("Failed to fetch liked posts:", error);
//     throw error;
//   }
// };
// export const formatTimeAgo = (date: Date): string => {
//   const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

//   let interval = seconds / 31536000; // years
//   if (interval > 1) return Math.floor(interval) + " years ago";

//   interval = seconds / 2592000; // months
//   if (interval > 1) return Math.floor(interval) + " months ago";

//   interval = seconds / 86400; // days
//   if (interval > 1) return Math.floor(interval) + " days ago";

//   interval = seconds / 3600; // hours
//   if (interval > 1) return Math.floor(interval) + " hours ago";

//   interval = seconds / 60; // minutes
//   if (interval > 1) return Math.floor(interval) + " minutes ago";

//   return Math.floor(seconds) + " seconds ago";
// };

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

// export const getPosts = async ({ page = 1, perPage = 10, userId = "" }) => {
//   try {
//     let postsQuery = pb.collection("posts").getList(page, perPage, {
//       expand: "user",
//       sort: "-created",
//     });

//     if (userId) {
//       postsQuery = postsQuery.then(async (posts) => {
//         const [likedPosts, savedPosts] = await Promise.all([
//           pb.collection("liked_posts").getFullList({
//             filter: `user="${userId}"`,
//           }),
//           pb.collection("saved_posts").getFullList({
//             filter: `user="${userId}"`,
//           }),
//         ]);

//         return {
//           ...posts,
//           items: posts.items.map((post) => ({
//             ...post,
//             imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//             audioUrl: post.audio_url
//               ? pb.files.getUrl(post, post.audio_url)
//               : null,
//             avatar: post.expand?.user?.avatar
//               ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//               : "https://via.placeholder.com/100",
//             username: post.expand?.user?.name || "Unknown User",
//             timeAgo: formatTimeAgo(new Date(post.created)),
//             likes: post.likes?.length || 0,
//             shares: 0,
//             isLiked: likedPosts.some((lp) => lp.post === post.id),
//             isSaved: savedPosts.some((sp) => sp.post === post.id),
//           })),
//         };
//       });
//     } else {
//       postsQuery = postsQuery.then((posts) => ({
//         ...posts,
//         items: posts.items.map((post) => ({
//           ...post,
//           imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//           audioUrl: post.audio_url
//             ? pb.files.getUrl(post, post.audio_url)
//             : null,
//           avatar: post.expand?.user?.avatar
//             ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//             : "https://via.placeholder.com/100",
//           username: post.expand?.user?.name || "Unknown User",
//           timeAgo: formatTimeAgo(new Date(post.created)),
//           likes: post.likes?.length || 0,
//           shares: 0,
//           isLiked: false,
//           isSaved: false,
//         })),
//       }));
//     }

//     return postsQuery;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     throw error;
//   }
// };

// Same approach for saved posts

// export const getPosts = async ({
//   page = 1,
//   perPage = 10,
//   userId = "",
//   filter = "",
// }) => {
//   try {
//     let postsQuery = pb.collection("posts").getList(page, perPage, {
//       expand: "user,likes",
//       sort: "-created",
//     });

//     if (userId) {
//       postsQuery = postsQuery.then(async (posts) => {
//         const [likedPosts, savedPosts] = await Promise.all([
//           pb.collection("liked_posts").getFullList({
//             filter: `user="${userId} "`,
//           }),
//           pb.collection("saved_posts").getFullList({
//             filter: `user="${userId}"`,
//           }),
//         ]);

//         return {
//           ...posts,
//           items: posts.items.map((post) => {
//             const isLiked = likedPosts.some((lp) => lp.post === post.id);

//             return {
//               ...post,
//               imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//               audioUrl: post.audio_url
//                 ? pb.files.getUrl(post, post.audio_url)
//                 : null,
//               avatar: post.expand?.user?.avatar
//                 ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//                 : "https://via.placeholder.com/100",
//               username: post.expand?.user?.name || "Unknown User",
//               timeAgo: formatTimeAgo(new Date(post.created)),
//               likes: post.likes || 0,
//               shares: 0,
//               isLiked: isLiked,
//               isSaved: savedPosts.some((sp) => sp.post === post.id),
//             };
//           }),
//         };
//       });
//     } else {
//       postsQuery = postsQuery.then((posts) => ({
//         ...posts,
//         items: posts.items.map((post) => {
//           return {
//             ...post,
//             imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//             audioUrl: post.audio_url
//               ? pb.files.getUrl(post, post.audio_url)
//               : null,
//             avatar: post.expand?.user?.avatar
//               ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//               : "https://via.placeholder.com/100",
//             username: post.expand?.user?.name || "Unknown User",
//             timeAgo: formatTimeAgo(new Date(post.created)),
//             likes: post.likes || 0, // Use likes count directly from the post
//             shares: 0,
//             isLiked: false,
//           };
//         }),
//       }));
//     }

//     return postsQuery;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     throw error;
//   }
// };
// export const getPosts = async ({
//   page = 1,
//   perPage = 10,
//   userId = "",
//   filter = "",
// }) => {
//   try {
//     // Create the query options with filter if provided
//     const options = {
//       expand: "user",
//       sort: "-created",
//     };

//     // Add filter to options if provided
//     if (filter) {
//       options.filter = filter;
//     }

//     let postsQuery = pb.collection("posts").getList(page, perPage, options);

//     if (userId) {
//       postsQuery = postsQuery.then(async (posts) => {
//         const [likedPosts, savedPosts] = await Promise.all([
//           pb.collection("liked_posts").getFullList({
//             filter: `user="${userId}"`,
//           }),
//           pb.collection("saved_posts").getFullList({
//             filter: `user="${userId}"`,
//           }),
//         ]);

//         return {
//           ...posts,
//           items: posts.items.map((post) => {
//             const isLiked = likedPosts.some((lp) => lp.post === post.id);

//             return {
//               ...post,
//               imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//               audioUrl: post.audio_url
//                 ? pb.files.getUrl(post, post.audio_url)
//                 : null,
//               avatar: post.expand?.user?.avatar
//                 ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//                 : "https://via.placeholder.com/100",
//               username: post.expand?.user?.name || "Unknown User",
//               timeAgo: formatTimeAgo(new Date(post.created)),
//               likes: post.likes || 0,
//               shares: 0,
//               isLiked: isLiked,
//               isSaved: savedPosts.some((sp) => sp.post === post.id),
//             };
//           }),
//         };
//       });
//     } else {
//       postsQuery = postsQuery.then((posts) => ({
//         ...posts,
//         items: posts.items.map((post) => {
//           return {
//             ...post,
//             imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
//             audioUrl: post.audio_url
//               ? pb.files.getUrl(post, post.audio_url)
//               : null,
//             avatar: post.expand?.user?.avatar
//               ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
//               : "https://via.placeholder.com/100",
//             username: post.expand?.user?.name || "Unknown User",
//             timeAgo: formatTimeAgo(new Date(post.created)),
//             likes: post.likes || 0,
//             shares: 0,
//             isLiked: false,
//           };
//         }),
//       }));
//     }

//     return postsQuery;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     throw error;
//   }
// };
export const getSavedPosts = async (userId: any, page = 1, perPage = 20) => {
  try {
    const savedPostsRecords = await pb
      .collection("saved_posts")
      .getList(page, perPage, {
        filter: `user="${userId}"`,
        expand: "post,post.user",
        sort: "-created",
      });

    const processedItems = await Promise.all(
      savedPostsRecords.items
        .map(async (savedPost) => {
          const post = savedPost.expand?.post;
          if (!post) return null;

          return {
            ...post,
            id: post.id,
            userId: post.user,
            imageUrl: post.image
              ? pbFileUrl("posts", post.id, post.image)
              : null,
            audioUrl: post.audio_url
              ? pbFileUrl("posts", post.id, post.audio_url)
              : null,
            avatar: post.expand?.user?.avatar
              ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
              : "https://via.placeholder.com/100",
            username: post.expand?.user?.name || "Unknown User",
            timeAgo: formatTimeAgo(new Date(post.created)),
            likes: post.likes || 0,
            shares: 0,
            savedAt: savedPost.created,
            isLiked: false,
            isSaved: true,
          };
        })
        .filter(Boolean)
    );

    // Check which posts are liked
    if (userId) {
      for (let post of processedItems) {
        try {
          const likedResult = await pb.collection("liked_posts").getList(1, 1, {
            filter: `post="${post.id}" && user="${userId}"`,
          });
          post.isLiked = likedResult.items.length > 0;
        } catch (error) {
          console.log("Error checking like status:", error);
        }
      }
    }

    return {
      ...savedPostsRecords,
      items: processedItems,
    };
  } catch (error) {
    console.error("Failed to fetch saved posts:", error);
    throw error;
  }
};

// export const likePost = async (postId: string, userId: any) => {
//   try {
//     const existingLikes = await pb.collection("liked_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingLikes.items.length > 0) {
//       return { success: true, isLiked: true };
//     }

//     await pb.collection("liked_posts").create({
//       post: postId,
//       user: userId,
//     });

//     const post = await pb.collection("posts").getOne(postId);
//     const updatedLikes = [...(post.likes || [])];

//     if (!updatedLikes.includes(userId)) {
//       updatedLikes.push(userId);
//       await pb.collection("posts").update(postId, {
//         likes: updatedLikes,
//       });
//     }

//     return { success: true, isLiked: true };
//   } catch (error) {
//     console.error("Failed to like post:", error);
//     return { success: false, isLiked: false };
//   }
// };

// export const unlikePost = async (postId: string, userId: any) => {
//   try {
//     const existingLikes = await pb.collection("liked_posts").getList(1, 1, {
//       filter: `post="${postId}" && user="${userId}"`,
//     });

//     if (existingLikes.items.length > 0) {
//       await pb.collection("liked_posts").delete(existingLikes.items[0].id);
//     }

//     const post = await pb.collection("posts").getOne(postId);
//     const updatedLikes = (post.likes || []).filter((id: any) => id !== userId);

//     await pb.collection("posts").update(postId, {
//       likes: updatedLikes,
//     });

//     return { success: true, isLiked: false };
//   } catch (error) {
//     console.error("Failed to unlike post:", error);
//     return { success: false, isLiked: true };
//   }
// };

export const savePost = async (postId: any, userId: any) => {
  try {
    const existingSaves = await pb.collection("saved_posts").getList(1, 1, {
      filter: `post="${postId}" && user="${userId}"`,
    });

    if (existingSaves.items.length > 0) {
      return { success: true, isSaved: true };
    }

    await pb.collection("saved_posts").create({
      post: postId,
      user: userId,
    });

    return { success: true, isSaved: true };
  } catch (error) {
    console.error("Failed to save post:", error);
    return { success: false, isSaved: false };
  }
};

export const unsavePost = async (postId: any, userId: any) => {
  try {
    const existingSaves = await pb.collection("saved_posts").getList(1, 1, {
      filter: `post="${postId}" && user="${userId}"`,
    });

    if (existingSaves.items.length > 0) {
      await pb.collection("saved_posts").delete(existingSaves.items[0].id);
    }

    return { success: true, isSaved: false };
  } catch (error) {
    console.error("Failed to unsave post:", error);
    return { success: false, isSaved: true };
  }
};
export const likePost = async (postId: string, userId: string) => {
  try {
    const existingLike = await pb
      .collection("liked_posts")
      .getFirstListItem(`post="${postId}" && user="${userId}"`);

    return {
      success: true,
      isLiked: true,
      likeCount: existingLike.likeCount,
    };
  } catch (error) {
    await pb.collection("liked_posts").create({
      post: postId,
      user: userId,
    });

    const post = await pb.collection("posts").getOne(postId);
    const updatedLikeCount = (post.likes || 0) + 1;

    await pb.collection("posts").update(postId, {
      likes: updatedLikeCount,
    });

    return {
      success: true,
      isLiked: true,
      likeCount: updatedLikeCount,
    };
  }
};

export const unlikePost = async (postId: string, userId: string) => {
  try {
    const existingLike = await pb
      .collection("liked_posts")
      .getFirstListItem(`post="${postId}" && user="${userId}"`);

    await pb.collection("liked_posts").delete(existingLike.id);

    // Update post like count
    const post = await pb.collection("posts").getOne(postId);
    const updatedLikeCount = Math.max((post.likes || 0) - 1, 0);

    await pb.collection("posts").update(postId, {
      likes: updatedLikeCount,
    });

    return {
      success: true,
      isLiked: false,
      likeCount: updatedLikeCount,
    };
  } catch (error) {
    console.error("Error unliking post:", error);
    return {
      success: false,
      isLiked: true,
      likeCount: 0,
    };
  }
};
export const getPosts = async ({
  page = 1,
  perPage = 10,
  userId = "",
  filter = "",
}) => {
  try {
    const options = {
      expand: "user",
      sort: "-created",
    };

    if (filter) {
      options.filter = filter;
    }

    let postsQuery = pb.collection("posts").getList(page, perPage, options);

    if (userId) {
      postsQuery = postsQuery.then(async (posts) => {
        try {
          let likedPosts = [];
          let savedPosts = [];

          try {
            likedPosts = await pb.collection("liked_posts").getFullList({
              filter: `user="${userId}"`,
            });
          } catch (likeError) {
            console.warn("Error fetching liked posts:", likeError);
          }

          try {
            savedPosts = await pb.collection("saved_posts").getFullList({
              filter: `user="${userId}"`,
            });
          } catch (saveError) {
            console.warn("Error fetching saved posts:", saveError);
          }

          return {
            ...posts,
            items: posts.items.map((post) => {
              const isLiked = likedPosts.some((lp) => lp.post === post.id);
              const isSaved = savedPosts.some((sp) => sp.post === post.id);

              return {
                ...post,
                imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
                audioUrl: post.audio_url
                  ? pb.files.getUrl(post, post.audio_url)
                  : null,
                avatar: post.expand?.user?.avatar
                  ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
                  : "https://via.placeholder.com/100",
                username: post.expand?.user?.name || "Unknown User",
                timeAgo: formatTimeAgo(new Date(post.created)),
                likes: post.likes || 0,
                shares: 0,
                isLiked: isLiked,
                isSaved: isSaved,
              };
            }),
          };
        } catch (innerError) {
          console.error("Error processing posts:", innerError);
          return {
            ...posts,
            items: posts.items.map((post) => ({
              ...post,
              imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
              audioUrl: post.audio_url
                ? pb.files.getUrl(post, post.audio_url)
                : null,
              avatar: "https://via.placeholder.com/100",
              username: post.expand?.user?.name || "Unknown User",
              timeAgo: formatTimeAgo(new Date(post.created)),
              likes: post.likes || 0,
              shares: 0,
              isLiked: false,
              isSaved: false,
            })),
          };
        }
      });
    } else {
      postsQuery = postsQuery.then((posts) => ({
        ...posts,
        items: posts.items.map((post) => {
          return {
            ...post,
            imageUrl: post.image ? pb.files.getUrl(post, post.image) : null,
            audioUrl: post.audio_url
              ? pb.files.getUrl(post, post.audio_url)
              : null,
            avatar: post.expand?.user?.avatar
              ? pb.files.getUrl(post.expand.user, post.expand.user.avatar)
              : "https://via.placeholder.com/100",
            username: post.expand?.user?.name || "Unknown User",
            timeAgo: formatTimeAgo(new Date(post.created)),
            likes: post.likes || 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
          };
        }),
      }));
    }

    return postsQuery;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { items: [], page, perPage, totalItems: 0, totalPages: 0 };
  }
};
