import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb } from "@/components/pocketbaseClient";
import { getGroupChatDetails } from "@/lib/get-chat-data/get-group-chat";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { preloadAudioDurations } from "./audioHelpers";

// Cache to store loaded group data
export const groupCache = new Map();

export const getColorFromId = (id: string): string => {
  if (!id) return "#E3F5FF";

  const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
  const sumChars = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[sumChars % colors.length];
};

// Initial placeholder for group chats
export const getPlaceholderGroup = (
  id: string,
  name = "Loading...",
  avatar = null
) => ({
  id,
  name: name || "Loading...",
  description: "",
  avatar: avatar || null,
  initial: (name?.charAt(0) || "G").toUpperCase(),
  color: getColorFromId(id),
  memberCount: 0,
  members: [],
  messages: [],
  isPlaceholder: true,
});

export const processMessages = (
  messages: any[],
  userId: any,
  audioDurations: Record<string, string> = {}
) => {
  return messages.map(
    (message: {
      id: string;
      type: any;
      content: any;
      audio_url: string;
      collectionId: string;
      created: string | number | Date;
      expand: { sender: { id: any; name: any } };
    }) => {
      return {
        id: message.id,
        type: message.type || "voice",
        content: message.content,
        audio_url: message.audio_url
          ? pbFileUrl(message.collectionId, message.id, message.audio_url)
          : null,
        created: message.created,
        isSent: message.expand?.sender?.id === userId,
        isPlaying: false,
        duration: audioDurations[message.id] || "0:00", // Use preloaded duration or default
        timestamp: new Date(message.created).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: {
          id: message.expand?.sender?.id || "unknown",
          name: message.expand?.sender?.name || "Unknown User",
        },
      };
    }
  );
};

export const preloadGroups = async (userId: any) => {
  try {
    // Fetch list of user's groups
    const userGroups = await pb.collection("group_members").getList(1, 20, {
      filter: `user="${userId}"`,
      expand: "group",
    });

    // Create placeholder entries for each group
    userGroups.items.forEach((membership) => {
      if (membership.expand?.group) {
        const group = membership.expand.group;
        const groupId = group.id;

        // Only create placeholder if not already in cache
        if (!groupCache.has(groupId)) {
          const placeholder = getPlaceholderGroup(
            groupId,
            group.name,
            pbFileUrl(group.collectionId, group.id, group.image)
          );
          groupCache.set(groupId, placeholder);
        }
      }
    });

    console.log(`Preloaded ${userGroups.items.length} group placeholders`);
  } catch (err) {
    console.error("Error preloading groups:", err);
  }
};

export const loadGroupData = async (
  id: string,
  userId: any,
  updateCallback: (arg0: {
    id: string;
    name: any;
    description: any;
    avatar: string;
    initial: any;
    color: string;
    memberCount: number;
    members: {
      id: string;
      name: any;
      isAdmin: boolean;
      color: string;
      initial: any;
      status: string;
    }[];
    messages: any;
    isPlaceholder: boolean;
  }) => void,
  setError: (arg0: string) => void
) => {
  try {
    const details = await getGroupChatDetails(id);

    const quickProcessedMessages = processMessages(
      details.messages || [],
      userId
    );

    const initialDetails = {
      id: details.id,
      name: details.name || "Unnamed Group",
      description: details.description || "",
      avatar: pbFileUrl(details.collectionId, details.id, details.image),
      initial: (details.name?.charAt(0) || "G").toUpperCase(),
      color: getColorFromId(details.id),
      memberCount: details.members?.length || 0,
      members:
        details.members?.map((member) => ({
          id: member.id,
          name: member.expand?.user?.name || "Unknown User",
          isAdmin: member.role === "admin",
          color: getColorFromId(member.id),
          initial: (member.expand?.user?.name?.charAt(0) || "U").toUpperCase(),
          status: "Online",
        })) || [],
      messages: quickProcessedMessages,
      isPlaceholder: false,
    };

    // Save basic group info to AsyncStorage for future fast loads
    try {
      const groupInfoKey = `group_info_${id}`;
      const groupInfo = {
        name: initialDetails.name,
        avatar: initialDetails.avatar,
      };
      await AsyncStorage.setItem(groupInfoKey, JSON.stringify(groupInfo));
    } catch (storageErr) {
      console.log("Could not save group info to storage:", storageErr);
    }

    // Update UI with quick data
    updateCallback(initialDetails);

    // Store in cache
    groupCache.set(id, initialDetails);

    // Load audio durations in background
    const audioDurations = await preloadAudioDurations(details.messages || []);

    // Process messages with durations
    const messagesWithDurations = processMessages(
      details.messages || [],
      userId,
      audioDurations
    );

    const fullDetails = {
      ...initialDetails,
      messages: messagesWithDurations,
    };

    updateCallback(fullDetails);

    groupCache.set(id, fullDetails);

    return fullDetails;
  } catch (err) {
    console.error("Error loading group data:", err);
    setError("Failed to load group chat details");
    return null;
  }
};
