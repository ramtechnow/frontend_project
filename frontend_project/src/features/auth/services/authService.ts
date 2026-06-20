import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { UserState } from "../../../store/slices/authSlice";

// Fetch or create user profile in Firestore
export const syncUserProfile = async (firebaseUser: FirebaseUser, customName?: string): Promise<UserState> => {
  const userDocRef = doc(db, "users", firebaseUser.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (userSnapshot.exists()) {
    const data = userSnapshot.data();
    
    // Sync verification status or other missing fields to Firestore
    const needsSync = 
      data.emailVerified !== firebaseUser.emailVerified || 
      !data.email || 
      !data.name ||
      (data.name === "Customer" && firebaseUser.displayName && data.name !== firebaseUser.displayName);

    if (needsSync) {
      try {
        await setDoc(userDocRef, {
          email: firebaseUser.email || data.email || "",
          name: data.name || customName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
          emailVerified: firebaseUser.emailVerified,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Failed to update user profile in Firestore:", e);
      }
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || data.email || null,
      name: data.name || firebaseUser.displayName || "Customer",
      role: data.role || "customer",
      emailVerified: firebaseUser.emailVerified
    };
  }

  // Create new user profile document in Firestore
  const isDefaultAdmin = firebaseUser.email?.toLowerCase() === "admin@gmail.com";
  const userProfile: UserState = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: customName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
    role: isDefaultAdmin ? "admin" : "customer",
    emailVerified: firebaseUser.emailVerified
  };

  await setDoc(userDocRef, {
    name: userProfile.name,
    email: userProfile.email,
    role: userProfile.role,
    emailVerified: userProfile.emailVerified,
    createdAt: serverTimestamp()
  });

  return userProfile;
};
