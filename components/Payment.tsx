import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

/**
 * This component is responsible for handling the payment flow
 * for booking a ride. It will initialize the payment sheet and
 * present it to the user. When the user confirms the payment,
 * it will create a new ride and payment intent on the server.
 */
const Payment = ({
  // The user's full name
  fullName,
  // The user's email address
  email,
  // The cost of the ride
  amount,
  // The ID of the driver who will provide the ride
  driverId,
  // The estimated time it will take to complete the ride
  rideTime,
}: PaymentProps) => {
  // Get the Stripe instance
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Get the user's location from the location store
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  // Get the user's ID from the auth store
  const { userId } = useAuth();

  // Set a state variable to keep track of whether the payment
  // was successful or not
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * This function is called when the user presses the "Confirm
   * Ride" button. It will initialize the payment sheet and
   * present it to the user.
   */
  const openPaymentSheet = async () => {
    // Initialize the payment sheet
    await initializePaymentSheet();

    // Present the payment sheet to the user
    const { error } = await presentPaymentSheet();

    // If there was an error, alert the user
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      // Set the success state to true
      setSuccess(true);
    }
  };

  /**
   * This function is called when the payment sheet is initialized.
   * It will set up the payment intent with the amount and currency
   * code, and set the confirm handler to create a new ride and
   * payment intent on the server.
   */
  const initializePaymentSheet = async () => {
    // Set up the payment intent with the amount and currency code
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          // The payment method that the user selected
          paymentMethod,
          // Whether the user wants to save the payment method
          shouldSavePaymentMethod,
          // A callback to call when the payment is confirmed
          intentCreationCallback,
        ) => {
          // Create a new payment intent on the server
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          // If the payment intent was created successfully, create a new
          // ride and payment intent on the server
          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            // If the payment was successful, create a new ride and payment
            // intent on the server
            if (result.client_secret) {
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              // Call the intent creation callback with the client secret
              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      // Set the return URL to the app's root URL
      returnURL: "myapp://book-ride",
    });

    // If there was an error, alert the user
    if (!error) {
      // setLoading(true);
    }
  };

  // Render a button to confirm the ride and a modal to show
  // the success message
  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
