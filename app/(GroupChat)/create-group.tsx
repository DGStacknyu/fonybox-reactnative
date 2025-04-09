// components/groups/CreateGroup.tsx
import ConfigureGroup from "@/components/chats/GroupChat/ConfigureGroup";
import { createGroup } from "@/components/chats/GroupChat/GroupUtils";
import SelectMembers from "@/components/chats/GroupChat/SelectMembers";
import { pb } from "@/components/pocketbaseClient";
import { Contact, getRandomColor } from "@/hooks/useContacts";
import { useGlobalContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  Alert,
  View,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";

const CreateGroup = () => {
  // Global state
  const { user, isLogged } = useGlobalContext();

  // Local state for component
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [groupType, setGroupType] = useState("private");
  const [location, setLocation] = useState("");

  const toggleMemberSelection = (contact: Contact) => {
    if (selectedMembers.some((member) => member.id === contact.id)) {
      setSelectedMembers(
        selectedMembers.filter((member) => member.id !== contact.id)
      );
    } else {
      setSelectedMembers([...selectedMembers, contact]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedMembers.length < 1) {
      Alert.alert("Error", "Please select at least one member");
      return;
    }

    setCreating(true);
    console.log("Creating group:", {
      name: groupName,
      description: groupDescription,
      type: groupType,
      location: location,
      members: selectedMembers.length,
    });

    await createGroup(
      {
        groupName,
        groupDescription,
        groupType,
        location,
        groupImage,
        selectedMembers,
        userId: user?.id,
      },
      setCreating
    );
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        if (!isLogged || !user) {
          Alert.alert("Error", "You must be logged in to create a group");
          router.replace("/(auth)/login");
          return;
        }

        const records = await pb.collection("users").getList(1, 50, {
          sort: "name",
        });

        const fetchedContacts = records.items
          .map((contactUser) => {
            const name =
              contactUser.name || `User ${contactUser.id.substring(0, 4)}`;
            const initial = name.charAt(0).toUpperCase();

            if (contactUser.id === user.id) return null;

            return {
              id: contactUser.id,
              name: name,
              color: getRandomColor(),
              initial: initial,
              status: contactUser.online ? "Online" : "Offline",
            };
          })
          .filter((contact) => contact !== null) as Contact[];

        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        Alert.alert("Error", "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [isLogged, user, pb]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header Component */}
      <View
        className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#EEEEEE]"
        style={{
          paddingTop:
            Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 0,
        }}
      >
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
          <View style={{ width: 24 }} />
        )}
      </View>

      {step === 1 && (
        <SelectMembers
          contacts={contacts}
          selectedMembers={selectedMembers}
          toggleMemberSelection={toggleMemberSelection}
          loading={loading}
        />
      )}

      {step === 2 && (
        <ConfigureGroup
          groupName={groupName}
          setGroupName={setGroupName}
          groupDescription={groupDescription}
          setGroupDescription={setGroupDescription}
          groupType={groupType}
          setGroupType={setGroupType}
          location={location}
          setLocation={setLocation}
          groupImage={groupImage}
          setGroupImage={setGroupImage}
          selectedMembers={selectedMembers}
          toggleMemberSelection={toggleMemberSelection}
          handleCreateGroup={handleCreateGroup}
          creating={creating}
        />
      )}
    </SafeAreaView>
  );
};

export default CreateGroup;
