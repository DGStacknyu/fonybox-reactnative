import { pb } from "@/components/pocketbaseClient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert } from "react-native";

export const getRandomColor = () => {
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

// Image picker function
export const pickImage = async (): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("Error", "Failed to pick image. Please try again.");
    return null;
  }
};
type Contact = {
  id: string;
  name: string;
  color: string;
  initial: string;
  status: string;
};
type GroupData = {
  groupName: string;
  groupDescription: string;
  groupType: string;
  location: string;
  groupImage: string | null;
  selectedMembers: Contact[];
  userId: string;
};

export const createGroup = async (
  data: GroupData,
  setCreating: (creating: boolean) => void
): Promise<boolean> => {
  const {
    groupName,
    groupDescription,
    groupType,
    location,
    groupImage,
    selectedMembers,
    userId,
  } = data;

  try {
    const formData = {
      name: groupName,
      description: groupDescription,
      type: groupType,
      location: location,
      created_by: userId,
      group_type: groupType,
    };

    // Create the group
    let newGroup;

    try {
      // Handle image upload if needed
      if (groupImage) {
        const imageFormData = new FormData();
        const fileName = groupImage.split("/").pop() || "group.jpg";
        const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

        // Append the image file to formData
        imageFormData.append("image", {
          uri: groupImage,
          name: fileName,
          type: fileType,
        });

        // Merge the base data with image data
        Object.keys(formData).forEach((key) => {
          imageFormData.append(key, formData[key]);
        });

        console.log("Creating group with image");
        newGroup = await pb.collection("groups").create(imageFormData);
      } else {
        console.log("Creating group without image");
        newGroup = await pb.collection("groups").create(formData);
      }

      console.log("Group created successfully:", newGroup?.id);

      // Add current user as admin
      try {
        await pb.collection("group_members").create({
          group: newGroup.id,
          user: pb.authStore.model?.id,
          role: "admin",
          status: "online",
        });
        console.log("Admin added to group");
      } catch (adminError) {
        console.log("Error adding admin, but continuing:", adminError);
        // Continue anyway since the group was created
      }

      let addedCount = 0;
      for (const member of selectedMembers) {
        try {
          await pb.collection("group_members").create({
            group: newGroup.id,
            user: member.id,
            role: "member",
            status: "offline",
          });
          addedCount++;
        } catch (memberError) {
          console.log(
            `Error adding member ${member.id}, but continuing:`,
            memberError
          );
        }
      }

      console.log(
        `Added ${addedCount}/${selectedMembers.length} members to group`
      );

      Alert.alert("Success", "Group created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setTimeout(() => {
              router.replace("/GroupChat");
            }, 100);
          },
        },
      ]);

      return true;
    } catch (groupError) {
      console.error("Error in group creation step:", groupError);
      Alert.alert("Error", "Failed to create the group. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  } finally {
    setCreating(false);
  }
};
