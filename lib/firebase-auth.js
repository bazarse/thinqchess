// Firebase Authentication functions
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Google and Facebook providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Sign up with email and password
export async function signUpWithEmail(email, password, userData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName
      });
    }
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: userData.displayName || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        role: 'user',
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign in with Facebook
export async function signInWithFacebook() {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        role: 'user',
        provider: 'facebook',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Get current user data from Firestore
export async function getCurrentUserData() {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { id: user.uid, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user data:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Update Firebase Auth profile
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName
      });
    }
    
    // Update Firestore document
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      updatedAt: new Date()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Auth state listener
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Admin authentication functions
export async function signInAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is admin
    const userDoc = await getDoc(doc(db, 'admin_users', user.uid));
    if (!userDoc.exists()) {
      // Check by email in admin_users collection
      const adminQuery = query(
        collection(db, 'admin_users'),
        where('email', '==', email)
      );
      const adminSnapshot = await getDocs(adminQuery);
      
      if (adminSnapshot.empty) {
        await signOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in admin:', error);
    throw error;
  }
}

// Check if current user is admin
export async function isCurrentUserAdmin() {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    const adminDoc = await getDoc(doc(db, 'admin_users', user.uid));
    if (adminDoc.exists()) return true;
    
    // Also check by email
    const adminQuery = query(
      collection(db, 'admin_users'),
      where('email', '==', user.email)
    );
    const adminSnapshot = await getDocs(adminQuery);
    
    return !adminSnapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
