// ============================================
// FIREBASE CONFIG - Vehicle Manager
// Menggunakan Cloudinary untuk gambar
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ============ FIREBASE CONFIG ============
const firebaseConfig = {
  apiKey: "AIzaSyAACiSmGKOByLt2IaymEYbRqSxhvzl9ZN4",
  authDomain: "busker-chord-app.firebaseapp.com",
  projectId: "busker-chord-app",
  storageBucket: "busker-chord-app.firebasestorage.app",
  messagingSenderId: "551643431574",
  appId: "1:551643431574:web:4a083a3d76ff0c42c5b8b7",
  measurementId: "G-BPBNCFLXY9"
};

// ============ INIT FIREBASE ============
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============ CLOUDINARY CONFIG ============
const CLOUDINARY_CLOUD_NAME = 'dabjwkkhm';
const CLOUDINARY_UPLOAD_PRESET = 'Vehicle_manager';

// ============ CRUD FUNCTIONS ============

// CREATE - Tambah data baru
async function addData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: error.message };
  }
}

// READ ALL - Baca semua data
async function getAllData(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
}

// READ ONE - Baca satu data mengikut ID
async function getDataById(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Document not found" };
    }
  } catch (error) {
    console.error("Error getting document: ", error);
    return { success: false, error: error.message };
  }
}

// UPDATE - Kemaskini data
async function updateData(collectionName, id, data) {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error: error.message };
  }
}

// DELETE - Padam data
async function deleteData(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: error.message };
  }
}

// GET LATEST - Dapatkan data terkini mengikut plate number
async function getLatestPerPlate(collectionName, plateNo) {
  try {
    const q = query(
      collection(db, collectionName),
      where("plate_no", "==", plateNo),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error("Error getting latest: ", error);
    return [];
  }
}

// GET HISTORY - Dapatkan semua history mengikut plate number
async function getHistory(collectionName, plateNo) {
  try {
    const q = query(
      collection(db, collectionName),
      where("plate_no", "==", plateNo),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error("Error getting history: ", error);
    return [];
  }
}

// ============ CLOUDINARY FUNCTIONS ============

// UPLOAD IMAGE - Muat naik gambar ke Cloudinary
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'vehicles');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const data = await response.json();
    
    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    } else {
      console.error('Cloudinary error:', data);
      return { success: false, error: data.error?.message || 'Upload failed' };
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
}

// DELETE IMAGE - Padam gambar dari Cloudinary
async function deleteImage(url) {
  try {
    // Extract public_id from URL
    const publicId = url.split('/').pop().split('.')[0];
    const fullPublicId = `vehicles/${publicId}`;
    
    // Untuk Cloudinary delete, perlu API signature.
    // Untuk kemudahan, kita skip delete.
    // Gambar akan kekal di Cloudinary.
    // Ini OK untuk free plan.
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
}

// ============ EXPORT ============

export {
  db,
  addData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
  getLatestPerPlate,
  getHistory,
  uploadImage,
  deleteImage
};