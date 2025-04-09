// (GroupChat)/info/[id].tsx

import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/context/AuthContext";
import { RecordModel } from "pocketbase";

const GroupInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [groupChat, setGroupChat] = useState<RecordModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [members, setMembers] = useState<RecordModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useGlobalContext();
  const currentUserId = user?.id || null;
  const [isMember, setIsMember] = useState(false); // New state for membership status

  const isAdmin = members.some(
    (member) => member.user === currentUserId && member.role === "admin"
  );

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        setIsLoading(true);

        // Fetch group details
        const group = await pb.collection("groups").getOne(id as string, {
          expand: "created_by",
        });

        // Fetch members
        const membersResult = await pb.collection("group_members").getFullList({
          filter: `group = "${id}"`,
          expand: "user",
        });

        // Check if current user is a member
        const userIsMember = membersResult.some(
          (member) => member.user === currentUserId
        );

        setGroupChat(group);
        setMembers(membersResult);
        setIsMember(userIsMember);

        if (group.image) {
          const imageUrl = pb.files.getUrl(group, group.image);
          setGroupAvatar(imageUrl);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching group info:", err);
        setError("Failed to load group information");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGroupInfo();
    }
  }, [id, currentUserId]);

  const handleJoinGroup = async () => {
    try {
      setIsLoading(true);
      const data = {
        group: id,
        user: currentUserId,
        role: "member",
        status: "offline",
      };

      await pb.collection("group_members").create(data);

      const updatedMembers = await pb.collection("group_members").getFullList({
        filter: `group = "${id}"`,
        expand: "user",
      });

      setMembers(updatedMembers);
      setIsMember(true);
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Failed to join group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            const currentUserMember = members.find(
              (m) => m.user === currentUserId
            );
            if (currentUserMember) {
              await pb.collection("group_members").delete(currentUserMember.id);
              setIsMember(false);

              // Refresh members list
              const updatedMembers = await pb
                .collection("group_members")
                .getFullList({
                  filter: `group = "${id}"`,
                  expand: "user",
                });

              setMembers(updatedMembers);
            }
          } catch (err) {
            console.error("Error leaving group:", err);
            Alert.alert("Error", "Failed to leave group");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#F52936" />
        <Text className="mt-4">Loading group info...</Text>
      </SafeAreaView>
    );
  }

  if (error || !groupChat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>{error || "Group not found"}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#F52936] rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleEditGroup = () => {
    setEditedName(groupChat.name);
    setEditedDescription(groupChat.description);
    setIsEditing(true);
  };

  const handleSaveGroup = async () => {
    try {
      const formData = new FormData() as any;
      formData.append("name", editedName);
      formData.append("description", editedDescription);

      // If user selected a new image and it's different from the current one
      if (groupAvatar && !groupAvatar.includes(groupChat.id)) {
        // It's a local file path
        const filename = groupAvatar.split("/").pop() as any;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";

        formData.append("image", {
          uri: groupAvatar,
          name: filename,
          type,
        });
      }

      const updatedGroup = await pb
        .collection("groups")
        .update(groupChat.id, formData);

      setGroupChat(updatedGroup);
      if (updatedGroup.image) {
        const imageUrl = pb.files.getUrl(updatedGroup, updatedGroup.image);
        setGroupAvatar(imageUrl);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating group:", err);
      Alert.alert("Error", "Failed to update group information");
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupAvatar(result?.assets[0]?.uri);
    }
  };

  const handleAddMember = () => {
    Alert.alert(
      "Add Member",
      "This would open your contacts list to select new members."
    );
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member from the group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await pb.collection("group_members").delete(memberId);

              setMembers(members.filter((m) => m.id !== memberId));
            } catch (err) {
              console.error("Error removing member:", err);
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  // const handleLeaveGroup = () => {
  //   Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Leave",
  //       style: "destructive",
  //       onPress: async () => {
  //         try {
  //           const currentUserMember = members.find(
  //             (m) => m.user === currentUserId
  //           );
  //           if (currentUserMember) {
  //             await pb.collection("group_members").delete(currentUserMember.id);
  //           }
  //           router.push("/GroupChat");
  //         } catch (err) {
  //           console.error("Error leaving group:", err);
  //           Alert.alert("Error", "Failed to leave group");
  //         }
  //       },
  //     },
  //   ]);
  // };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "G";
  };

  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const groupColor = getColor(groupChat.name);
  const groupInitial = getInitial(groupChat.name);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ChatListHeader title="Group Info" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Group Avatar and Name */}
        <View className="items-center mt-6 px-5">
          {isEditing ? (
            <View className="w-full">
              {/* Avatar upload option */}
              <View className="items-center mb-6">
                <TouchableOpacity onPress={handlePickImage}>
                  {groupAvatar ? (
                    <View className="relative">
                      <Image
                        source={{ uri: groupAvatar }}
                        className="w-24 h-24 rounded-full"
                      />
                      <View className="absolute bottom-0 right-0 bg-[#F52936] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                        <Ionicons name="camera" size={16} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View className="relative">
                      <View
                        className="w-24 h-24 rounded-full items-center justify-center"
                        style={{ backgroundColor: groupColor }}
                      >
                        <Text className="text-3xl">{groupInitial}</Text>
                      </View>
                      <View className="absolute bottom-0 right-0 bg-[#F52936] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                        <Ionicons name="camera" size={16} color="white" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
                <Text className="text-sm text-gray-500 mt-2">
                  Tap to change group photo
                </Text>
              </View>

              <TextInput
                className="text-xl font-semibold mb-2 p-2 text-center"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Group Name"
              />
              <TextInput
                className="text-base text-gray-600 border rounded-lg p-3 mb-4"
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Group Description"
                multiline
                numberOfLines={3}
              />
              <View className="flex-row justify-center">
                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-full mr-2"
                  onPress={() => {
                    setIsEditing(false);
                    setGroupAvatar(
                      groupChat.image
                        ? pb.files.getUrl(groupChat, groupChat.image)
                        : null
                    );
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-[#F52936] px-4 py-2 rounded-full"
                  onPress={handleSaveGroup}
                >
                  <Text className="text-white">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Display group avatar or initial */}
              {groupAvatar ? (
                <Image
                  source={{ uri: groupAvatar }}
                  className="w-24 h-24 rounded-full mb-4"
                />
              ) : (
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: groupColor }}
                >
                  <Text className="text-3xl">{groupInitial}</Text>
                </View>
              )}
              <Text className="text-xl font-semibold mb-2">
                {groupChat.name}
              </Text>
              <Text className="text-base text-gray-600 text-center px-6">
                {groupChat.description}
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="people" size={14} color="#666" />
                <Text className="text-sm text-gray-500 ml-1">
                  {groupChat.group_type.charAt(0).toUpperCase() +
                    groupChat.group_type.slice(1)}
                  Group
                </Text>
              </View>
              {/* {groupChat.location && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location" size={14} color="#666" />
                  <Text className="text-sm text-gray-500 ml-1">
                    {groupChat.location}
                  </Text>
                </View>
              )} */}
              {isAdmin && (
                <TouchableOpacity
                  className="mt-4 flex-row items-center"
                  onPress={handleEditGroup}
                >
                  <Ionicons name="pencil" size={16} color="#F52936" />
                  <Text className="ml-1 text-[#F52936]">Edit Group</Text>
                </TouchableOpacity>
              )}
              <Text className="text-sm text-gray-500 mt-2">
                Created on {formatDate(groupChat.created)}
              </Text>
            </>
          )}
        </View>

        {/* Members Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3 px-5">
            <Text className="text-lg font-medium">
              Members ({members.length})
            </Text>
            {isAdmin && (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleAddMember}
              >
                <Ionicons name="add-circle-outline" size={20} color="#F52936" />
                <Text className="ml-1 text-[#F52936]">Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-gray-50 rounded-lg">
            {members.map((member) => {
              const user = member.expand?.user;
              const userName = user
                ? user.name || user.username
                : "Unknown User";
              const userInitial = userName.charAt(0).toUpperCase();
              const userColor = getColor(userName);

              return (
                <View
                  key={member.id}
                  className="flex-row justify-between items-center p-4 border-b border-gray-100"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: userColor }}
                    >
                      <Text>{userInitial}</Text>
                    </View>
                    <View className="ml-3">
                      <View className="flex-row items-center">
                        <Text className="text-base font-medium">
                          {member.user === currentUserId ? "You" : userName}
                        </Text>
                        {member.role === "admin" && (
                          <View className="ml-2 px-2 py-0.5 bg-gray-200 rounded">
                            <Text className="text-xs">Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        {member.status ||
                          "Member since " + formatDate(member.joined_at)}
                      </Text>
                      {member.last_seen && (
                        <Text className="text-xs text-gray-400">
                          Last seen: {formatDate(member.last_seen)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {isAdmin && member.user !== currentUserId && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.id)}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color="#F52936"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {currentUserId && (
          <TouchableOpacity
            className={`mt-10 mb-10 mx-5 p-4 rounded-lg items-center ${
              isMember ? "bg-[#FEE4E7]" : "bg-[#E8F5E9]"
            }`}
            onPress={isMember ? handleLeaveGroup : handleJoinGroup}
            disabled={isLoading}
          >
            <Text
              className={`font-medium ${
                isMember ? "text-[#F52936]" : "text-[#4CAF50]"
              }`}
            >
              {isLoading
                ? "Loading..."
                : isMember
                ? "Leave Group"
                : "Join Group"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupInfoScreen;
