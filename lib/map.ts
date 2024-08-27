import { Driver, MarkerData } from "../types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

export const generateMarkersFromData = ({
    data,
    userLatitude,
    userLongitude,
  }: {
    data: Driver[];
    userLatitude: number;
    userLongitude: number;
  }): MarkerData[] => {
    return data.map((driver) => {
      const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
      const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
  
      return {
        latitude: userLatitude + latOffset,
        longitude: userLongitude + lngOffset,
        title: `${driver.first_name} ${driver.last_name}`,
        ...driver,
      };
    });
  };
  
export const calculateRegion = ({
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
}: {
    userLatitude: number | null,
    userLongitude: number | null,
    destinationLatitude?: number | null;
    destinationLongitude?: number | null;
}) => {
    if (!userLatitude || ! userLongitude ) {
        return {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0,
        };
    }

    if(!destinationLatitude || !destinationLongitude) {
        return {
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
    };
    
    const minLat = Math.min(userLatitude, destinationLatitude);
    const maxLat = Math.max(userLatitude, destinationLatitude);
    
    const minLng = Math.min(userLongitude, destinationLongitude);
    const maxLng = Math.max(userLongitude, destinationLongitude);
    
    const latitudeDelta = (maxLat - minLat) * 1.2;
    const longitudeDelta = (maxLng - minLng) * 1.2;
    
    const latitude = (userLatitude + destinationLatitude) / 2;
    const longitude = (userLongitude + destinationLongitude) / 2;
    
    return {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    };
}

export const calculateDriverTimes = async ({
    markers,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
}: {
    markers: MarkerData[],
    userLatitude: number | null,
    userLongitude: number | null,
    destinationLatitude: number | null,
    destinationLongitude: number | null,
}) => {
    if (
        !userLatitude ||
        !userLongitude ||
        !destinationLatitude ||
        !destinationLongitude
    )

    return;

    try {
        const timePromises = markers.map(async (marker) => {
            const responseToUser = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
            );
            const dataToUser = await responseToUser.json();
            const timeToUser = dataToUser.routes[0].legs[0].duration.value;
            const responseToDestination = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
            );
            const dataToDestination = await responseToDestination.json();
            const timeToDestination = dataToDestination.routes[0].legs[0].duration.value;
            const totalTime = (timeToUser + timeToDestination) / 60;
            const price = (totalTime * 0.5).toFixed(2);

            return {...markers, time: totalTime, price}
        })

        return await Promise.all(timePromises);
    } catch (error) {
        console.error('Error calculating driver times', error);
    }
}