// Importing necessary modules and functions from the project
import * as Linking from "expo-linking"; // Module for handling links
import * as SecureStore from "expo-secure-store"; // Module for securely storing data

import { fetchAPI } from "@/lib/fetch"; // Custom function for making API requests

// Object for storing and retrieving tokens securely
export const tokenCache = {
  // Function for getting a token from the secure store
  async getToken(key: string) {
    try {
      // Attempt to get the token from the secure store
      const item = await SecureStore.getItemAsync(key);

      // If token exists, log a message
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        // If token does not exist, log a message
        console.log("No values stored under key: " + key);
      }

      // Return the token
      return item;
    } catch (error) {
      // If there's an error, log it and delete the token
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      // Return null if there's an error
      return null;
    }
  },
  // Function for saving a token to the secure store
  async saveToken(key: string, value: string) {
    try {
      // Attempt to save the token to the secure store
      await SecureStore.setItemAsync(key, value);
      // Log a message indicating that the token was saved
      console.log(`key: ${key} was saved`);
    } catch (error) {
      // If there's an error, log it
      console.error(`Secure store error: ${error}`);
      // Return null if there's an error
      return null;
    }
  },
};

// Function for handling Google OAuth login
export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    // Attempt to start the OAuth flow
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      // Set the redirect URL for the OAuth flow
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    // If a session ID was created, log a message
    if (createdSessionId) {
      console.log(`Session ID: ${createdSessionId} created.`);

      // If there's a way to set the active session, log a message
      if (setActive) {
        console.log(`Set active session: ${createdSessionId}`);

        // If a user ID was created, log a message
        if (signUp.createdUserId) {
          console.log(`User ID: ${signUp.createdUserId} created.`);

          // Make a request to the API to save the user's information
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        // Return a success message
        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    // If there was an error, return an error message
    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    // If there was an error, log it and return an error message
    console.error(err);
    return {
      success: false,
      code: err.code,
      message: err?.errors[0]?.longMessage,
    };
  }
};
