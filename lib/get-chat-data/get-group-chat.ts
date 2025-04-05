import { pb } from "@/components/pocketbaseClient";

export const getGroupChats = async () => {
  try {
    const records = await pb.collection("groups").getList(1, 50, {
      sort: "-created",
      expand: "created_by",
    });
    return records;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const getGroupChatsMetaData = async () => {
  try {
    // Fetch all groups
    const groups = await pb.collection("groups").getList(1, 50, {
      sort: "-created",
    });

    const groupsWithMetadata = await Promise.all(
      groups.items.map(async (group) => {
        const members = await pb.collection("group_members").getList(1, 1, {
          filter: `group = "${group.id}"`,
        });

        const memberCount = members.totalItems;
        const messages = await pb.collection("group_messages").getList(1, 1, {
          filter: `group = "${group.id}"`,
          sort: "-created",
        });

        return {
          ...group,
          memberCount,
          lastMessage: messages.items.length > 0 ? messages.items[0] : null,
        };
      })
    );

    return {
      ...groups,
      items: groupsWithMetadata,
    };
  } catch (error) {
    console.error("Error fetching group chats:", error);
    throw error;
  }
};

export const getGroupChatDetails = async (groupId: string) => {
  try {
    const group = await pb.collection("groups").getOne(groupId);

    const members = await pb.collection("group_members").getList(1, 100, {
      filter: `group = "${groupId}"`,
      expand: "user",
    });

    const messages = await pb.collection("group_messages").getList(1, 50, {
      filter: `group = "${groupId}"`,
      sort: "created",
      expand: "sender",
    });

    let processedMessages = messages.items;
    return {
      ...group,
      members: members.items,
      messages: processedMessages,
    };
  } catch (error) {
    console.error(`Error fetching group chat details for ${groupId}:`, error);
    throw error;
  }
};
