// Login Form Component
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { images } from "../constants";
import FormField from "@/components/FormField";
import { AntDesign, EvilIcons, MaterialIcons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const LoginForm = () => {
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    dob: "",
    gender: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  // Sample gender options
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

  // Handle date change
  const onDateChange = (event: any, selectedDate: any) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    // Format the date to display in the format MM/DD/YYYY
    const formattedDate = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    setForm({ ...form, dob: formattedDate });
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
                    const formattedDate = `${
                      date.getMonth() + 1
                    }/${date.getDate()}/${date.getFullYear()}`;
                    setForm({ ...form, dob: formattedDate });
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
      // For Android, we'll create a custom picker to match iOS behavior
      return (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 bg-opacity-50 justify-end ">
            <View className="bg-white rounded-t-3xl ">
              <View className="flex-row justify-between items-center px-6 pt-4 ">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-red-500 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    const formattedDate = `${
                      date.getMonth() + 1
                    }/${date.getDate()}/${date.getFullYear()}`;
                    setForm({ ...form, dob: formattedDate });
                    setShowDatePicker(false);
                  }}
                >
                  <Text className="text-red-500 font-bold text-lg">Done</Text>
                </TouchableOpacity>
              </View>

              {/* Custom date picker with individual pickers for month, day, year */}
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

  const submit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/interest");
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 ">
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
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: any) => setForm({ ...form, username: e })}
            otherStyles="mt-4"
            placeholder="Enter your username"
          />
          <FormField
            title="Name"
            value={form.name}
            handleChangeText={(e: any) => setForm({ ...form, name: e })}
            otherStyles="mt-4"
            placeholder="Enter your Name"
          />
          <View className="space-y-2 mt-4">
            <Text className="text-base mb-3 font-pmedium">Date of Birth</Text>
            <TouchableOpacity
              className="w-full h-16 px-4 rounded-2xl border border-gray-100 focus:border-secondary flex flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                className={
                  form.dob
                    ? "font-psemibold text-base"
                    : "font-psemibold text-base text-gray-400"
                }
              >
                {form.dob || "Select your date of birth"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {renderDatePicker()}

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
                {form.gender || "Select your Pronounce"}
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
      <View className="absolute bottom-0 left-0 right-0 bg-white py-4 px-6 ">
        <CustomButton
          title="Next"
          handlePress={submit}
          containerStyles="bg-red-500 w-2/3 self-center "
          isLoading={isSubmitting}
          textStyles="text-white"
        />
      </View>

      <Modal
        visible={showGenderDropdown}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-md">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold">Select Pronounce </Text>
              <TouchableOpacity onPress={() => setShowGenderDropdown(false)}>
                <Text className="text-red-500 font-bold">Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-4 border-b border-gray-100 ${
                    form.gender === item ? "bg-red-50" : ""
                  }`}
                  onPress={() => {
                    setForm({ ...form, gender: item });
                    setShowGenderDropdown(false);
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base ${
                        form.gender === item ? "text-red-500 font-bold " : ""
                      }`}
                    >
                      {item}
                    </Text>
                    {form.gender === item && (
                      <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginForm;
