import { pb } from "@/components/pocketbaseClient";
import { Platform } from "react-native";
import { pbFileUrl } from "../getData/GetVideos";

function formatTimeAgo(date: number | Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

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

export const getPosts = async ({
  page = 1,
  perPage = 20,
  userId = null,
  sortBy = "-created",
  search = null,
}) => {
  try {
    let filterConditions = [];

    if (userId) {
      filterConditions.push(`user="${userId}"`);
    }
    if (search && search.trim()) {
      filterConditions.push(`caption ~ "${search.trim()}"`);
    }
    const filter =
      filterConditions.length > 0 ? filterConditions.join(" && ") : "";

    const records = await pb.collection("posts").getList(page, perPage, {
      sort: sortBy,
      filter,
      expand: "user",
    });
    const processedItems = records.items.map((post) => {
      return {
        ...post,
        imageUrl: post.image ? pbFileUrl("posts", post.id, post.image) : null,
        audioUrl: post.audio_url
          ? pbFileUrl("posts", post.id, post.audio_url)
          : null,
        avatar: post.expand?.user?.avatar
          ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
          : "https://via.placeholder.com/100",
        username: post.expand?.user?.name || "Unknown User",
        timeAgo: formatTimeAgo(new Date(post.created)),
        likes: post.likes?.length || 0,
        shares: 0,
      };
    });

    return {
      ...records,
      items: processedItems,
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw error;
  }
};

export const getPostById = async (postId: string) => {
  try {
    const record = await pb.collection("posts").getOne(postId, {
      expand: "user",
    });
    return record;
  } catch (error) {
    console.error(`Failed to fetch post ${postId}:`, error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    await pb.collection("posts").delete(postId);
  } catch (error) {
    console.error(`Failed to delete post ${postId}:`, error);
    throw error;
  }
};
