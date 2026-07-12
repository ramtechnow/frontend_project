// Vite exposes client-side environment variables through import.meta.env.
// Set VITE_BACKEND_URL in Firebase/Render builds to the public Express API URL.
const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
const isLocalHost = typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const BACKEND_URL = (configuredBackendUrl ||
  (isLocalHost ? "http://localhost:4000" : "https://frontend-project-jucn.onrender.com")
).replace(/\/$/, "");
