import { db } from "../firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const appointmentCollectionRef = collection(db, "appointments");

class AppointmentDataService {
    addAppointments = (newAppointment) => {
      return addDoc(appointmentCollectionRef, newAppointment);
  };

  updateAppointment = (id, updatedAppointment) => {
    const appointmentDoc = doc(db, "appointments", id);
    const date = updatedAppointment.date.toISOString().split("T")[0];
    return updateDoc(appointmentDoc, { ...updatedAppointment, date });
  };

  getAllAppointments = () => {
    return getDocs(appointmentCollectionRef);
  };

  getAppointment = (id) => {
    const appointmentDoc = doc(db, "appointments", id);
    return getDoc(appointmentDoc);
  };

  deleteAppointment = (id) => {
    const appointmentDoc = doc(db, "appointments", id);
    return deleteDoc(appointmentDoc);
  };
}

export default new AppointmentDataService();