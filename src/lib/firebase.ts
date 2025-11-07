// src/lib/firebase.ts

import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// Firebase config (consider env vars in production)
const firebaseConfig = {
  apiKey: 'AIzaSyAVCwWo7VZZon7Q3aIztnfCWoPXwikeoUc',
  authDomain: 'healix-99974.firebaseapp.com',
  projectId: 'healix-99974',
  storageBucket: 'healix-99974.firebasestorage.app',
  messagingSenderId: '382888000793',
  appId: '1:382888000793:web:7482c6d42ad6bb765e1988',
  measurementId: 'G-4276V5CK7K',
}

// Initialize once (safe for HMR)
const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Types
export interface UserData {
  fullName: string
  gender: string
  dateOfBirth: string
  age: string
  bloodGroup: string
  height: string
  weight: string
  email: string
  mobileNumber: string
  aadhaarNumber: string
  address: string
  city: string
  state: string
  medicalConditions: string
  allergies: string
  currentMedications: string
  emergencyContactName: string
  emergencyContactNumber: string
  termsAccepted: boolean
  privacyAccepted: boolean
  dataConsentAccepted: boolean
}

// Friendly ID helpers
function generateFriendlyId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const L = letters.charAt(Math.floor(Math.random() * letters.length))
  const N = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${L}${N}`
}

export async function ensurePrimaryCustomId(userId: string): Promise<void> {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as any
  if (!data?.customId) {
    const id = generateFriendlyId()
    await setDoc(ref, { customId: id, updatedAt: serverTimestamp() }, { merge: true })
  }
}

async function generateUniqueFamilyCustomId(userId: string): Promise<string> {
  const uSnap = await getDoc(doc(db, 'users', userId))
  const primaryId = uSnap.exists() ? (uSnap.data() as any).customId : null
  const famSnap = await getDocs(collection(db, 'users', userId, 'familyMembers'))
  const taken = new Set<string>()
  if (primaryId) taken.add(String(primaryId))
  famSnap.forEach(d => {
    const m = d.data() as any
    if (m?.customId) taken.add(String(m.customId))
  })
  let id = generateFriendlyId()
  for (let i = 0; i < 25 && taken.has(id); i++) id = generateFriendlyId()
  return id
}

// PIN helpers
async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'HEALIX_SALT_2024')
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const savePIN = async (userId: string, pin: string, userEmail: string) => {
  const hashed = await hashPIN(pin)
  await setDoc(doc(db, 'userPINs', userId), {
    pin: hashed,
    email: userEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return true
}

export const verifyPIN = async (userId: string, pin: string) => {
  const snap = await getDoc(doc(db, 'userPINs', userId))
  if (!snap.exists()) return false
  const storedHash = (snap.data() as any).pin
  const inputHash = await hashPIN(pin)
  return storedHash === inputHash
}

export const sendPINResetEmail = async (email: string) => {
  try {
    const pinsRef = collection(db, 'userPINs')
    const qy = query(pinsRef, where('email', '==', email))
    const res = await getDocs(qy)
    if (res.empty) throw new Error('No account found with this email')
    await sendPasswordResetEmail(auth, email)
    return { success: true, message: 'PIN reset link sent to your email' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export const resetPIN = async (userId: string, newPin: string) => {
  try {
    const hashed = await hashPIN(newPin)
    await setDoc(doc(db, 'userPINs', userId), { pin: hashed, updatedAt: serverTimestamp() }, { merge: true })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Auth
export function getCurrentUser(): User | null {
  return auth.currentUser
}

export const loginWithEmailAndPin = async (email: string, pin: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pin)
    await ensurePrimaryCustomId(cred.user.uid)
    return { success: true, user: cred.user }
  } catch (error: any) {
    let msg = 'Login failed. Please check your credentials.'
    if (error.code === 'auth/user-not-found') msg = 'No account found. Please register first.'
    else if (error.code === 'auth/wrong-password') msg = 'Incorrect PIN. Please try again.'
    else if (error.code === 'auth/invalid-email') msg = 'Invalid email format.'
    else if (error.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.'
    return { success: false, error: msg, code: error.code }
  }
}

export const registerUser = async (userData: UserData, photoFile: File | null, pin: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, userData.email, pin)
    const user = cred.user
    const customId = generateFriendlyId()
    const photoURL = '' // TODO: upload to storage if needed
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      customId,
      fullName: userData.fullName,
      photoURL,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      age: userData.age,
      bloodGroup: userData.bloodGroup,
      height: userData.height,
      weight: userData.weight,
      email: userData.email,
      mobileNumber: userData.mobileNumber,
      aadhaarNumber: userData.aadhaarNumber,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      medicalConditions: userData.medicalConditions,
      allergies: userData.allergies,
      currentMedications: userData.currentMedications,
      emergencyContactName: userData.emergencyContactName,
      emergencyContactNumber: userData.emergencyContactNumber,
      termsAccepted: userData.termsAccepted,
      privacyAccepted: userData.privacyAccepted,
      dataConsentAccepted: userData.dataConsentAccepted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await savePIN(user.uid, pin, userData.email)
    return { success: true, uid: user.uid, customId }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export const logout = () => signOut(auth)
export { onAuthStateChanged }

// User profile
export const getUserData = async (uid: string) => {
  try {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return { success: false, error: 'User not found' }
    return { success: true, data: snap.data() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export const updateUserProfile = async (userId: string, data: any) => {
  await setDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() }, { merge: true })
  return { success: true }
}

// Family members
export const addFamilyMember = async (userId: string, memberData: any) => {
  const famRef = collection(db, 'users', userId, 'familyMembers')
  const customId = await generateUniqueFamilyCustomId(userId)
  const docRef = await addDoc(famRef, {
    ...memberData,
    customId,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export const getFamilyMembers = async (userId: string) => {
  const famRef = collection(db, 'users', userId, 'familyMembers')
  const res = await getDocs(famRef)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteFamilyMember(userId: string, memberDocId: string) {
  if (!userId) throw new Error('Missing userId')
  if (!memberDocId) throw new Error('Missing memberId')
  await deleteDoc(doc(db, 'users', userId, 'familyMembers', memberDocId))
  return { success: true }
}

// Health records
export const saveHealthRecord = async (userId: string, recordData: any) => {
  const recRef = collection(db, 'users', userId, 'healthRecords')
  const r = await addDoc(recRef, { ...recordData, createdAt: serverTimestamp() })
  return r.id
}

export const getHealthRecords = async (userId: string) => {
  const recRef = collection(db, 'users', userId, 'healthRecords')
  const res = await getDocs(recRef)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Storage
export async function uploadUserFile(userId: string, file: File, path: string) {
  const ref = storageRef(storage, `users/${userId}/${path}`)
  await uploadBytes(ref, file)
  const url = await getDownloadURL(ref)
  return { success: true, url }
}
