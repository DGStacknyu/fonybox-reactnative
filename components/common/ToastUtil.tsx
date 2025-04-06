import { Alert } from "react-native";

type ToastType = "error" | "success" | "info" | "warning";

export const showToast = (
  title: string,
  message: string,
  type: ToastType = "error"
) => {
  try {
    const Burnt = require("burnt");
    Burnt.toast({
      title,
      message,
      preset: type,
    });
  } catch (e) {
    Alert.alert(title, message);
  }
};
