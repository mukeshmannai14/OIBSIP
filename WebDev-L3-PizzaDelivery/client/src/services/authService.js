
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Register with email and password
export const registerWithEmail = async ({
  name,
  email,
  password,
}) => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    throw new Error("Please fill in all required fields.");
  }

  const result = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  try {
    await updateProfile(result.user, {
      displayName: cleanName,
    });

    await sendEmailVerification(result.user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false,
    });

    return result.user;
  } catch (error) {
    console.error("Account created, but profile or verification setup failed:", error);

    error.accountCreated = true;
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  await reload(user);

  if (user.emailVerified) {
    throw new Error("Email is already verified.");
  }

  await sendEmailVerification(user);
};

// Login with email
export const loginWithEmail = async ({ email, password }) => {
  const result = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  await reload(result.user);

  return {
    user: result.user,
    verified: result.user.emailVerified,
  };
};

// Google login
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Reset password
export const resetPasswordEmail = async (email) => {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};
