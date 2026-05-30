// Centralized configuration for the React frontend
// Dynamically resolves the API endpoint based on local vs remote runtime environment

const getBackendUrl = () => {
  // If specifically defined in compile-time environment variables, use it
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Dynamic runtime detection based on the browser's current window location
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // If running locally, connect to local backend port 4000
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      return "http://localhost:4000";
    }
  }
  
  // Default fallback for deployed production environments
  return "https://frontend-project-jucn.onrender.com";
};

export const BACKEND_URL = getBackendUrl();
