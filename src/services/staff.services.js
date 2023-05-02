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

const staffCollectionRef = collection(db, "staffs");
class StaffDataService {
  addStaffs = (newStaff) => {
    return addDoc(staffCollectionRef, newStaff);
  };

  updateStaff = (id, updatedStaff) => {
    const staffDoc = doc(db, "staffs", id);
    return updateDoc(staffDoc, updatedStaff);
  };

  deleteStaff = (id) => {
    const staffDoc = doc(db, "staffs", id);
    return deleteDoc(staffDoc);
  };

  getAllStaffs = () => {
    return getDocs(staffCollectionRef);
  };

  getStaff = (id) => {
    const staffDoc = doc(db, "staffs", id);
    return getDoc(staffDoc);
  };
}

export default new StaffDataService();