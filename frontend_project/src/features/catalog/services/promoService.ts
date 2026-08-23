import { BACKEND_URL } from "../../../config";
import { SeasonalPromo } from "../types/promoTypes";

// Fetch the active seasonal promo configuration from backend
export const fetchActivePromo = async (): Promise<SeasonalPromo> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  try {
    const res = await fetch(`${BACKEND_URL}/api/seasonal/active`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error("Failed to fetch seasonal promo settings");
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("fetchActivePromo failed or timed out. Using default general promo.", err);
    // Safe general fallback
    return {
      theme: 'General',
      announcementText: '',
      announcementBg: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
      enableParticles: false,
      particleType: 'star',
      bankOffers: []
    };
  }
};

// Save seasonal promo configurations to backend (Admin only)
export const savePromo = async (promoData: SeasonalPromo): Promise<boolean> => {
  const token = localStorage.getItem("auth-token");
  if (!token) throw new Error("Unauthenticated administrative action");

  const res = await fetch(`${BACKEND_URL}/admin/seasonal/save`, {
    method: "POST",
    headers: {
      "auth-token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(promoData)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || "Failed to save configurations");
  }

  return true;
};
