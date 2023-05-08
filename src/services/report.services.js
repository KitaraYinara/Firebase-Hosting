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

const reportCollectionRef = collection(db, "reports");
class ReportDataService {
  addReports = (newReport) => {
    return addDoc(reportCollectionRef, newReport);
  };

  updateReport = (id, updatedReport) => {
    const reportDoc = doc(db, "reports", id);
    return updateDoc(reportDoc, updatedReport);
  };

  deleteReport = (id) => {
    const reportDoc = doc(db, "reports", id);
    return deleteDoc(reportDoc);
  };

  getAllReports = () => {
    return getDocs(reportCollectionRef);
  };

  getReport = (id) => {
    const reportDoc = doc(db, "reports", id);
    return getDoc(reportDoc);
  };
}

export default new ReportDataService();