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
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: data.name || firebaseUser.displayName,
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
    createdAt: serverTimestamp()
  });

  return userProfile;
};
