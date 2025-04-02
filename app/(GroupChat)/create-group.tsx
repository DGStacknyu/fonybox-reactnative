// (GroupChat)/create-group.tsx

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
} from "react-native";

// Sample contacts data
const SAMPLE_CONTACTS = [
  {
    id: "user1",
    name: "Hossein Azarbad",
    color: "#F0D3F7",
    initial: "H",
    status: "Online",
  },
  {
    id: "user2",
    name: "Marvin McKinney",
    color: "#EEEEEE",
    initial: "M",
    status: "Online",
  },
  {
    id: "user3",
    name: "Sarah Johnson",
    color: "#E3F5FF",
    initial: "S",
    status: "Last seen 2h ago",
  },
  {
    id: "user4",
    name: "Alex Chen",
    color: "#FFE8CC",
    initial: "A",
    status: "Last seen 1d ago",
  },
  {
    id: "user5",
    name: "Emily Rodriguez",
    color: "#E0FFE0",
    initial: "E",
    status: "Online",
  },
  {
    id: "user6",
    name: "David Kim",
    color: "#D3E5FF",
    initial: "D",
    status: "Last seen just now",
  },
  {
    id: "user7",
    name: "Jessica Miller",
    color: "#FFECDA",
    initial: "J",
    status: "Online",
  },
  {
    id: "user8",
    name: "Michael Roberts",
    color: "#E5E5FF",
    initial: "M",
    status: "Last seen 3h ago",
  },
  {
    id: "user9",
    name: "Amanda Taylor",
    color: "#FFE8E8",
    initial: "A",
    status: "Online",
  },
  {
    id: "user10",
    name: "Ryan Wilson",
    color: "#D9F2D9",
    initial: "R",
    status: "Last seen 30m ago",
  },
];

// Generate random color for group avatar
const getRandomColor = () => {
  const colors = [
    "#F0D3F7",
    "#EEEEEE",
    "#E3F5FF",
    "#FFE8CC",
    "#E0FFE0",
    "#D3E5FF",
    "#FFECDA",
    "#E5E5FF",
    "#FFE8E8",
    "#D9F2D9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<
    {
      id: string;
      name: string;
      color: string;
      initial: string;
      status: string;
    }[]
  >([]);
  const [step, setStep] = useState(1);

  // Filter contacts based on search query
  const filteredContacts = SAMPLE_CONTACTS.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle member selection
  const toggleMemberSelection = (contact: {
    id: string;
    name: string;
    color: string;
    initial: string;
    status: string;
  }) => {
    if (selectedMembers.some((member) => member.id === contact.id)) {
      setSelectedMembers(
        selectedMembers.filter((member) => member.id !== contact.id)
      );
    } else {
      setSelectedMembers([...selectedMembers, contact]);
    }
  };

  // Create the group
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedMembers.length < 1) {
      Alert.alert("Error", "Please select at least one member");
      return;
    }

    // In a real app, you would add API calls to create the group
    Alert.alert("Success", "Group created successfully!", [
      {
        text: "OK",
        onPress: () => {
          // Navigate back to group chat list
          router.replace("/(GroupChat)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#EEEEEE]">
        <TouchableOpacity
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>
        <Text className="text-lg font-medium">
          {step === 1 ? "New Group" : "Create Group"}
        </Text>
        {step === 1 ? (
          <TouchableOpacity
            onPress={() => (selectedMembers.length > 0 ? setStep(2) : null)}
            disabled={selectedMembers.length === 0}
          >
            <Text
              className={`${
                selectedMembers.length > 0 ? "text-[#F52936]" : "text-gray-400"
              } font-medium`}
            >
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // Empty view for alignment
        )}
      </View>

      {/* Step 1: Select Members */}
      {step === 1 && (
        <>
          {/* Selected Members Horizontal List */}
          {selectedMembers.length > 0 && (
            <View className=" mb-2">
              <FlatList
                horizontal
                data={selectedMembers}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="items-center mr-4 mt-5"
                    onPress={() => toggleMemberSelection(item)}
                  >
                    <View className="relative">
                      <View
                        className="w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: item.color }}
                      >
                        <Text className="text-lg">{item.initial}</Text>
                      </View>
                      <View className="absolute -top-1 -right-1 bg-white rounded-full">
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#F52936"
                        />
                      </View>
                    </View>
                    <Text
                      className="text-xs mt-1 max-w-14 text-center"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <View className="h-px bg-gray-100 mt-2" />
            </View>
          )}

          {/* Search Input */}
          <View className="px-5 py-2">
            <View className="flex-row items-center bg-gray-50 border border-gray-100 px-3 py-2 rounded-full">
              <Ionicons name="search" size={20} color="#637381" />
              <TextInput
                className="ml-2 flex-1 text-base text-black-100"
                placeholder="Search contacts"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#637381" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Contacts List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100"
                onPress={() => toggleMemberSelection(item)}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <Text className="text-base">{item.initial}</Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-medium">{item.name}</Text>
                    <Text className="text-xs text-gray-500">{item.status}</Text>
                  </View>
                </View>

                {selectedMembers.some((member) => member.id === item.id) ? (
                  <View className="w-6 h-6 rounded-full bg-[#F52936] items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* Step 2: Configure Group */}
      {step === 2 && (
        <ScrollView className="flex-1 px-5">
          {/* Group Avatar & Selected Members */}
          <View className="items-center mt-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: getRandomColor() }}
            >
              <Text className="text-3xl">
                {groupName ? groupName.charAt(0).toUpperCase() : "G"}
              </Text>
            </View>

            <Text className="text-base text-gray-500 mb-4">
              {selectedMembers.length} participants
            </Text>
          </View>

          {/* Group Details Form */}
          <View className="mt-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1">
              Group Name (required)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-base mb-4"
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text className="text-sm text-gray-500 mb-1 ml-1">
              Group Description (optional)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-base mb-6"
              placeholder="Enter group description"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Selected Members List */}
          <View className="mt-2 mb-8">
            <Text className="text-base font-medium mb-3">Participants</Text>
            {selectedMembers.map((member) => (
              <View
                key={member.id}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: member.color }}
                  >
                    <Text>{member.initial}</Text>
                  </View>
                  <Text className="ml-3 text-base">{member.name}</Text>
                </View>

                <TouchableOpacity onPress={() => toggleMemberSelection(member)}>
                  <Ionicons name="close-circle" size={20} color="#637381" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className="bg-[#F52936] py-3 rounded-full items-center mb-8"
            onPress={handleCreateGroup}
          >
            <Text className="text-white font-medium text-base">
              Create Group
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CreateGroup;
