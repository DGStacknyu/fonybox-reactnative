import { pb } from "@/components/pocketbaseClient";

export const getUserData = async ({ userId }: any) => {
  try {
    const records = await pb.collection("users").getOne(userId);

    const formattedUser = {
      id: records.id,
      name: records.name || `User ${records.id.substring(0, 4)}`,
      initial: (records.name || "").charAt(0).toUpperCase(),
      status: records.online ? "Online" : "Offline",
      collectionId: records.collectionId,
      username: records.username,
      avatar: records.avatar,
    };

    return formattedUser;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};
