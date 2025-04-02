// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import PocketBase from "pocketbase";
// import { pb } from "@/components/pocketbaseClient";

// type AuthModel = any | null;

// interface GlobalContextType {
//   isLogged: boolean;
//   setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
//   user: AuthModel;
//   setUser: React.Dispatch<React.SetStateAction<AuthModel>>;
//   loading: boolean;
//   pb: PocketBase;
//   login: (email: string, password: string) => Promise<any>;
//   logout: () => void;
// }

// const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// export const useGlobalContext = (): GlobalContextType => {
//   const context = useContext(GlobalContext);
//   if (context === undefined) {
//     throw new Error("useGlobalContext must be used within a GlobalProvider");
//   }
//   return context;
// };

// const getCurrentUser = async (): Promise<AuthModel> => {
//   if (pb.authStore.isValid) {
//     try {
//       await pb.collection("users").authRefresh();
//       return pb.authStore.model;
//     } catch (error) {
//       pb.authStore.clear();
//       return null;
//     }
//   }
//   return null;
// };

// interface GlobalProviderProps {
//   children: ReactNode;
// }

// const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
//   const [isLogged, setIsLogged] = useState<boolean>(false);
//   const [user, setUser] = useState<AuthModel>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     getCurrentUser()
//       .then((res) => {
//         if (res) {
//           setIsLogged(true);
//           setUser(res);
//         } else {
//           setIsLogged(false);
//           setUser(null);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });

//     pb.authStore.onChange((token, model) => {
//       setIsLogged(!!model);
//       setUser(model);
//     });
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const authData = await pb
//         .collection("users")
//         .authWithPassword(email, password);
//       return authData;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = () => {
//     pb.authStore.clear();
//   };

//   return (
//     <GlobalContext.Provider
//       value={{
//         isLogged,
//         setIsLogged,
//         user,
//         setUser,
//         loading,
//         pb,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </GlobalContext.Provider>
//   );
// };

// export default GlobalProvider;
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import PocketBase from "pocketbase";
import { pb } from "@/components/pocketbaseClient";

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

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // First check if we have a valid token in the auth store
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

    // Set up auth state change listener
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log("Auth state changed:", {
        hasToken: !!token,
        hasModel: !!model,
      });
      setIsLogged(!!model);
      setUser(model);
    });

    // Debug logging when component mounts
    console.log("Initial auth state:", {
      isValid: pb.authStore.isValid,
      hasToken: !!pb.authStore.token,
      hasModel: !!pb.authStore.model,
    });

    // Cleanup listener on unmount
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Debug logging when auth state changes
  useEffect(() => {
    console.log("Auth state updated:", { isLogged, hasUser: !!user });
  }, [isLogged, user]);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      console.log("Login successful");
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
