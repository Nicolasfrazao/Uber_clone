// This file contains a custom hook and a function for making API requests.

// Importing necessary modules from the React library.
import { useState, useEffect, useCallback } from "react";

// The fetchAPI function is an asynchronous function that makes a request to a specified URL with optional request options.
// It takes in a URL string and an optional RequestInit object as parameters.
// The function uses the fetch API to make the request and returns a promise that resolves to the response body as JSON.
// If the response is not successful, it throws an error with a message indicating the HTTP status code.
export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    // Making the request using the fetch API.
    const response = await fetch(url, options);
    // Checking if the response is successful.
    if (!response.ok) {
        // If the response is not successful, throwing an error with a message indicating the HTTP status code.
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Returning the response body as JSON.
    return await response.json();
  } catch (error) {
    // If there's an error during the request or parsing the response, logging the error and re-throwing it.
    console.error("Fetch error:", error);
    throw error;
  }
};

// The useFetch custom hook is a React hook that simplifies making API requests.
// It takes in a URL string and an optional RequestInit object as parameters.
// The hook returns an object with properties for the data, loading state, error state, and a refetch function.
export const useFetch = <T>(url: string, options?: RequestInit) => {
  // State variables for storing the data, loading state, and error state.
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The fetchData function is a callback function that is called when the hook is initially rendered and whenever the URL or options change.
  // It sets the loading state to true, clears the error state, and makes an API request using the fetchAPI function.
  // If the request is successful, it sets the data state to the response data.
  // If there's an error, it sets the error state to the error message.
  // Finally, it sets the loading state to false.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // The useEffect hook is called when the component is first rendered and whenever the fetchData function changes.
  // It calls the fetchData function to make the API request.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Returning an object with the data, loading state, error state, and a refetch function that calls the fetchData function.
  return { data, loading, error, refetch: fetchData };
};
