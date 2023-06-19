import { db } from "../firebase";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const testCollectionRef = collection(db, "tests");
class TestDataService {
  addTests = (newTest) => {
    return addDoc(testCollectionRef, newTest);
  };

  updateTest = (id, updatedTest) => {
    const testDoc = doc(db, "tests", id);
    return updateDoc(testDoc, updatedTest);
  };

  deleteTest = (id) => {
    const testDoc = doc(db, "tests", id);
    return deleteDoc(testDoc);
  };

  getAllTests = () => {
    return getDocs(testCollectionRef);
  };

  getTest = (id) => {
    const testDoc = doc(db, "tests", id);
    return getDoc(testDoc);
  };
}

export default new TestDataService();
