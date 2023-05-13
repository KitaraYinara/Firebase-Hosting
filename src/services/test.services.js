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
    const date = updatedTest.date.toISOString().split("T")[0];
    return updateDoc(testDoc, { ...updatedTest, date });
  };

  getAllTests = () => {
    return getDocs(testCollectionRef);
  };

  getTest = (id) => {
    const testDoc = doc(db, "tests", id);
    return getDoc(testDoc);
  };

  deleteTest = (id) => {
    const testDoc = doc(db, "tests", id);
    return deleteDoc(testDoc);
  };
}

export default new TestDataService();
