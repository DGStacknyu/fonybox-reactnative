// 1. First, let's create a hook to manage real-time subscriptions
import { useEffect, useState, useRef } from "react";
import { pb } from "@/components/pocketbaseClient";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { Audio } from "expo-av";
import { formatDuration } from "@/utils/audio/audioHelpers";

// Hook for real-time group list updates
export const useRealtimeGroupChats = (userId: string) => {
  const [groupChats, setGroupChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const subscriptionsRef = useRef<{ [key: string]: () => void }>({});

  const getAudioDuration = async (audioUrl: string) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: audioUrl });
      const status = await soundObject.getStatusAsync();

      let duration = "0:00";
      if (status.isLoaded && status.durationMillis) {
        duration = formatDuration(status.durationMillis);
      }

      await soundObject.unloadAsync();
      return duration;
    } catch (error) {
      console.log("Error loading audio duration:", error);
      return "0:00";
    }
  };

  const getColorFromId = (id: string): string => {
    const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
    const sumChars = id
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sumChars % colors.length];
  };

  const fetchGroupChats = async () => {
    try {
      setLoading(true);

      const fetchedGroups = await pb.collection("groups").getFullList({
        sort: "-created",
        expand: "created_by,members.user",
        requestKey: null,
      });

      const processedGroupsPromises = fetchedGroups.map(async (group) => {
        let lastMessage = null;
        let unread = false;
        let messageCount = 0;

        const memberCount = group.members?.length || 0;

        try {
          const lastMessageResult = await pb
            .collection("group_messages")
            .getFirstListItem(`group="${group.id}"`, {
              sort: "-created",
              expand: "sender",
            })
            .catch(() => null);

          if (lastMessageResult) {
            const message = lastMessageResult;

            try {
              const countResult = await pb
                .collection("group_messages")
                .getList(1, 1, {
                  filter: `group="${group.id}"`,
                  countOnly: true,
                });
              messageCount = countResult.totalItems;
            } catch (err) {
              console.log("Error getting message count:", err);
            }

            const messageType = message.type || "text";

            let senderName = "Unknown";
            if (message.expand?.sender?.name) {
              senderName = message.expand.sender.name;
            } else if (message.sender === userId) {
              senderName = "You";
            }

            const messageTimestamp = new Date(
              message.created
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            let duration = "0:00";
            let text = "";

            if (messageType === "voice") {
              let durationLoaded = false;

              if (message.metadata) {
                try {
                  let metadata = message.metadata;
                  if (typeof metadata === "string") {
                    metadata = JSON.parse(metadata);
                  }

                  if (metadata && metadata.durationSeconds) {
                    duration = formatDuration(metadata.durationSeconds * 1000);
                    durationLoaded = true;
                  }
                } catch (e) {
                  console.log("Error parsing metadata:", e);
                }
              }

              if (!durationLoaded && message.audio_url) {
                try {
                  const audioUrl = pbFileUrl(
                    message.collectionId,
                    message.id,
                    message.audio_url
                  );

                  duration = await getAudioDuration(audioUrl);
                } catch (e) {
                  console.log(`Error loading audio for group ${group.id}:`, e);
                }
              }

              text = "Voice message";
            } else {
              text = message.content || "Message";
            }

            lastMessage = {
              id: message.id,
              type: messageType,
              sender: senderName,
              duration: duration,
              timestamp: messageTimestamp,
              text: text,
            };
          }
        } catch (err) {
          console.error(
            `Failed to get message data for group ${group.id}:`,
            err
          );
        }

        return {
          id: group.id,
          name: group.name || "Unnamed Group",
          avatar: pbFileUrl(group.collectionId, group.id, group.image),
          initial: (group.name?.charAt(0) || "G").toUpperCase(),
          color: getColorFromId(group.id),
          description: group.description || "",
          memberCount,
          lastMessage,
          unread,
          messageCount,
        };
      });

      const processedGroups = await Promise.all(processedGroupsPromises);

      processedGroups.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;

        const timestampA = a.lastMessage.timestamp;
        const timestampB = b.lastMessage.timestamp;

        // Convert timestamps to comparable values
        const dateA = new Date(timestampA);
        const dateB = new Date(timestampB);

        return dateB.getTime() - dateA.getTime();
      });

      setGroupChats(processedGroups);
      setupSubscriptions(processedGroups);
    } catch (err) {
      setError("Failed to load groups");
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupWithNewMessage = async (
    groupId: string,
    messageRecord: any,
    action: string
  ) => {
    try {
      // Fetch the sender information
      let sender;
      try {
        sender = await pb.collection("users").getOne(messageRecord.sender);
      } catch (err) {
        console.log("Error fetching sender:", err);
      }

      // Create the processed message
      const messageType = messageRecord.type || "text";
      let senderName = "Unknown";

      if (sender?.name) {
        senderName = sender.name;
      } else if (messageRecord.sender === userId) {
        senderName = "You";
      }

      const messageTimestamp = new Date(
        messageRecord.created
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let duration = "0:00";
      let text = "";

      if (messageType === "voice") {
        let durationLoaded = false;

        if (messageRecord.metadata) {
          try {
            let metadata = messageRecord.metadata;
            if (typeof metadata === "string") {
              metadata = JSON.parse(metadata);
            }

            if (metadata && metadata.durationSeconds) {
              duration = formatDuration(metadata.durationSeconds * 1000);
              durationLoaded = true;
            }
          } catch (e) {
            console.log("Error parsing metadata:", e);
          }
        }

        if (!durationLoaded && messageRecord.audio_url) {
          try {
            const audioUrl = pbFileUrl(
              messageRecord.collectionId,
              messageRecord.id,
              messageRecord.audio_url
            );

            duration = await getAudioDuration(audioUrl);
          } catch (e) {
            console.log(`Error loading audio for message:`, e);
          }
        }

        text = "Voice message";
      } else {
        text = messageRecord.content || "Message";
      }

      const newLastMessage = {
        id: messageRecord.id,
        type: messageType,
        sender: senderName,
        duration: duration,
        timestamp: messageTimestamp,
        text: text,
      };

      // Update the groups state
      setGroupChats((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              lastMessage: newLastMessage,
              messageCount: group.messageCount + 1,
              // Move the updated group to the top
            };
          }
          return group;
        });

        // Sort the groups to move the updated one to the top
        updatedGroups.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;

          const timestampA = a.lastMessage.timestamp;
          const timestampB = b.lastMessage.timestamp;

          // Convert timestamps to comparable values
          const dateA = new Date(timestampA);
          const dateB = new Date(timestampB);

          return dateB.getTime() - dateA.getTime();
        });

        return updatedGroups;
      });
    } catch (err) {
      console.error("Error updating group with new message:", err);
    }
  };

  const setupSubscriptions = (groups: any[]) => {
    // Clear previous subscriptions
    cleanupSubscriptions();

    // Subscribe to all group_messages
    const groupMessagesSub = pb
      .collection("group_messages")
      .subscribe("*", async (e) => {
        console.log("Message event:", e.action);

        if (e.action === "create") {
          const groupId = e.record.group;
          await updateGroupWithNewMessage(groupId, e.record, e.action);
        }
      });

    subscriptionsRef.current["group_messages"] = () => {
      pb.collection("group_messages").unsubscribe("*");
    };

    // For each group, subscribe to membership changes
    groups.forEach((group) => {
      const groupMembersSub = pb.collection("group_members").subscribe(
        "*",
        async (e) => {
          if (e.record.group === group.id) {
            await fetchGroupChats();
          }
        },
        {
          filter: `group="${group.id}"`,
        }
      );

      subscriptionsRef.current[`group_members_${group.id}`] = () => {
        pb.collection("group_members").unsubscribe("*");
      };
    });

    // Subscribe to new groups being created
    const groupsSub = pb.collection("groups").subscribe("*", async (e) => {
      if (e.action === "create") {
        // A new group was created, refresh the list
        await fetchGroupChats();
      } else if (e.action === "update") {
        // A group was updated, refresh the list
        await fetchGroupChats();
      }
    });

    subscriptionsRef.current["groups"] = () => {
      pb.collection("groups").unsubscribe("*");
    };
  };

  const cleanupSubscriptions = () => {
    Object.values(subscriptionsRef.current).forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    subscriptionsRef.current = {};
  };

  useEffect(() => {
    fetchGroupChats();

    return () => {
      cleanupSubscriptions();
    };
  }, [userId]);

  return {
    groupChats,
    loading,
    error,
    refreshGroups: fetchGroupChats,
  };
};

// 2. Hook for real-time individual chat updates
export const useRealtimeGroupChat = (groupId: string, userId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const subscriptionsRef = useRef<{ [key: string]: () => void }>({});

  const processMessages = (
    messages: any[],
    audioDurations: Record<string, string> = {}
  ) => {
    return messages.map((message) => {
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
        duration: audioDurations[message.id] || "0:00",
        timestamp: new Date(message.created).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: {
          id: message.expand?.sender?.id || "unknown",
          name: message.expand?.sender?.name || "Unknown User",
        },
      };
    });
  };

  const getColorFromId = (id: string): string => {
    const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
    const sumChars = id
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sumChars % colors.length];
  };

  const fetchGroupChatDetails = async () => {
    try {
      setLoading(true);

      // Fetch group details
      const groupData = await pb.collection("groups").getOne(groupId, {
        expand: "members.user",
      });

      // Fetch messages
      const messagesData = await pb
        .collection("group_messages")
        .getList(1, 100, {
          filter: `group="${groupId}"`,
          sort: "created",
          expand: "sender",
        });

      const processedMessages = processMessages(messagesData.items);

      // Process group details
      const details = {
        id: groupData.id,
        name: groupData.name || "Unnamed Group",
        description: groupData.description || "",
        avatar: pbFileUrl(
          groupData.collectionId,
          groupData.id,
          groupData.image
        ),
        initial: (groupData.name?.charAt(0) || "G").toUpperCase(),
        color: getColorFromId(groupData.id),
        memberCount: groupData.expand?.members?.length || 0,
        members:
          groupData.expand?.members?.map((member: any) => ({
            id: member.id,
            name: member.expand?.user?.name || "Unknown User",
            isAdmin: member.role === "admin",
            color: getColorFromId(member.id),
            initial: (
              member.expand?.user?.name?.charAt(0) || "U"
            ).toUpperCase(),
            status: "Online",
          })) || [],
        messages: processedMessages,
        isPlaceholder: false,
      };

      setGroupDetails(details);
      setMessages(processedMessages);
      setupSubscriptions();
    } catch (err) {
      console.error("Error loading group chat details:", err);
      setError("Failed to load group chat details");
    } finally {
      setLoading(false);
    }
  };

  const setupSubscriptions = () => {
    // Clear previous subscriptions
    cleanupSubscriptions();

    // Subscribe to messages for this specific group
    const messagesSub = pb
      .collection("group_messages")
      .subscribe("*", async (e) => {
        if (e.record.group === groupId) {
          if (e.action === "create") {
            // Fetch the newly created message with expanded sender
            try {
              const newMessage = await pb
                .collection("group_messages")
                .getOne(e.record.id, {
                  expand: "sender",
                });

              const processedNewMessage = processMessages([newMessage])[0];

              setMessages((prevMessages) => [
                ...prevMessages,
                processedNewMessage,
              ]);

              // Update group details with the new message
              setGroupDetails((prevDetails: any) => ({
                ...prevDetails,
                messages: [...prevDetails.messages, processedNewMessage],
              }));
            } catch (err) {
              console.error("Error fetching new message details:", err);
            }
          } else if (e.action === "update") {
            // A message was updated, refresh the list
            await fetchGroupChatDetails();
          } else if (e.action === "delete") {
            // A message was deleted, remove it from the list
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== e.record.id)
            );

            // Update group details
            setGroupDetails((prevDetails: any) => ({
              ...prevDetails,
              messages: prevDetails.messages.filter(
                (msg: any) => msg.id !== e.record.id
              ),
            }));
          }
        }
      });

    subscriptionsRef.current["messages"] = () => {
      pb.collection("group_messages").unsubscribe("*");
    };

    // Subscribe to membership changes for this group
    const membersSub = pb
      .collection("group_members")
      .subscribe("*", async (e) => {
        if (e.record.group === groupId) {
          // Membership has changed, refresh group details
          await fetchGroupChatDetails();
        }
      });

    subscriptionsRef.current["members"] = () => {
      pb.collection("group_members").unsubscribe("*");
    };

    // Subscribe to group detail changes
    const groupSub = pb.collection("groups").subscribe(groupId, async (e) => {
      if (e.action === "update" || e.action === "delete") {
        // Group details have changed
        await fetchGroupChatDetails();
      }
    });

    subscriptionsRef.current["group"] = () => {
      pb.collection("groups").unsubscribe(groupId);
    };
  };

  const cleanupSubscriptions = () => {
    Object.values(subscriptionsRef.current).forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    subscriptionsRef.current = {};
  };

  const addMessage = async (messageData: any) => {
    try {
      const record = await pb.collection("group_messages").create(messageData);
      return record;
    } catch (err) {
      console.error("Error adding message:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGroupChatDetails();

    return () => {
      cleanupSubscriptions();
    };
  }, [groupId, userId]);

  return {
    groupDetails,
    messages,
    loading,
    error,
    addMessage,
    refreshChat: fetchGroupChatDetails,
    setIsPlaying: (messageId: string, isPlaying: boolean) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, isPlaying }
            : { ...msg, isPlaying: false }
        )
      );
    },
  };
};
