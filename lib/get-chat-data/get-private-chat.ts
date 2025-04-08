import { pb } from "@/components/pocketbaseClient";

export async function sendPrivateMessage(
  sender: string,
  recipient: string,
  messageContent: string,
  audioFile: File | null = null
) {
  try {
    // Check if a chat exists between the users
    let chatId = await getChatId(sender, recipient);

    // If no chat exists, create a new one
    if (!chatId) {
      chatId = await createNewChat(sender, recipient);
    }

    // Prepare message data
    const formData = new FormData();
    formData.append("chat", chatId);
    formData.append("sender", sender);
    formData.append("content", messageContent);
    formData.append("read", "false");

    // Add audio file if provided
    if (audioFile) {
      formData.append("audio_file", audioFile);
    }

    // Save the message to private_messages collection
    const createdMessage = await pb
      .collection("private_messages")
      .create(formData);

    // Update the last_seen timestamp in private_chats
    await updateChatLastSeen(chatId);

    return { success: true, messageId: createdMessage.id, chatId };
  } catch (error: any) {
    console.error("Error sending private message:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to check if a chat exists between two users
export async function getChatId(user1: string, user2: string) {
  try {
    // Query PocketBase to find a chat where these two users are participants
    // We need to check both combinations: (user1, user2) and (user2, user1)
    const chatRecords = await pb.collection("private_chats").getList(1, 1, {
      filter: `(user1="${user1}" && user2="${user2}") || (user1="${user2}" && user2="${user1}")`,
    });

    // Return the chat ID if found, otherwise null
    return chatRecords.items.length > 0 ? chatRecords.items[0].id : null;
  } catch (error) {
    console.error("Error finding chat:", error);
    throw error;
  }
}

// Helper function to create a new chat between two users
export async function createNewChat(user1: string, user2: string) {
  try {
    // Create a new chat record in PocketBase
    const newChat = await pb.collection("private_chats").create({
      user1: user1,
      user2: user2,
      last_seen: new Date().toISOString(),
    });

    return newChat.id;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw error;
  }
}

// Helper function to update the last_seen timestamp
export async function updateChatLastSeen(chatId: string) {
  try {
    await pb.collection("private_chats").update(chatId, {
      last_seen: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating chat last_seen:", error);
    throw error;
  }
}

// Function to mark a message as read
export async function markMessageAsRead(messageId: string) {
  try {
    await pb.collection("private_messages").update(messageId, {
      read: true,
      read_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return { success: false, error: error.message };
  }
}

// Function to get all messages for a specific chat
export async function getChatMessages(
  chatId: string,
  page: number = 1,
  perPage: number = 20
) {
  try {
    const messages = await pb
      .collection("private_messages")
      .getList(page, perPage, {
        filter: `chat="${chatId}"`,
        sort: "-created",
      });

    return {
      success: true,
      messages: messages.items,
      totalItems: messages.totalItems,
    };
  } catch (error: any) {
    console.error("Error getting chat messages:", error);
    return { success: false, error: error.message };
  }
}

// Function to get all chats for a specific user
export async function getUserChats(
  userId: string,
  page: number = 1,
  perPage: number = 20
) {
  try {
    const chats = await pb.collection("private_chats").getList(page, perPage, {
      filter: `user1="${userId}" || user2="${userId}"`,
      sort: "-last_seen",
    });

    return { success: true, chats: chats.items, totalItems: chats.totalItems };
  } catch (error: any) {
    console.error("Error getting user chats:", error);
    return { success: false, error: error.message };
  }
}

// Function to get unread message count for a user
export async function getUnreadMessageCount(userId: string) {
  try {
    const result = await pb.collection("private_messages").getList(1, 1, {
      filter: `sender!="${userId}" && read=false`,
      countOnly: true,
    });

    return { success: true, count: result.totalItems };
  } catch (error: any) {
    console.error("Error getting unread message count:", error);
    return { success: false, error: error.message };
  }
}
