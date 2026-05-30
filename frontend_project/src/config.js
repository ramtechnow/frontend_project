// Centralized configuration for the React frontend
// Change the backend URL below or set REACT_APP_BACKEND_URL in .env

// export const BACKEND_URL = "http://10.151.98.193:4000";
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://my-ecommerce-api.onrender.com";
