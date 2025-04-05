import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "@/hooks/useContacts";

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onToggle: (contact: Contact) => void;
}

const ContactItem = ({ contact, isSelected, onToggle }: ContactItemProps) => {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100"
      onPress={() => onToggle(contact)}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: contact.color }}
        >
          <Text className="text-base">{contact.initial}</Text>
        </View>
        <View className="ml-3">
          <Text className="text-base font-medium">{contact.name}</Text>
          <Text className="text-xs text-gray-500">{contact.status}</Text>
        </View>
      </View>

      {isSelected ? (
        <View className="w-6 h-6 rounded-full bg-[#F52936] items-center justify-center">
          <Ionicons name="checkmark" size={18} color="white" />
        </View>
      ) : (
        <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
      )}
    </TouchableOpacity>
  );
};

export default ContactItem;
