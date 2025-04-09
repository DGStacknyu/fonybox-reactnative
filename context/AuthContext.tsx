import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import PocketBase from "pocketbase";
import { pb } from "@/components/pocketbaseClient";
import { router } from "expo-router";

type AuthModel = any | null;

interface GlobalContextType {
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
  user: AuthModel;
  setUser: React.Dispatch<React.SetStateAction<AuthModel>>;
  loading: boolean;
  pb: PocketBase;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUserProfile: (updatedProfile: any) => Promise<any>;
  checkUserProfileCompletion: () => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<AuthModel>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkUserProfileCompletion = (): boolean => {
    if (!user) return false;

    return !!user.username && user.username.trim() !== "";
  };

  const redirectIfProfileIncomplete = () => {
    if (isLogged && !loading && !checkUserProfileCompletion()) {
      console.log("Username missing, redirecting to user details");
      router.navigate("/user-details");
    } else {
      router.navigate("/home");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        if (pb.authStore.isValid) {
          try {
            // Try to refresh the auth
            await pb.collection("users").authRefresh();
            setIsLogged(true);
            setUser(pb.authStore.model);
            console.log("Auth refreshed successfully");
          } catch (error) {
            console.log("Auth refresh failed:", error);
            pb.authStore.clear();
            setIsLogged(false);
            setUser(null);
          }
        } else {
          console.log("No valid auth token found");
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        console.log("Auth initialization error:", error);
        setIsLogged(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log("Auth state changed:", {
        hasToken: !!token,
        hasModel: !!model,
      });
      setIsLogged(!!model);
      setUser(model);
    });

    console.log("Initial auth state:", {
      isValid: pb.authStore.isValid,
      hasToken: !!pb.authStore.token,
      hasModel: !!pb.authStore.model,
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    console.log("Auth state updated:", { isLogged, hasUser: !!user });

    if (!loading) {
      redirectIfProfileIncomplete();
    }
  }, [isLogged, user, loading]);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      console.log("Login successful");

      if (!authData.record.username || authData.record.username.trim() === "") {
        console.log("Username missing after login, will redirect");
      }

      return authData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out");
    pb.authStore.clear();
  };

  const updateUserProfile = async (updatedProfile: any) => {
    try {
      if (!pb.authStore.isValid || !user) {
        throw new Error("User is not authenticated");
      }

      const userId = user.id;

      const {
        id,
        created,
        updated,
        collectionId,
        collectionName,
        ...updateData
      } = updatedProfile;

      const record = await pb.collection("users").update(userId, updateData);

      setUser(record);

      console.log("Profile updated successfully");
      return record;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        pb,
        login,
        logout,
        updateUserProfile,
        checkUserProfileCompletion,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
