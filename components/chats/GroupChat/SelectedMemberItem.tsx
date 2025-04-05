import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "@/hooks/useContacts";

interface SelectedMemberItemProps {
  member: Contact;
  onRemove: (contact: Contact) => void;
  horizontal?: boolean;
}

const SelectedMemberItem = ({
  member,
  onRemove,
  horizontal = true,
}: SelectedMemberItemProps) => {
  if (horizontal) {
    return (
      <TouchableOpacity
        className="items-center mr-4 mt-5"
        onPress={() => onRemove(member)}
      >
        <View className="relative">
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: member.color }}
          >
            <Text className="text-lg">{member.initial}</Text>
          </View>
          <View className="absolute -top-1 -right-1 bg-white rounded-full">
            <Ionicons name="close-circle" size={20} color="#F52936" />
          </View>
        </View>
        <Text className="text-xs mt-1 max-w-14 text-center" numberOfLines={1}>
          {member.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: member.color }}
        >
          <Text>{member.initial}</Text>
        </View>
        <Text className="ml-3 text-base">{member.name}</Text>
      </View>

      <TouchableOpacity onPress={() => onRemove(member)}>
        <Ionicons name="close-circle" size={20} color="#637381" />
      </TouchableOpacity>
    </View>
  );
};

export default SelectedMemberItem;
