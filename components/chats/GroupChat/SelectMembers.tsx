import { Contact } from "@/hooks/useContacts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Step1Props {
  contacts: Contact[];
  selectedMembers: Contact[];
  toggleMemberSelection: (contact: Contact) => void;
  loading: boolean;
}

const SelectMembers = ({
  contacts,
  selectedMembers,
  toggleMemberSelection,
  loading,
}: Step1Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#F52936" />
        <Text className="mt-2 text-gray-500">Loading contacts...</Text>
      </View>
    );
  }

  return (
    <>
      {selectedMembers.length > 0 && (
        <View className="mb-2">
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
                    <Ionicons name="close-circle" size={20} color="#F52936" />
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

      <View className="px-5 py-2">
        <View className="flex-row items-center bg-gray-50 border border-gray-100 px-3 h-12 rounded-full">
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

      {contacts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No contacts found</Text>
        </View>
      ) : (
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
      )}
    </>
  );
};

export default SelectMembers;
