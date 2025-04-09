import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "../constants";

const UserDetailsForm = () => {
  const { user, setUser } = useGlobalContext();

  const [form, setForm] = useState({
    username: user.username,
    name: user.name,
    date_of_birth: user.date_of_birth,
    gender: user.gender,
  });

  const [interests, setInterests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const genderOptions = ["Male", "Female"];

  const onDateChange = (event: { type: string }, selectedDate: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    const formattedDate = formatDateForPocketBase(currentDate);
    setForm({ ...form, date_of_birth: formattedDate });
  };

  const formatDateForPocketBase = (dateObj: Date) => {
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`;
  };

  const formatDateForDisplay = (isoDateString: string | number | Date) => {
    if (!isoDateString) return "";

    try {
      if (isoDateString.includes("T") || isoDateString.includes("Z")) {
        const date = new Date(isoDateString);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getDate()
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      }

      if (isoDateString.includes("/")) {
        if (isoDateString.includes("00:00:00")) {
          const parts = isoDateString.split(" ")[0].split("/");
          if (parts.length >= 2) {
            return `${parts[0]}/${parts[1]}/${
              parts[2] || new Date().getFullYear()
            }`;
          }
        }
        return isoDateString;
      }

      if (isoDateString.includes("-")) {
        const [year, month, day] = isoDateString.split("-");
        return `${month}/${day}/${year}`;
      }

      return isoDateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return isoDateString;
    }
  };

  const submit = async () => {
    if (!form.username || !form.name || !form.date_of_birth || !form.gender) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let dateOfBirth = form.date_of_birth;
      if (dateOfBirth.includes("/")) {
        const [month, day, year] = dateOfBirth.split("/");
        dateOfBirth = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
      }

      const data = {
        ...form,
        date_of_birth: dateOfBirth,
        detailsCompleted: true,
        interests: interests.join(","),
        isOnline: true,
      };

      const updatedUser = await pb.collection("users").update(user.id, data);
      setUser(updatedUser);
      router.push("/interest");
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("Failed to save details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1970; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const renderDatePicker = () => {
    if (Platform.OS === "ios") {
      return (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 bg-opacity-50 justify-end">
            <View className="bg-white rounded-t-3xl shadow-md">
              <View className="flex-row justify-between items-center px-6 pt-4">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-red-500 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    // Use consistent date formatting
                    const formattedDate = formatDateForPocketBase(date);
                    setForm({ ...form, date_of_birth: formattedDate });
                    setShowDatePicker(false);
                  }}
                >
                  <Text className="text-red-500 font-bold text-lg">Done</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between px-4 py-6">
                {/* Month picker */}
                <View className="w-1/4">
                  <Text className="text-center font-bold mb-2">Month</Text>
                  <FlatList
                    data={Array.from({ length: 12 }, (_, i) =>
                      (i + 1).toString().padStart(2, "0")
                    )}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={date.getMonth()}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getMonth() === index ? "bg-red-50" : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setMonth(index);
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getMonth() === index
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Day picker */}
                <View className="w-1/4">
                  <Text className="text-center font-bold mb-2">Day</Text>
                  <FlatList
                    data={Array.from({ length: 31 }, (_, i) =>
                      (i + 1).toString().padStart(2, "0")
                    )}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={date.getDate() - 1}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getDate() === index + 1 ? "bg-red-50" : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setDate(index + 1);
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getDate() === index + 1
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Year picker - in reverse order */}
                <View className="w-1/3">
                  <Text className="text-center font-bold mb-2">Year</Text>
                  <FlatList
                    data={getYears()}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={
                      new Date().getFullYear() - date.getFullYear()
                    }
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getFullYear().toString() === item
                            ? "bg-red-50"
                            : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setFullYear(parseInt(item));
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getFullYear().toString() === item
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      return (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 bg-opacity-50 justify-end ">
            <View className="bg-white rounded-t-3xl shadow-md">
              <View className="flex-row justify-between items-center px-6 pt-4 ">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-red-500 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    // Use consistent date formatting
                    const formattedDate = formatDateForPocketBase(date);
                    setForm({ ...form, date_of_birth: formattedDate });
                    setShowDatePicker(false);
                  }}
                >
                  <Text className="text-red-500 font-bold text-lg">Done</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between px-4 py-6">
                <View className="w-1/4">
                  <Text className="text-center font-bold mb-2">Month</Text>
                  <FlatList
                    data={Array.from({ length: 12 }, (_, i) =>
                      (i + 1).toString().padStart(2, "0")
                    )}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={date.getMonth()}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getMonth() === index ? "bg-red-50" : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setMonth(index);
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getMonth() === index
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Day picker */}
                <View className="w-1/4">
                  <Text className="text-center font-bold mb-2">Day</Text>
                  <FlatList
                    data={Array.from({ length: 31 }, (_, i) =>
                      (i + 1).toString().padStart(2, "0")
                    )}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={date.getDate() - 1}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getDate() === index + 1 ? "bg-red-50" : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setDate(index + 1);
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getDate() === index + 1
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Year picker - in reverse order */}
                <View className="w-1/3">
                  <Text className="text-center font-bold mb-2">Year</Text>
                  <FlatList
                    data={getYears()}
                    keyExtractor={(item) => item}
                    className="h-40"
                    showsVerticalScrollIndicator={true}
                    initialScrollIndex={0}
                    getItemLayout={(data, index) => ({
                      length: 40,
                      offset: 40 * index,
                      index,
                    })}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className={`h-10 justify-center ${
                          date.getFullYear().toString() === item
                            ? "bg-red-50"
                            : ""
                        }`}
                        onPress={() => {
                          const newDate = new Date(date);
                          newDate.setFullYear(parseInt(item));
                          setDate(newDate);
                        }}
                      >
                        <Text
                          className={`text-base text-center ${
                            date.getFullYear().toString() === item
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-red-500 pt-10 pb-72 relative">
          <Text className="text-white text-4xl mb-8 font-bold text-center">
            User details
          </Text>
          <View className="absolute bottom-5 -left-5 right-0 flex-row justify-center">
            <Image
              source={images.handphone}
              className="w-80 h-80"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="bg-white -mt-12 rounded-t-3xl px-6 pt-8 pb-12">
          {/* Username */}
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-4"
            placeholder="Enter your username"
          />

          {/* Name */}
          <FormField
            title="Name"
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
            otherStyles="mt-4"
            placeholder="Enter your name"
          />

          {/* Date of Birth */}
          <View className="space-y-2 mt-4">
            <Text className="text-base mb-3 font-pmedium">Date of Birth</Text>
            <TouchableOpacity
              className="w-full h-16 px-4 rounded-2xl border border-gray-100 focus:border-secondary flex flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                className={
                  form.date_of_birth
                    ? "font-psemibold text-base"
                    : "font-psemibold text-base text-gray-400"
                }
              >
                {form.date_of_birth
                  ? String(formatDateForDisplay(form.date_of_birth))
                  : "Select your date of birth"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {renderDatePicker()}

          {/* Gender */}
          <View className="space-y-2 mt-4">
            <Text className="text-base mb-3 font-pmedium">Gender</Text>
            <TouchableOpacity
              className="w-full h-16 px-4 rounded-2xl border border-gray-100 focus:border-secondary flex flex-row items-center justify-between"
              onPress={() => setShowGenderDropdown(true)}
            >
              <Text
                className={
                  form.gender
                    ? "font-psemibold text-base"
                    : "font-psemibold text-base text-gray-400"
                }
              >
                {form.gender || "Select your gender"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed button at the bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white py-4 px-6">
        <CustomButton
          title="Next"
          handlePress={submit}
          containerStyles="bg-red-500 w-2/3 self-center"
          isLoading={isSubmitting}
          textStyles="text-white"
        />
      </View>

      {/* Gender Dropdown Modal */}
      <Modal visible={showGenderDropdown} transparent animationType="slide">
        <View className="flex-1  bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl shadow-sm p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderDropdown(false)}>
                <Text className="text-red-500 font-bold">Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-4 border-b border-gray-200 ${
                    form.gender === item ? "bg-red-50" : ""
                  }`}
                  onPress={() => {
                    setForm({ ...form, gender: item });
                    setShowGenderDropdown(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      form.gender === item ? "text-red-500 font-bold" : ""
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <StatusBar backgroundColor="#ffffff" style="dark" />
    </SafeAreaView>
  );
};

export default UserDetailsForm;
