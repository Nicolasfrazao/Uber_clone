import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

/**
 * The Map component renders a map that displays the user's current location,
 * as well as the location of the drivers.
 * It also renders a destination marker when the user has selected a
 * destination location.
 * The component uses the useLocationStore and useDriverStore hooks to
 * get the current location and driver information.
 * It uses the calculateRegion function to calculate the initial region
 * of the map based on the user's current location and the driver's
 * locations.
 * It uses the generateMarkersFromData function to generate an array
 * of markers from the driver data.
 * It uses the calculateDriverTimes function to calculate the estimated
 * time to the user's destination for each driver, and sets the
 * drivers state with the results.
 * It renders the map with the user's current location, the driver's
 * locations, and the destination marker.
 * @returns
 */
const Map = () => {
  // Get the user's current location from the location store.
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // Get the driver information from the driver store.
  const { selectedDriver, setDrivers } = useDriverStore();

  // Use the fetch hook to get the driver data from the API.
  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");

  // State variable to store the markers.
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // Use the useEffect hook to calculate the initial region of the map
  // when the user's location changes.
  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      // Generate an array of markers from the driver data.
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      // Set the markers state with the new array of markers.
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  // Use the useEffect hook to calculate the estimated time to the user's
  // destination for each driver when the user's location changes.
  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      // Calculate the estimated time to the user's destination for each driver.
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        // Set the drivers state with the results.
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  // Calculate the initial region of the map based on the user's current
  // location and the driver's locations.
  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  // If the driver data is still loading, render a loading indicator.
  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  // If there's an error, render an error message.
  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  // Render the map with the user's current location, the driver's
  // locations, and the destination marker.
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={directionsAPI!}
            strokeColor="#0286FF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;


