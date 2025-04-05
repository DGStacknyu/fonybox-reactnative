import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

interface LocationPickerProps {
  location: string;
  setLocation: (location: string) => void;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  setLocation,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoords, setMarkerCoords] = useState<LocationCoords | null>(null);
  const [locationName, setLocationName] = useState(location);
  const [searchText, setSearchText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (modalVisible) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(newRegion);
          setMarkerCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          setErrorMsg("Could not get current location");
        }
      }
    })();
  }, [modalVisible]);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerCoords(coordinate);
    getAddressFromCoords(coordinate);
  };

  const getAddressFromCoords = async (coords: LocationCoords) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (response && response.length > 0) {
        const address = response[0];
        const addressString = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");
        setLocationName(addressString);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const searchLocation = async () => {
    if (!searchText) return;

    try {
      const results = await Location.geocodeAsync(searchText);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setMarkerCoords({ latitude, longitude });
        getAddressFromCoords({ latitude, longitude });
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const confirmLocation = () => {
    setLocation(locationName);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center  border border-gray-100 px-4 py-3 rounded-lg mb-6"
      >
        <Ionicons
          name="location-outline"
          size={20}
          color="#637381"
          style={{ marginRight: 8 }}
        />
        <Text
          className="flex-1 text-base"
          style={!location ? { color: "#9ca3af" } : {}}
        >
          {location || "Add group location"}
        </Text>
        <Ionicons name="map-outline" size={20} color="#637381" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Location</Text>
            <TouchableOpacity
              onPress={confirmLocation}
              disabled={!markerCoords}
            >
              <Text
                style={[
                  styles.confirmText,
                  !markerCoords && styles.disabledText,
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#637381"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
            >
              {markerCoords && (
                <Marker
                  coordinate={markerCoords}
                  draggable
                  onDragEnd={(e: any) => {
                    setMarkerCoords(e.nativeEvent.coordinate);
                    getAddressFromCoords(e.nativeEvent.coordinate);
                  }}
                />
              )}
            </MapView>
          )}

          {markerCoords && (
            <View style={styles.locationInfo}>
              <Ionicons
                name="location"
                size={24}
                color="#F52936"
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  confirmText: {
    fontSize: 16,
    color: "#F52936",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F52936",
    textAlign: "center",
  },
});

export default LocationPicker;
