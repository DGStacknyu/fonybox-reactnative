import { Contact, getRandomColor } from "@/hooks/useContacts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { pickImage } from "./GroupUtils";
import FormField from "@/components/FormField";
import LocationPicker from "@/components/LocationPicker";

interface GroupConfigurationProps {
  groupName: string;
  setGroupName: (name: string) => void;
  groupDescription: string;
  setGroupDescription: (description: string) => void;
  groupType: string;
  setGroupType: (type: string) => void;
  location: string;
  setLocation: (location: string) => void;
  groupImage: string | null;
  setGroupImage: (image: string | null) => void;
  selectedMembers: Contact[];
  toggleMemberSelection: (contact: Contact) => void;
  handleCreateGroup: () => void;
  creating: boolean;
}

const ConfigureGroup: React.FC<GroupConfigurationProps> = ({
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  groupType,
  setGroupType,
  location,
  setLocation,
  groupImage,
  setGroupImage,
  selectedMembers,
  toggleMemberSelection,
  handleCreateGroup,
  creating,
}) => {
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleImagePick = async () => {
    const image = await pickImage();
    if (image) {
      setGroupImage(image);
    }
  };
  const GROUP_TYPES = [
    { id: "public", name: "Public", description: "Anyone can join the group" },
    {
      id: "private",
      name: "Private",
      description: "Only invited members can join",
    },
  ];
  return (
    <ScrollView className="flex-1 px-5">
      <View className="items-center mt-6">
        <TouchableOpacity onPress={handleImagePick} className="relative">
          {groupImage ? (
            <Image
              source={{ uri: groupImage }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: getRandomColor() }}
            >
              <Text className="text-3xl">
                {groupName ? groupName.charAt(0).toUpperCase() : "G"}
              </Text>
            </View>
          )}

          <View className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full border-2 border-white">
            <Ionicons name="camera" size={18} color="#637381" />
          </View>
        </TouchableOpacity>

        <Text className="text-sm text-gray-500 mt-2">
          Tap to upload group image
        </Text>

        <Text className="text-base text-gray-500 mb-4 mt-2">
          {selectedMembers.length} participants
        </Text>
      </View>

      <View className="mt-4">
        <FormField
          label="Group Name (required)"
          value={groupName}
          onChangeText={setGroupName}
          required={true}
          otherStyles="mb-4"
          inputStyles="bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-base"
          title="Group Name (required)"
          handleChangeText={setGroupName}
          titleStyle="text-base text-gray-500 mb-1 ml-1"
        />

        <Text className="text-base font-pmedium text-gray-500 mb-2 ml-1">
          Group Description (optional)
        </Text>
        <TextInput
          className=" border border-gray-100 px-4 py-3 rounded-lg text-base mb-4"
          value={groupDescription}
          onChangeText={setGroupDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
        />

        {/* Group Type Selection */}
        <Text className="text-base font-pmedium text-gray-500 mb-1 ml-1">
          Group Type
        </Text>
        <View className="mb-4">
          {GROUP_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              className="flex-row items-center mb-2 py-2"
              onPress={() => setGroupType(type.id)}
            >
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center mr-3">
                {groupType === type.id && (
                  <View className="w-4 h-4 rounded-full bg-[#F52936]" />
                )}
              </View>
              <View>
                <Text className="text-base font-medium">{type.name}</Text>
                <Text className="text-sm text-gray-500">
                  {type.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-base font-pmedium text-gray-500 mb-1 ml-1">
          Location
        </Text>
        <LocationPicker location={location} setLocation={setLocation} />
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
        className={`${
          creating ? "bg-gray-400" : "bg-[#F52936]"
        } py-3 rounded-full items-center mb-8`}
        onPress={handleCreateGroup}
        disabled={creating}
      >
        {creating ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white font-medium text-base ml-2">
              Creating...
            </Text>
          </View>
        ) : (
          <Text className="text-white font-medium text-base">Create Group</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConfigureGroup;
