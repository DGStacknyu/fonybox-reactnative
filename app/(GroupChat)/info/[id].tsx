// (GroupChat)/info/[id].tsx

import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GROUP_CHATS } from "@/constants/chats";

// Sample group chats data structure (same as in the chat detail screen)
const GROUP_INFO = [
  {
    id: "1",
    name: "Project Alpha Team",
    avatar: null,
    initial: "A",
    color: "#F0D3F7",
    description:
      "Team working on Project Alpha - a voice messaging application",
    createdAt: "January 15, 2025",
    members: [
      {
        id: "user1",
        name: "Hossein Azarbad",
        isAdmin: true,
        color: "#F0D3F7",
        initial: "H",
        status: "Online",
      },
      {
        id: "user2",
        name: "Marvin McKinney",
        isAdmin: false,
        color: "#EEEEEE",
        initial: "M",
        status: "Online",
      },
      {
        id: "user3",
        name: "Sarah Johnson",
        isAdmin: false,
        color: "#E3F5FF",
        initial: "S",
        status: "Last seen 2h ago",
      },
      {
        id: "user4",
        name: "Alex Chen",
        isAdmin: false,
        color: "#FFE8CC",
        initial: "A",
        status: "Last seen 1d ago",
      },
      {
        id: "user5",
        name: "Emily Rodriguez",
        isAdmin: false,
        color: "#E0FFE0",
        initial: "E",
        status: "Online",
      },
      {
        id: "user6",
        name: "David Kim",
        isAdmin: false,
        color: "#D3E5FF",
        initial: "D",
        status: "Last seen just now",
      },
    ],
    memberCount: 12,
  },
  {
    id: "2",
    name: "Weekend Hangout",
    avatar: null,
    initial: "W",
    color: "#EEEEEE",
    description: "Planning weekend activities and hangouts",
    createdAt: "February 28, 2025",
    members: [
      {
        id: "user2",
        name: "Marvin McKinney",
        isAdmin: true,
        color: "#EEEEEE",
        initial: "M",
        status: "Online",
      },
      {
        id: "user3",
        name: "Sarah Johnson",
        isAdmin: false,
        color: "#E3F5FF",
        initial: "S",
        status: "Last seen 2h ago",
      },
      {
        id: "user5",
        name: "Emily Rodriguez",
        isAdmin: false,
        color: "#E0FFE0",
        initial: "E",
        status: "Online",
      },
    ],
    memberCount: 5,
  },
  {
    id: "3",
    name: "Family Group",
    avatar: null,
    initial: "F",
    color: "#D3E5FF",
    description: "Family group for sharing updates and photos",
    createdAt: "March 10, 2025",
    members: [
      {
        id: "user1",
        name: "Hossein Azarbad",
        isAdmin: true,
        color: "#F0D3F7",
        initial: "H",
        status: "Online",
      },
      {
        id: "user4",
        name: "Alex Chen",
        isAdmin: false,
        color: "#FFE8CC",
        initial: "A",
        status: "Last seen 1d ago",
      },
      {
        id: "user6",
        name: "David Kim",
        isAdmin: false,
        color: "#D3E5FF",
        initial: "D",
        status: "Last seen just now",
      },
    ],
    memberCount: 8,
  },
  {
    id: "4",
    name: "Book Club",
    avatar: null,
    initial: "B",
    color: "#FFE8CC",
    description: "Discussing our favorite books and authors",
    createdAt: "April 5, 2025",
    members: [
      {
        id: "user2",
        name: "Marvin McKinney",
        isAdmin: true,
        color: "#EEEEEE",
        initial: "M",
        status: "Online",
      },
      {
        id: "user3",
        name: "Sarah Johnson",
        isAdmin: false,
        color: "#E3F5FF",
        initial: "S",
        status: "Last seen 2h ago",
      },
      {
        id: "user5",
        name: "Emily Rodriguez",
        isAdmin: false,
        color: "#E0FFE0",
        initial: "E",
        status: "Online",
      },
    ],
    memberCount: 6,
  },
  {
    id: "5",
    name: "Travel Buddies",
    avatar: null,
    initial: "T",
    color: "#E0FFE0",
    description: "Planning our next travel adventure together",
    createdAt: "May 15, 2025",
    members: [
      {
        id: "user1",
        name: "Hossein Azarbad",
        isAdmin: true,
        color: "#F0D3F7",
        initial: "H",
        status: "Online",
      },
      {
        id: "user4",
        name: "Alex Chen",
        isAdmin: false,
        color: "#FFE8CC",
        initial: "A",
        status: "Last seen 1d ago",
      },
      {
        id: "user6",
        name: "David Kim",
        isAdmin: false,
        color: "#D3E5FF",
        initial: "D",
        status: "Last seen just now",
      },
    ],
    memberCount: 10,
  },
  {
    id: "6",
    name: "Cooking Club",
    avatar: null,
    initial: "C",
    color: "#D3E5FF",
    description: "Sharing recipes and cooking tips",
    createdAt: "June 20, 2025",
    members: [
      {
        id: "user2",
        name: "Marvin McKinney",
        isAdmin: true,
        color: "#EEEEEE",
        initial: "M",
        status: "Online",
      },
      {
        id: "user3",
        name: "Sarah Johnson",
        isAdmin: false,
        color: "#E3F5FF",
        initial: "S",
        status: "Last seen 2h ago",
      },
      {
        id: "user5",
        name: "Emily Rodriguez",
        isAdmin: false,
        color: "#E0FFE0",
        initial: "E",
        status: "Online",
      },
    ],
    memberCount: 7,
  },
];

const GroupInfoScreen = () => {
  const { id } = useLocalSearchParams();
  const [groupChat, setGroupChat] = useState(
    GROUP_CHATS.find((group) => group.id === id)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [groupAvatar, setGroupAvatar] = useState(null);

  // Current user ID (would come from auth context in a real app)
  const currentUserId = "user1";

  // Check if current user is an admin
  const isAdmin = groupChat?.members.some(
    (member) => member.id === currentUserId && member.isAdmin
  );

  if (!groupChat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Group not found</Text>
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

  const handleSaveGroup = () => {
    // In a real app, you would update the group details in your backend
    setGroupChat({
      ...groupChat,
      name: editedName,
      description: editedDescription,
      avatar: groupAvatar,
    });
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
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
    // In a real app, this would open a contacts picker
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
          onPress: () => {
            // In a real app, you would remove the member from your backend
            setGroupChat({
              ...groupChat,
              members: groupChat.members.filter((m) => m.id !== memberId),
              memberCount: groupChat.memberCount - 1,
            });
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          // In a real app, you would remove yourself from the group
          router.replace("/(GroupChat)");
        },
      },
    ]);
  };

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
                        style={{ backgroundColor: groupChat.color }}
                      >
                        <Text className="text-3xl">{groupChat.initial}</Text>
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
                    setGroupAvatar(groupChat.avatar); // Reset to original avatar
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
              {groupChat.avatar || groupAvatar ? (
                <Image
                  source={{ uri: groupChat.avatar || groupAvatar }}
                  className="w-24 h-24 rounded-full mb-4"
                />
              ) : (
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: groupChat.color }}
                >
                  <Text className="text-3xl">{groupChat.initial}</Text>
                </View>
              )}
              <Text className="text-xl font-semibold mb-2">
                {groupChat.name}
              </Text>
              <Text className="text-base text-gray-600 text-center px-6">
                {groupChat.description}
              </Text>
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
                Created on {groupChat.createdAt}
              </Text>
            </>
          )}
        </View>

        {/* Members Section */}
        <View className="mt-6 ">
          <View className="flex-row justify-between items-center mb-3 px-5">
            <Text className="text-lg font-medium">
              Members ({groupChat.memberCount})
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
            {groupChat.members.map((member) => (
              <View
                key={member.id}
                className="flex-row justify-between items-center p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: member.color }}
                  >
                    <Text>{member.initial}</Text>
                  </View>
                  <View className="ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-base font-medium">
                        {member.id === currentUserId ? "You" : member.name}
                      </Text>
                      {member.isAdmin && (
                        <View className="ml-2 px-2 py-0.5 bg-gray-200 rounded">
                          <Text className="text-xs">Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500">
                      {member.status}
                    </Text>
                  </View>
                </View>

                {isAdmin && member.id !== currentUserId && (
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
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="mt-10 mb-10 mx-5 p-4 bg-[#FEE4E7] rounded-lg items-center"
          onPress={handleLeaveGroup}
        >
          <Text className="text-[#F52936] font-medium">Leave Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupInfoScreen;
