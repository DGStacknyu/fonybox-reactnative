import { pb } from "@/components/pocketbaseClient";

export const pbFileUrl = (
  collectionId: string,
  recordId: string,
  fileName: string,
  options: { size?: string; token?: string; download?: boolean } = {}
): string => {
  if (!collectionId || !recordId || !fileName) {
    throw new Error(
      "collectionId, recordId, and fileName are required parameters."
    );
  }
  let url = `${pb.baseURL}/api/files/${collectionId}/${recordId}/${fileName}`;

  const params = new URLSearchParams();
  if (options.size) {
    params.append("thumb", options.size);
  }
  if (options.token) {
    params.append("token", options.token);
  }
  if (options.download !== undefined) {
    params.append("download", "1");
  }
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
};

export const getVideos = async () => {
  try {
    const records = await pb.collection("videos").getList(1, 50, {
      sort: "-created",
      expand: "user",
    });

    const formattedVideos = records.items.map((video) => {
      if (video.expand && video.expand.user) {
        return {
          ...video,
          creator: video.expand.user.username,
        };
      }
      return {
        ...video,
        creator: "Unknown",
      };
    });

    return formattedVideos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

// Function to get trending videos (most recent 7)
export const getTrendingVideos = async () => {
  try {
    // Important: Need to expand user here too!
    const records = await pb.collection("videos").getList(1, 7, {
      sort: "-created",
      expand: "user", // Add this to match getVideos
    });

    const formattedVideos = records.items.map((video) => {
      if (video.expand && video.expand.user) {
        return {
          ...video,
          creator: video.expand.user.username,
        };
      }
      return {
        ...video,
        creator: "Unknown",
      };
    });

    return formattedVideos;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    throw error;
  }
};

export const searchVideos = async (searchQuery: string) => {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return [];
    }
    console.log("searchQuery", searchQuery);
    const records = await pb.collection("videos").getList(1, 50, {
      sort: "-created",
      expand: "user",
      filter: `title ~ "${searchQuery}"`,
    });

    const formattedVideos = records.items.map((video) => {
      if (video.expand && video.expand.user) {
        return {
          ...video,
          creator: video.expand.user.username,
        };
      }
      return {
        ...video,
        creator: "Unknown",
      };
    });

    return formattedVideos;
  } catch (error) {
    console.error("Error searching videos:", error);
    throw error;
  }
};
