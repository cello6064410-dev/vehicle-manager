// Firebase Configuration
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAACiSmGKOByLt2IaymEYbRqSxhvzl9ZN4",
  authDomain: "busker-chord-app.firebaseapp.com",
  projectId: "busker-chord-app",
  storageBucket: "busker-chord-app.firebasestorage.app",
  messagingSenderId: "551643431574",
  appId: "1:551643431574:web:4a083a3d76ff0c42c5b8b7",
  measurementId: "G-BPBNCFLXY9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ============ CRUD FUNCTIONS ============

// CREATE
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

// READ ALL
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

// READ ONE
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

// UPDATE
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

// DELETE
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

// GET LATEST PER PLATE
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

// GET ALL HISTORY PER PLATE
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

// ============ STORAGE FUNCTIONS ============

async function uploadImage(file, path) {
  try {
    const storageRef = ref(storage, `vehicles/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { success: true, url: url };
  } catch (error) {
    console.error("Error uploading image: ", error);
    return { success: false, error: error.message };
  }
}

async function deleteImage(url) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting image: ", error);
    return { success: false, error: error.message };
  }
}

// ============ EXPORT ============

export {
  db,
  storage,
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