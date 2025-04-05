import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { pb } from "@/components/pocketbaseClient";

export type Contact = {
  id: string;
  name: string;
  color: string;
  initial: string;
  status: string;
};

export type User = {
  id: string;
  name: string;
  avatar?: string;
};

export type CreateGroupStep = 1 | 2;

export const getRandomColor = (): string => {
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

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      if (!pb.authStore.isValid) {
        Alert.alert("Error", "You must be logged in to create a group");
        router.replace("/(auth)/login");
        return;
      }

      const records = await pb.collection("users").getList(1, 50, {
        sort: "name",
      });

      const fetchedContacts = records.items
        .map((user) => {
          const name = user.name || `User ${user.id.substring(0, 4)}`;
          const initial = name.charAt(0).toUpperCase();
          if (user.id === pb.authStore.model?.id) return null;

          return {
            id: user.id,
            name: name,
            color: getRandomColor(),
            initial: initial,
            status: user.online ? "Online" : "Offline",
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

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle member selection
  const toggleMemberSelection = (contact: Contact) => {
    if (selectedMembers.some((member) => member.id === contact.id)) {
      setSelectedMembers(
        selectedMembers.filter((member) => member.id !== contact.id)
      );
    } else {
      setSelectedMembers([...selectedMembers, contact]);
    }
  };

  return {
    contacts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedMembers,
    setSelectedMembers,
    filteredContacts,
    toggleMemberSelection,
  };
};
