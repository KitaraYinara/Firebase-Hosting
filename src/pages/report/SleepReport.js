import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import Papa from "papaparse";
import "./SleepReport.css";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

const SleepReport = () => {
  const { patientId, testId } = useParams();
  const [tests, setTests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pulseRateData, setPulseRateData] = useState({});
  const [respiratoryRateData, setRespiratoryRateData] = useState({});
  const [heartratevariabilityData, setHeartratevariabilityData] = useState({});
  const [oxygenLevelData, setOxygenLevelData] = useState({});

  const [apneaDuration, setApneaDuration] = useState(null);
  const [apneaDurationMax, setApneaMax] = useState(null);
  const [apneaDurationMin, setApneaMin] = useState(null);
  const [apneaDurationMean, setApneaMean] = useState(null);

  const [sleepOnset, setSleepOnset] = useState("");
  const [sleepConclusion, setSleepConclusion] = useState("");
  const [wakeTransition, setWakeTransition] = useState(0);
  const [totalSleepTimeHours, setTotalSleepTimeHours] = useState("");
  const [totalSleepTimeMinutes, setTotalSleepTimeMinutes] = useState("");
  const [wakeAfterSleepOnsetHours, setWakeAfterSleepOnsetHours] = useState("");
  const [wakeAfterSleepOnsetMinutes, setWakeAfterSleepOnsetMinutes] =
    useState("");

  const [motionData, setMotionData] = useState({});

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [o2t, setO2t] = useState({});
  const [o2tPercentage, setO2TPercentage] = useState({});
  const [pr, setPR] = useState({});
  const [prPercentage, setPRPercentage] = useState({});
  const [ol, setOL] = useState({});
  const [olPercentage, setOLPercentage] = useState({});
  const [Drop3ph, setDrop3ph] = useState("");
  const [Drop4ph, setDrop4ph] = useState("");
  const [Drop3, setDrop3] = useState("");
  const [Drop4, setDrop4] = useState("");

  const [firstDate, setDateStart] = useState("");
  const [lastDate, setDateEnd] = useState("");

  const [mstartTime, setMStartTime] = useState("");
  const [mendTime, setMEndTime] = useState("");
  const [mduration, setMDuration] = useState("");
  const [o2drop, setO2drop] = useState("");

  const [lt90, setLt90] = useState("");
  const [lt80, setLt80] = useState("");
  const [lt88, setLt88] = useState("");

  const [IfileName, setIFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const pdfExportComponent = React.useRef(null);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };
  useEffect(() => {
    const fetchTests = async () => {
      const testsCollectionRef = collection(db, "patients", patientId, "tests");
      const testsQuery = query(testsCollectionRef);

      const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
        const testList = snapshot.docs.map((doc) => ({
          id: doc.id,
          datetime: doc.data().datetime.toDate().toLocaleString(),
          prediction: doc.data().prediction,
        }));
        setTests(testList);
      });

      return () => {
        unsubscribe();
      };
    };
    const fetchPatientNameAge = async () => {
      const patientDocRef = doc(db, "patients", patientId);
      const patientDoc = await getDoc(patientDocRef);

      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatientName(patientData.name);
        setPatientAge(patientData.age);
        setPatientGender(patientData.gender);
      }
    };

    const loadFromFirebase = async () => {
      const sensorQuery = query(
        collection(db, "patients", patientId, "tests", testId, "sensors"),
        orderBy("timestamp", "asc")
      );

      const spo2 = [];
      const mot = [];
      const pr = [];
      const t = [];
      const sensorSnapshot = await getDocs(sensorQuery);
      sensorSnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        spo2.push(Number(doc.data().spO2));
        mot.push(Number(doc.data().motion));
        pr.push(Number(doc.data().bpm));
        t.push(doc.data().timestamp.toDate().toLocaleString());
      });
      // setOxygenLevel(spo2);
      // setMotion(mot);
      // setPulseRate(pr);
      manipulateData(pr, spo2, mot, t);
    };

    fetchTests();
    fetchPatientNameAge();
    loadFromFirebase();
  }, []);
  const manipulateData = (
    pulseRateColumn,
    oxygenLevelColumn,
    motionColumn,
    timestampColumn
  ) => {
    function calculateColumnStats(
      pulseRateColumn,
      oxygenLevelColumn,
      motionColumn
    ) {
      const pulseRateMax = Math.max(...pulseRateColumn);
      const pulseRateAverage =
        pulseRateColumn.reduce((sum, value) => sum + value, 0) /
        pulseRateColumn.length;
      const pulseRateMin = Math.min(...pulseRateColumn);

      const oxygenLevelMax = Math.max(...oxygenLevelColumn);
      const oxygenLevelAverage =
        oxygenLevelColumn.reduce((sum, value) => sum + value, 0) /
        oxygenLevelColumn.length;
      const oxygenLevelMin = Math.min(...oxygenLevelColumn);

      const motionMax = Math.max(...motionColumn);
      const motionAverage =
        motionColumn.reduce((sum, value) => sum + value, 0) /
        motionColumn.length;
      const motionMin = Math.min(...motionColumn);

      setPulseRateData({
        highest: pulseRateMax.toFixed(2),
        average: pulseRateAverage.toFixed(2),
        lowest: pulseRateMin.toFixed(2),
      });

      setOxygenLevelData({
        highest: oxygenLevelMax.toFixed(2),
        average: oxygenLevelAverage.toFixed(2),
        lowest: oxygenLevelMin.toFixed(2),
      });

      setRespiratoryRateData({
        highest: (pulseRateMax/4).toFixed(2),
        average: (pulseRateAverage/4).toFixed(2),
        lowest: (pulseRateMin/4).toFixed(2),
      });

      setMotionData({
        highest: motionMax.toFixed(2),
        average: motionAverage.toFixed(2),
        lowest: motionMin.toFixed(2),
      });
      function calculateRMSSD(pulseRateColumn) {
        var RMSSD = 0;
        for(let i = 0 ; i < pulseRateColumn.length-1; i++){
          //console.log(pulseRateColumn[i]/4);
          //console.log(pulseRateColumn[i+1]/4);
          RMSSD = Math.sqrt((RMSSD + (Math.pow((pulseRateColumn[i+1]/4) - (pulseRateColumn[i]/4), 2)))/(pulseRateColumn.length -1));
          /*if (isNaN(RMSSD)){
            console.log("NAN");
          }
          else{
            console.log(RMSSD);
          }*/
        }
        console.log(RMSSD);
        return RMSSD;
      }
      function calculateSDNN(pulseRateColumn, pulseRateAverage){
        var SDNN = 0;
        for(let i = 0; i < pulseRateColumn.length; i++){
          SDNN =  Math.sqrt((SDNN + (Math.pow((pulseRateColumn[i]/4) - (pulseRateAverage/4), 2)))/(pulseRateColumn.length-1));
          /*if (isNaN(SDNN)){
            console.log("NAN");
          }
          else{
            console.log(SDNN);
          }*/
        }
        console.log(SDNN);
        return SDNN;
      }
        
      var RMSSD = calculateRMSSD(pulseRateColumn);
      var SDNN = calculateSDNN(pulseRateColumn, pulseRateAverage);
      console.log(RMSSD/SDNN.toFixed(2)/Math.pow(10, -3));
      setHeartratevariabilityData({value: (RMSSD/SDNN).toFixed(2)/Math.pow(10,-3),});
    }
    calculateColumnStats(pulseRateColumn, oxygenLevelColumn, motionColumn);

    function calculateTimeDuration(timestampColumn) {
      const mstartTime = timestampColumn[0];
      const mendTime = timestampColumn[timestampColumn.length - 1];

      const startTime24 = new Date(
        "2000-01-01 " + mstartTime
      ).toLocaleTimeString("en-US", { hour12: false });
      const endTime24 = new Date("2000-01-01 " + mendTime).toLocaleTimeString(
        "en-US",
        { hour12: false }
      );

      const mstartDate = new Date("2000-01-01 " + startTime24);
      const mendDate = new Date("2000-01-01 " + endTime24);

      const mdurationMs = mendDate - mstartDate;
      const mhours = Math.floor(mdurationMs / 3600000);
      const mminutes = Math.floor((mdurationMs % 3600000) / 60000);
      const mseconds = Math.floor((mdurationMs % 60000) / 1000);
      const mduration = `${mhours.toString().padStart(2, "0")}:${mminutes
        .toString()
        .padStart(2, "0")}:${mseconds.toString().padStart(2, "0")}`;

      const startTime = timestampColumn[0];
      const endTime = timestampColumn[timestampColumn.length - 2];
      //console.log (startTime);
      //console.log(endTime);

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      const durationMs = endDate - startDate + 10000;
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      const duration = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      //const Drop4 = ((Math.max(...oxygenLevelColumn)/100)*96)
      const Drop4 = Math.max(...oxygenLevelColumn) - 4;
      //console.log(Drop4);

      //const Drop3 = ((Math.max(...oxygenLevelColumn)/100)*97)
      const Drop3 = Math.max(...oxygenLevelColumn) - 3;
      //console.log(Drop3);

      const o2drop = {
        ">3": 0,
        ">4": 0,
      };

      oxygenLevelColumn.forEach((value) => {
        if (value < Drop4) {
          o2drop[">4"]++;
        } else if (value < Drop3) {
          o2drop[">3"]++;
        }
      });
      let timeString = String(hours);
      let Ihours = timeString.slice(0, 2);
      //console.log(Ihours);

      let Drop4ph = (o2drop[">4"] / Ihours).toFixed();
      //console.log(Drop4ph)
      let Drop3ph = (o2drop[">3"] / Ihours).toFixed();

      if (Ihours < 6) {
        Drop3ph = "Time<6h";
        Drop4ph = "Time<6h";
      }

      setStartTime(startTime);
      setEndTime(endTime);
      setDuration(duration);
      setMStartTime(mstartTime);
      setMEndTime(mendTime);
      setMDuration(mduration);
      setO2drop(o2drop);
      setDrop3ph(Drop3ph);
      setDrop4ph(Drop4ph);
    }
    calculateTimeDuration(timestampColumn);

    function calculateSleepOnset(pulseRateColumn, timestampColumn) {
      let time = 0;
      let pulseRate = 0;
      let dateTime = 0;
      let timeOnly = 0;

      for (let i = pulseRateColumn.length - 1; i >= 0; i--) {
        pulseRate = pulseRateColumn[i];

        if (pulseRate >= 50 || pulseRate <= 60) {
          dateTime = timestampColumn[i];
          timeOnly = dateTime.split(" ")[0] + " " + dateTime.split(" ")[1]; // To split datetime to extract time only

          time = timeOnly;
        }
        setSleepOnset(time);
      }
      return null; // Return null if no matching time value is found
    }
    calculateSleepOnset(pulseRateColumn, timestampColumn);

    function calculateSleepConclusion(pulseRateColumn, timestampColumn) {
      let time = 0;
      let pulseRate = 0;
      let dateTime = 0;
      let timeOnly = 0;

      for (let i = 0; i < pulseRateColumn.length; i++) {
        pulseRate = pulseRateColumn[i];

        if (pulseRate >= 70) {
          dateTime = timestampColumn[i];
          timeOnly = dateTime.split(" ")[0] + " " + dateTime.split(" ")[1]; // To split datetime to extract time only

          time = timeOnly;
        }
        setSleepConclusion(time);
        //console.log(time);
      }
      return null; // Return null if no matching time value is found
    }
    calculateSleepConclusion(pulseRateColumn, timestampColumn);

    function calculateWakeTransition(motionColumn) {
      let count = 0;

      for (let i = 0; i < motionColumn.length; i++) {
        const motion = motionColumn[i];

        if (motion >= 80) {
          count++;
        }
      }
      //console.log("motion:" ,count);
      setWakeTransition(count);
    }
    calculateWakeTransition(motionColumn);

    function calculateTotalSleepTime(motionColumn) {
      let totalTime = 0;

      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];

        if (motionValue < 10) {
          totalTime += 4;
        }
      }
      const hours = Math.floor(totalTime / 3600);
      const minutes = Math.floor((totalTime % 3600) / 60);

      //console.log('Total time: ' + hours + ' hours ' + minutes + ' minutes');

      setTotalSleepTimeHours(hours);
      setTotalSleepTimeMinutes(minutes);
    }
    calculateTotalSleepTime(motionColumn);

    function calculateWakeAfterSleepOnset(motionColumn) {
      let totalTime = 0;

      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];

        if (motionValue >= 10) {
          totalTime += 4;
        }
      }
      const hours = Math.floor(totalTime / 3600);
      const minutes = Math.floor((totalTime % 3600) / 60);

      setWakeAfterSleepOnsetHours(hours);
      setWakeAfterSleepOnsetMinutes(minutes);

      //console.log('Total time: ' + hours + ' hours ' + minutes + ' minutes');
    }
    calculateWakeAfterSleepOnset(motionColumn);
    /*
    function generateRandomSleepApneaIndicator() {
      const randomSleepApneaIndicator = Math.floor(Math.random() * 11) + 5;
      const saiInputElement = document.querySelector(".SAI_input");

      saiInputElement.textContent = randomSleepApneaIndicator;

      const sleepApneaElements = document.querySelectorAll(".Feedback_point2");
      const sleepApneaElement = sleepApneaElements[0];
      let sleepApneaText = "";

      if (randomSleepApneaIndicator > 10) {
        sleepApneaText =
          'Sleep Apnea Indicator is <span class="bold">above</span> expected value.';
      } else {
        sleepApneaText =
          'Sleep Apnea Indicator is <span class="bold">below</span> expected value.';
      }

      sleepApneaElement.innerHTML = sleepApneaText;
    }
    generateRandomSleepApneaIndicator();
    */
    function generateRandomRdiNumbers(motionColumn, oxygenLevelColumn) {
      //let randomNumber1 = Math.floor(Math.random() * 10) + 1;
      //let randomNumber2 = Math.floor(Math.random() * 10) + 1;
      var ahcount = 0;
      var tst = 0;
      for (let t = 0; t < motionColumn.length; t++) {
        if (motionColumn[t] < 10) {
          tst += 4;
        }
      }
      const TSTminutes = ((tst % 3600) / 60) + ((tst / 3600) * 60);
      for (let i = 0; i < oxygenLevelColumn.length; i++) {
        if (oxygenLevelColumn[i] <= 90) {
          ahcount += 1;
        }
      }
      const RDI = Math.floor(ahcount * 60 / TSTminutes);
      // Assign the generated numbers to the respective HTML elements
      document.querySelector(".SRDI_input").textContent = RDI;
      //document.querySelector(".SRDI_input1").textContent = randomNumber2;

      /*
      if (randomNumber1 <= randomNumber2) {
        // Swap the numbers if needed
        [randomNumber1, randomNumber2] = [randomNumber2, randomNumber1];

        document.querySelector(".SRDI_input").textContent = randomNumber1;
        document.querySelector(".SRDI_input1").textContent = randomNumber2;
      }
      */
    }
    generateRandomRdiNumbers(motionColumn, oxygenLevelColumn);
    /*
    function generateRandomObstructiveNumbers() {
      let randomNumber1 = Math.floor(Math.random() * 40) + 1;
      let randomNumber2 = Math.floor(Math.random() * 40) + 1;

      // Generate random difference between 1 and 9 (inclusive)
      const difference = Math.floor(Math.random() * 9) + 1;

      if (randomNumber1 <= randomNumber2) {
        randomNumber1 = randomNumber2 + difference;
      } else {
        randomNumber2 = randomNumber1 - difference;
      }

      document.querySelector(".SAHIO_input").textContent = randomNumber1;
      document.querySelector(".SAHIO_input1").textContent = randomNumber2;
    }
    generateRandomObstructiveNumbers();
    */

    function generateRandomSleepQualityIndex(motionColumn) {
      //const randomNumber = Math.floor(Math.random() * 36) + 30;
      let totalTime = 0;
      let count = 0;
      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];

        if (motionValue >= 10) {
          totalTime += 4;
          count += 1;
        }
      }
      const Awake = count;
      const Waso = totalTime;
      let totalTimeinbed = 0;
      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];
        if (motionValue < 10) {
          totalTimeinbed += 4;
        }
      }
      const Efficiency = Math.floor((((motionColumn.length -1)  * 4) / totalTimeinbed) * 100);
      const SQI = ((Awake * 0.3) + (Waso * 0.3) + (Efficiency * 0.4));
      console.log(SQI);

      const sqiElement = document.querySelector(".SQ_SQI");
      sqiElement.innerHTML = `SQI&nbsp;&nbsp;&nbsp;<span class="smaller-font">${/*randomNumber*/SQI}</span><br/><span class="expected smaller-font1">Expected &gt;55</span>`;

      const sleepQualityElements =
        document.querySelectorAll(".Feedback_point1");
      const sleepQualityElement = sleepQualityElements[1];
      let sleepQualityText = "";

      if (/*randomNumber*/SQI > 55) {
        sqiElement.style.backgroundColor = "green";
        sleepQualityText =
          'Sleep Quality is <span class="bold">above</span> expected value.';
      } else if (/*randomNumber*/SQI >= 45 && /*randomNumber*/SQI <= 55) {
        sqiElement.style.backgroundColor = "rgb(255, 204, 0)";
        sleepQualityText =
          'Sleep Quality is <span class="bold">below</span> expected value.';
      } else {
        sqiElement.style.backgroundColor = "red";
        sleepQualityText =
          'Sleep Quality is <span class="bold">below</span> expected value.';
      }

      sleepQualityElement.innerHTML = sleepQualityText;
    }
    generateRandomSleepQualityIndex(motionColumn);

    function generateRandomEfficiency(motionColumn) {
      let totalTimeinbed = 0;
      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];
        if (motionValue < 10) {
          totalTimeinbed += 4;
        }
      }
      const efficiencynumber = Math.floor((((motionColumn.length -1)  * 4) / totalTimeinbed) * 100);
      console.log("bed number: " + totalTimeinbed);
      console.log("total number: " + ((motionColumn.length -1)  * 4));
      console.log("efficiency number: " + efficiencynumber);
      //const randomNumber = Math.floor(Math.random() * 21) + 75;
      const efficiencyElement = document.querySelector(".SQ_EFF");
      efficiencyElement.innerHTML = `EFFICIENCY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${efficiencynumber}%</span><br/><span class="expected smaller-font1">Expected &gt;85%</span`;

      const sleepEfficiencyElements =
        document.querySelectorAll(".Feedback_point1");
      const sleepEfficiencyElement = sleepEfficiencyElements[2];
      let sleepEfficiencyText = "";

      if (/*randomNumber*/ efficiencynumber > 85) {
        efficiencyElement.style.backgroundColor = "green";
        sleepEfficiencyText =
          'Sleep Efficiency is <span class="bold">above</span> expected value.';
      } else if (/*randomNumber*/ efficiencynumber >= 80 && /*randomNumber*/ efficiencynumber <= 85) {
        efficiencyElement.style.backgroundColor = "rgb(255, 204, 0)";
        sleepEfficiencyText =
          'Sleep Efficiency is <span class="bold">below</span> expected value.';
      } else {
        efficiencyElement.style.backgroundColor = "red";
        sleepEfficiencyText =
          'Sleep Efficiency is <span class="bold">below</span> expected value.';
      }

      sleepEfficiencyElement.innerHTML = sleepEfficiencyText;
    }
    generateRandomEfficiency(motionColumn);

    function generateRandomFragmentation(motionColumn) {
      
      let remtostage = 0;
      for (let i = 0; i < motionColumn.length; i++){
        if(motionColumn[i] > 10){
          if(motionColumn[i+1] == 0){
            remtostage += 1;
          }
        }
      }
      
      const SFI = Math.floor(remtostage / ((motionColumn.length - 1) * 4 / 3600))
      console.log(SFI);
      console.log(remtostage);
      console.log((motionColumn.length - 1)/3600);
      
      //const randomNumber = Math.floor(Math.random() * 24) + 7;
      const fragmentElement = document.querySelector(".SP_fragmentation");
      fragmentElement.innerHTML = `FRAGMENTATION&nbsp;&nbsp;&nbsp;<span class="smaller-font">${/*randomNumber*/SFI}%</span><br/><span class="expected smaller-font1">Expected &lt;15%</span`;

      const sleepFragmentElements =
        document.querySelectorAll(".Feedback_point2");
      const sleepFragmentElement = sleepFragmentElements[2];
      let sleepFragmentText = "";

      if (/*randomNumber*/SFI < 15) {
        fragmentElement.style.backgroundColor = "green";
        sleepFragmentText =
          'Sleep Fragmentation is <span class="bold">below</span> expected value.';
      } else if (/*randomNumber*/SFI >= 15 && /*randomNumber*/SFI <= 20) {
        fragmentElement.style.backgroundColor = "rgb(255, 204, 0)";
        sleepFragmentText =
          'Sleep Fragmentation is <span class="bold">above</span> expected value.';
      } else {
        fragmentElement.style.backgroundColor = "red";
        sleepFragmentText =
          'Sleep Fragmentation is <span class="bold">above</span> expected value.';
      }
      sleepFragmentElement.innerHTML = sleepFragmentText;
    }
    generateRandomFragmentation(motionColumn);

    function generateRandomPeriodicity() {
      const randomNumber = Math.floor(Math.random() * 31);
      const periodElement = document.querySelector(".SP_periodicity");
      periodElement.innerHTML = `PERIODICITY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${randomNumber}%</span><br/><span class="expected smaller-font1">Expected &le;2%</span`;

      const sleepPeriodElements = document.querySelectorAll(".Feedback_point2");
      const sleepPeriodElement = sleepPeriodElements[3];
      let sleepPeriodtText = "";

      if (randomNumber <= 2) {
        periodElement.style.backgroundColor = "green";
        sleepPeriodtText =
          'Periodicity is <span class="bold">below</span> expected value.';
      } else if (randomNumber > 2 && randomNumber <= 15) {
        periodElement.style.backgroundColor = "rgb(255, 204, 0)";
        sleepPeriodtText =
          'Periodicity is <span class="bold">above</span> expected value.';
      } else {
        periodElement.style.backgroundColor = "red";
        sleepPeriodtText =
          'Periodicity is <span class="bold">above</span> expected value.';
      }
      sleepPeriodElement.innerHTML = sleepPeriodtText;
    }
    generateRandomPeriodicity();

    function generateRandomDuration(timestampColumn) {
      const startTime = timestampColumn[0];
      const endTime = timestampColumn[timestampColumn.length - 1];

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      //console.log(startDate);
      //console.log(endDate);
      const durationMs = endDate - startDate /*+ 10000*/;
      //console.log(endDate - startDate);
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      const duration = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      const periodElement = document.querySelector(".SO_Duration");

      let timeString = String(hours);
      let Ihours = timeString.slice(0, 2);

      const randomDurationElements =
        document.querySelectorAll(".Feedback_point1");
      const randomDurationElement = randomDurationElements[3];
      let randomDurationText = "";

      if (Ihours > 6) {
        periodElement.style.backgroundColor = "green";
        randomDurationText =
          'Sleep Duration is <span class="bold">within</span> expected value.';
      } else if (Ihours >= 2 && Ihours <= 6) {
        periodElement.style.backgroundColor = "rgb(255, 204, 0)";
        randomDurationText =
          'Sleep Duration is <span class="bold">below</span> expected value. ';
      } else {
        periodElement.style.backgroundColor = "red";
        randomDurationText =
          'Sleep Duration is <span class="bold">below</span> expected value. ';
      }

      console.log(Ihours);
      setDuration(duration);

      randomDurationElement.innerHTML = randomDurationText;
    }
    generateRandomDuration(timestampColumn);

    function generateRandomLatency() {
      const hours = 0;
      const minutes = Math.floor(Math.random() * 21) + 30;
      
      const formattedTime = `${hours.toString().padStart(1, "0")}h:${minutes
        .toString()
        .padStart(2, "0")}`;
      const latencyElement = document.querySelector(".SO_Latency");
      latencyElement.innerHTML = `LATENCY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${formattedTime}m</span><br/><span class="expected smaller-font1">Expected &lt;30 min</span`;

      if (formattedTime <= "00:20") {
        latencyElement.style.backgroundColor = "green";
      } else if (formattedTime > "00:20" && formattedTime <= "00:45") {
        latencyElement.style.backgroundColor = "rgb(255, 204, 0)";
      } else {
        latencyElement.style.backgroundColor = "red";
      }
    }
    generateRandomLatency();

    function generateRandomAverageSignalQuality(motionColumn, timestampColumn,pulseRateColumn) {
      //const randomNumber = Math.floor(Math.random() * 11) + 85;
      const pulseRateAverage =
      pulseRateColumn.reduce((sum, value) => sum + value, 0) /
      pulseRateColumn.length;

      var RMSSD = 0;
      for(let i = 0 ; i < pulseRateColumn.length-1; i++){
        RMSSD = Math.sqrt((RMSSD + (Math.pow((pulseRateColumn[i+1]/4) - (pulseRateColumn[i]/4), 2)))/(pulseRateColumn.length -1));
      }
      var SDNN = 0;
      for(let i = 0; i < pulseRateColumn.length; i++){
        SDNN =  Math.sqrt((SDNN + (Math.pow((pulseRateColumn[i]/4) - (pulseRateAverage/4), 2)))/(pulseRateColumn.length-1));
      }

      console.log(RMSSD);
      console.log(SDNN);

      const HRV_inputValue = (RMSSD/SDNN).toFixed(2)/Math.pow(10,-3);
      console.log(HRV_inputValue);
          
      const RR_inputValue = pulseRateAverage/4;

      let totalTimeinbed = 0;
      let moved = 0;
      for (let i = 0; i < motionColumn.length; i++) {
        const motionValue = motionColumn[i];
        if (motionValue < 10) {
          totalTimeinbed += 4;
        }
        if(motionValue > 2){
          moved += 1;
        }
      }
      const Efficiency = Math.floor((((motionColumn.length -1)  * 4) / totalTimeinbed) * 100);
      const hasmoved = moved;

      const startTime = timestampColumn[0];
      const endTime = timestampColumn[timestampColumn.length - 1];

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const durationMs = endDate - startDate /*+ 10000*/;
      const duration = durationMs * Math.pow(10,-3);
      
      console.log(Efficiency);
      console.log(duration);
      console.log(hasmoved);
      const ASQ = ((HRV_inputValue * 0.2) + (RR_inputValue * 0.25)  + (Efficiency * 0.2) + (duration * 0.15) + (hasmoved * 0.2)) / 5; 
      
      const averageSignalElements =
        document.querySelectorAll(".Feedback_point1");
      const averageSignalElement = averageSignalElements[0];
      const updatedText = `Average Signal Quality is <span class="bold">${/*randomNumber*/ASQ.toFixed(2)}</span> %.`;
      averageSignalElement.innerHTML = updatedText;
    }
    generateRandomAverageSignalQuality(motionColumn, timestampColumn, pulseRateColumn);
    /*
    function generateRandomCentral() {
      const randomCentralNumber = Math.floor(Math.random() * 6);

      document.querySelector(".SAHIC_input").textContent = randomCentralNumber;
      document.querySelector(".SAHIC_input1").textContent = randomCentralNumber;
    }
    generateRandomCentral();
    */

    function secondsToHMS(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    function calculateOxygenLevelThreshold(oxygenLevelColumn) {
      const o2t = {
        "<90": 0,
        "<88": 0,
        "<80": 0,
      };
      const totalCount = oxygenLevelColumn.length;

      oxygenLevelColumn.forEach((o2tvalue) => {
        if (o2tvalue >= 95) {
          o2t["<90"]++;
        } else if (o2tvalue >= 90 && o2tvalue <= 94) {
          o2t["<88"]++;
        } else {
          o2t["<80"]++;
        }
      });

      const lt90 = secondsToHMS(o2t["<90"] * 4);
      const lt88 = secondsToHMS(o2t["<88"] * 4);
      const lt80 = secondsToHMS(o2t["<80"] * 4);

      const o2tPercentage = {
        "<90": ((o2t["<90"] / totalCount) * 100).toFixed(2),
        "<88": ((o2t["<88"] / totalCount) * 100).toFixed(2),
        "<80": ((o2t["<80"] / totalCount) * 100).toFixed(2),
      };
      setLt90(lt90);
      setLt80(lt80);
      setLt88(lt88);

      setO2TPercentage(o2tPercentage);
    }
    calculateOxygenLevelThreshold(oxygenLevelColumn);

    function calculatePulseRateThreshold(pulseRateColumn) {
      const pr = {
        "≥120": 0,
        "50-120": 0,
        "≤50": 0,
      };
      const totalCount = pulseRateColumn.length;

      pulseRateColumn.forEach((prvalue) => {
        if (prvalue >= 95) {
          pr["≥120"]++;
        } else if (prvalue >= 90 && prvalue <= 94) {
          pr["50-120"]++;
        } else {
          pr["≤50"]++;
        }
      });

      console.log(pulseRateColumn);

      const prPercentage = {
        "≥120": ((pr["≥120"] / totalCount) * 100).toFixed(2),
        "50-120": ((pr["50-120"] / totalCount) * 100).toFixed(2),
        "≤50": ((pr["≤50"] / totalCount) * 100).toFixed(2),
      };

      setPR(pr);
      setPRPercentage(prPercentage);
    }
    calculatePulseRateThreshold(pulseRateColumn);

    function calculateApneaDuration(oxygenLevelColumn) {
      let apneaDurationSum = 0;
      let apneaDurationCount = 0;
      let apneaDurationMin = 0;
      let apneaDurationMax = 0;

      for (let i = 0; i < oxygenLevelColumn.length; i++) {
        const oxygenLevel = oxygenLevelColumn[i];

        if (oxygenLevel < 90) {
          apneaDurationCount++;
          apneaDurationSum += 4; // Assuming interval per time is 4 seconds

          if (apneaDurationSum > apneaDurationMax) {
            apneaDurationMax = apneaDurationSum;
          }

          if (apneaDurationSum < apneaDurationMin) {
            apneaDurationMin = apneaDurationSum;
          }
        } else {
          apneaDurationSum = 0;
        }
      }

      let apneaDurationMean = apneaDurationSum / apneaDurationCount;
      console.log("test11", apneaDurationCount);
      console.log("test", apneaDurationMean);
      if (isNaN(apneaDurationMean)) {
        apneaDurationMean = 0;
      }
      return {
        lowest: apneaDurationMin,
        highest: apneaDurationMax,
        average: apneaDurationMean,
      };
    }
    const apneaDurationData = calculateApneaDuration(oxygenLevelColumn);
    setApneaDuration(apneaDurationData);
    setApneaMax(apneaDurationData.highest);
    setApneaMin(apneaDurationData.lowest);
    setApneaMean(apneaDurationData.average);

    function calculateOxygenLevelDuration(oxygenLevelColumn) {
      const ol = {
        "96-100": 0,
        "91-95": 0,
        "86-90": 0,
        "81-85": 0,
        "76-80": 0,
        "70-75": 0,
        "≤70": 0,
      };
      const totalCount = oxygenLevelColumn.length;

      oxygenLevelColumn.forEach((value) => {
        if (value <= 70) {
          ol["≤70"]++;
        } else if (value >= 70 && value <= 75) {
          ol["70-75"]++;
        } else if (value >= 76 && value <= 80) {
          ol["76-80"]++;
        } else if (value >= 81 && value <= 85) {
          ol["81-85"]++;
        } else if (value >= 86 && value <= 90) {
          ol["86-90"]++;
        } else if (value >= 91 && value <= 95) {
          ol["91-95"]++;
        } else if (value >= 96 && value <= 100) {
          ol["96-100"]++;
        }
      });

      //console.log("pp",ol["96-100"]);
      const olPercentage = {
        "96-100": ((ol["96-100"] / totalCount) * 100).toFixed(2),
        "91-95": ((ol["91-95"] / totalCount) * 100).toFixed(2),
        "86-90": ((ol["86-90"] / totalCount) * 100).toFixed(2),
        "81-85": ((ol["81-85"] / totalCount) * 100).toFixed(2),
        "76-80": ((ol["76-80"] / totalCount) * 100).toFixed(2),
        "70-75": ((ol["70-75"] / totalCount) * 100).toFixed(2),
        "≤70": ((ol["≤70"] / totalCount) * 100).toFixed(2),
      };
      setOL(ol);
      setOLPercentage(olPercentage);
    }
    calculateOxygenLevelDuration(oxygenLevelColumn);

    /*
    function calculateSahiTotal(oxygenLevelColumn) {
      let threecount = 0;
      let fourcount = 0;
      for(let i = 0 ; i < oxygenLevelColumn.length - 2 ; i ++){
        if((oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+1] &&
        (oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+2] &&
        (oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+3]){
          threecount+=1;
        }
      }
      console.log(threecount);
      console.log((oxygenLevelColumn.length * 4)/3600);
      const AHI = threecount / ((oxygenLevelColumn.length * 4)/3600)
      console.log(AHI);
      document.querySelector(".SAHIT_input").textContent = AHI.toFixed(2);

      for(let i = 0 ; i < oxygenLevelColumn.length - 2 ; i ++){
        if((oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+1] &&
        (oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+2] &&
        (oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+3]){
          fourcount+=1;
        }
      }
      console.log(fourcount);
      console.log((oxygenLevelColumn.length * 4)/3600);
      const fourahi = fourcount / ((oxygenLevelColumn.length * 4)/3600)
      console.log(fourahi);
      document.querySelector(".SAHIT_input1").textContent = fourahi.toFixed(2);
      /*
      const SAHIO_inputValue = parseInt(
        document.querySelector(".SAHIO_input").textContent
      );
      const SAHIC_inputValue = parseInt(
        document.querySelector(".SAHIC_input").textContent
      );
      const SAHIO_input1Value = parseInt(
        document.querySelector(".SAHIO_input1").textContent
      );
      const SAHIC_input1Value = parseInt(
        document.querySelector(".SAHIC_input1").textContent
      );
      const total = SAHIO_inputValue + SAHIC_inputValue;
      

      document.querySelector(".SAHIT_input").textContent = AHI.toFixed(2);
      document.querySelector(".SAHIT_input1").textContent =
        SAHIO_input1Value + SAHIC_input1Value;
      
    }
    calculateSahiTotal(oxygenLevelColumn);
    */
    

    function generateStatus(pulseRateColumn){
      const pulseRateAverage =
      pulseRateColumn.reduce((sum, value) => sum + value, 0) /
      pulseRateColumn.length;

      var RMSSD = 0;
      for(let i = 0 ; i < pulseRateColumn.length-1; i++){
        RMSSD = Math.sqrt((RMSSD + (Math.pow((pulseRateColumn[i+1]/4) - (pulseRateColumn[i]/4), 2)))/(pulseRateColumn.length -1));
      }
      var SDNN = 0;
      for(let i = 0; i < pulseRateColumn.length; i++){
        SDNN =  Math.sqrt((SDNN + (Math.pow((pulseRateColumn[i]/4) - (pulseRateAverage/4), 2)))/(pulseRateColumn.length-1));
      }

      console.log(RMSSD);
      console.log(SDNN);
          
      const RR_inputValue = pulseRateAverage/4;
      var RR_Status = document.querySelector(".RR_Status");
      var status = "";
      if(RR_inputValue > 20.0){
        status = "High";
        console.log(status);
        RR_Status.innerHTML = `<div className="RR_Status">${status}</div>`; //high
      }
      else if(RR_inputValue < 12.0){
        status = "Low";
        console.log(status);
        RR_Status.innerHTML = `<div className="RR_Status">${status}</div>`; //low
      }
      else{
        status = "Normal";
        console.log(status);
        RR_Status.innerHTML = `<div className="RR_Status">${status}</div>`; //normal
      }
  
      const HRV_inputValue = (RMSSD/SDNN).toFixed(2)/Math.pow(10,-3);
      console.log(HRV_inputValue);
      var HRV_Status = document.querySelector(".HRV_Status");
  
      if(HRV_inputValue > 1000.0){ 
        status = "High";
        console.log(status);
        HRV_Status.innerHTML = `<div className="HRV_Status">${status}</div>`; // high
      }
      else if(HRV_inputValue < 60.0){
        status = "Low";
        console.log(status);
        HRV_Status.innerHTML = `<div className="HRV_Status">${status}</div>`; //low
      }
      else{
        status = "Normal";
        console.log(status);
        HRV_Status.innerHTML = `<div className="HRV_Status">${status}</div>`; //normal
      }
    }
    generateStatus(pulseRateColumn);

    function displaySahiTotal(oxygenLevelColumn) {
      /*const SAHIT_inputValue = parseInt(
        document.querySelector(".SAHIT_input").textContent
      );*/
      let threecount = 0;
      for(let i = 0 ; i < oxygenLevelColumn.length - 2 ; i ++){
        if((oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+1] &&
        (oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+2] &&
        (oxygenLevelColumn[i] - 3) >= oxygenLevelColumn[i+3]){
          threecount+=1;
        }
      }
      console.log(threecount);
      console.log((oxygenLevelColumn.length * 4)/3600);
      const AHI = threecount / ((oxygenLevelColumn.length * 4)/3600)
      console.log(AHI);
      //document.querySelector(".SAHIT_input").textContent = AHI.toFixed(2);
      const SA_SAI = document.querySelector(".SA_SAI");

      SA_SAI.innerHTML = `sAHI<span class="small-number">3%</span> ${AHI.toFixed(2)}`;

      const saiElements = document.querySelectorAll(".Feedback_point2");
      const saiElement = saiElements[1];
      let saiText = "";

      if (AHI.toFixed(2) >= 1 && AHI.toFixed(2) <= 4) {
        SA_SAI.style.backgroundColor = "green";
        SA_SAI.innerHTML += "<br>Normal";
        saiText = 'Apnea Hypopnea Index is <span class="bold">Normal</span>.';
      } else if (AHI.toFixed(2) >= 5 && AHI.toFixed(2) <= 15) {
        SA_SAI.style.backgroundColor = "rgb(255, 204, 0)";
        SA_SAI.innerHTML += "<br>Mild";
        saiText = 'Apnea Hypopnea Index is <span class="bold">Mild</span>.';
      } else {
        SA_SAI.style.backgroundColor = "red";
        SA_SAI.innerHTML += "<br>Severe";
        saiText = 'Apnea Hypopnea Index is <span class="bold">Severe</span>.';
      }
      saiElement.innerHTML = saiText;


      function displaySahiTotal1(oxygenLevelColumn) {
        let fourcount = 0;
        for(let i = 0 ; i < oxygenLevelColumn.length - 2 ; i ++){
          if((oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+1] &&
          (oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+2] &&
          (oxygenLevelColumn[i] - 4) >= oxygenLevelColumn[i+3]){
            fourcount+=1;
          }
        }
        console.log(fourcount);
        console.log((oxygenLevelColumn.length * 4)/3600);
        const fourahi = fourcount / ((oxygenLevelColumn.length * 4)/3600)
        console.log(fourahi);
        //document.querySelector(".SAHIT_input1").textContent = fourahi.toFixed(2);
        /*const SAHIT_inputValue = parseInt(
          document.querySelector(".SAHIT_input1").textContent
        );*/
        const SA_sAHI = document.querySelector(".SA_sAHI");

        SA_sAHI.innerHTML = `sAHI<span class="small-number">4%</span> ${fourahi.toFixed(2)}`;

        if (fourahi.toFixed(2) >= 1 && fourahi.toFixed(2) <= 4) {
          SA_sAHI.style.backgroundColor = "green";
          SA_sAHI.innerHTML += "<br>Normal";
        } else if (fourahi.toFixed(2) >= 5 && fourahi.toFixed(2) <= 15) {
          SA_sAHI.style.backgroundColor = "rgb(255, 204, 0)";
          SA_sAHI.innerHTML += "<br>Mild";
        } else {
          SA_sAHI.style.backgroundColor = "red";
          SA_sAHI.innerHTML += "<br>Severe";
        }
      }
      displaySahiTotal1(oxygenLevelColumn);
    }
    displaySahiTotal(oxygenLevelColumn);
  };

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      if (file.type !== "text/csv") {
        setErrorMessage("Invalid file type. Select a New CSV File");
        setFileUploaded(false);
        return;
      }
      setIFileName(file.name);
      setFileUploaded(true);
      setErrorMessage("");
      reader.onload = function (e) {
        const fileContent = e.target.result;

        Papa.parse(fileContent, {
          complete: function (results) {
            const data = results.data;
            const headerRow = data[0];
            const pulseRateIndex = headerRow.indexOf("Pulse Rate");
            const oxygenLevelIndex = headerRow.indexOf("Oxygen Level");
            const motionIndex = headerRow.indexOf("Motion");
            const timestampIndex = headerRow.indexOf("Time");
            const dateIndex = headerRow.indexOf("Date");
            function handleNaN(value) {
              return Number.isNaN(value) ? "-" : value;
            }
            // Extracting the columns
            const pulseRateColumn = data
              .slice(1, -1)
              .map((row) => handleNaN(Number(row[pulseRateIndex])));
            const oxygenLevelColumn = data
              .slice(1, -1)
              .map((row) => handleNaN(Number(row[oxygenLevelIndex])));
            const motionColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[motionIndex])));
            const timestampColumn = data
              .slice(1, -1)
              .map((row) => row[timestampIndex]);

            manipulateData(
              pulseRateColumn,
              oxygenLevelColumn,
              motionColumn,
              timestampColumn
            );
          },
        });
        setFileUploaded(true);
      };
      reader.readAsText(file);
    });
    input.click();
  };

  return (
    <div>
      <Navigation />
      <div className="page_control">
        {patientId == null && (
          <button className="import_button_text" onClick={handleFileImport}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="24"
              fill="currentColor"
              class="bi bi-filetype-csv"
              viewBox="0 0 22 18"
            >
              <path
                fill-rule="evenodd"
                d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"
              />
            </svg>
            Import CSV
          </button>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {fileUploaded && (
          <div className="upload-status">File uploaded successfully!</div>
        )}
        <div className="export_label"> Export as: </div>
        <button className="export_button_text" onClick={exportPDFWithComponent}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="24"
            fill="currentColor"
            class="bi bi-filetype-pdf"
            viewBox="0 0 22 18"
          >
            <path
              fill-rule="evenodd"
              d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 0 1 .354.454c.079.201.118.452.118.753a2.3 2.3 0 0 1-.068.592 1.14 1.14 0 0 1-.196.422.8.8 0 0 1-.334.252 1.298 1.298 0 0 1-.483.082h-.563v-2.707Zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896Z"
            />
          </svg>
        </button>
      </div>

      <div className="SRpage">
        <PDFExport
          ref={pdfExportComponent}
          paperSize="auto"
          margin={40}
          fileName={`O2Report for`}
        >
          <div className="SRheader">
            <h1>Sleep Quality Report</h1>
          </div>
          {patientId == null && (
            <>
              <div className="current-datetime">
                File Imported Datetime: {currentDate}, {currentTime}
              </div>
              <div className="current-filename">
                File Imported Name: {IfileName}
              </div>
            </>
          )}

          <div className="SQ_section">
            <div className="SQ_label">Sleep Quality</div>
            <div className="SQ_SQI">
              SQI <br />
              <span class="smaller-font1">Expected &gt;55</span>{" "}
            </div>
            <div className="SQ_EFF">
              EFFICIENCY <br />
              <span class="smaller-font1"> Expected &gt;85%</span>
            </div>
          </div>

          <div className="SO_section">
            <div className="SO_label">Sleep Opportunity</div>
            <div className="SO_Latency">
              LATENCY
              <br />
              <span class="smaller-font1"> Expected &lt;30 min</span>
            </div>
            <div class="SO_Duration">
              DURATION {duration} <br />
              <span class="smaller-font1"> Expected 7-9 hours </span>
            </div>
          </div>

          <div class="SA _section">
            <div className="SA_label">Sleep Apnea</div>
            <div className="SA_SAI">
              sAHI<span class="small-number">3%</span>
            </div>
            <div className="SA_sAHI">
              sAHI<span class="small-number">4%</span>
            </div>
          </div>

          <div className="SP_section">
            <div className="SP_label">Sleep Pathology</div>
            <div className="SP_fragmentation">
              FRAGEMENTATION <br />
              <span class="smaller-font1">Expected &lt;15%</span>
            </div>
            <div className="SP_periodicity">
              PERIODICITY <br />
              <span class="smaller-font1">Expected &le;2% </span>
            </div>
          </div>
          
          <div className="SLPO_title">Sleep Onset </div>
          <div className="SLPO_input">{sleepOnset}</div>

          <div className="SLPC_title">Sleep Conclusion </div>
          <div className="SLPC_input">{sleepConclusion}</div>

          <div className="TST_title">TST</div>
          <div className="TST_input">
            {totalSleepTimeHours}h:{totalSleepTimeMinutes}m
          </div>

          <div className="WASO_title">WASO </div>
          <div className="WASO_input">
            {wakeAfterSleepOnsetHours}h:{wakeAfterSleepOnsetMinutes}m
          </div>

          <div className="WT_title">Wake Transistion</div>
          <div className="WT_input"> #{wakeTransition}</div>

          <div className="Snore_title">Snore </div>
          <div className="Snore_input">N/A</div>

          <div className="BP_title">Body Position </div>
          <div className="BP_input">N/A</div>

          <div className="SPH_title">SpO2 &lt;90%</div>
          <div className="SPH_input">
            {lt90} - {o2tPercentage["<90"]}%
          </div>

          <div className="SPM_title">SpO2 &lt;88%</div>
          <div className="SPM_input">
            {lt88} - {o2tPercentage["<88"]}%
          </div>

          <div className="SPL_title">SpO2 &lt;80%</div>
          <div className="SPL_input">
            {lt80} - {o2tPercentage["<80"]}%
          </div>

          <div className="MMM_title">MIN-MAX-MEAN SPo2</div>
          <div className="MMM_input">
            {oxygenLevelData.lowest}%-{oxygenLevelData.highest}%-
            {oxygenLevelData.average}%
          </div>

          <div className="D_label">Desaturations</div>
          <div className="D3_label">3%</div>
          <div className="D4_label">4%</div>

          <div className="SRDI_title">sRDI</div>
          <div className="SRDI_input"></div>

          <div className="ODI_title">ODI</div>
          <div className="ODI_input">{Drop3ph}</div>
          <div className="ODI_input1">{Drop4ph}</div>

          <div className="Min_label">Min</div>
          <div className="Max_label">Max</div>
          <div className="Mean_label">Mean</div>

          <div className="AD_title">APNEA DURATION (sec)</div>
          <div className="AD_input">{apneaDurationMin}</div>
          <div className="AD_input1">{apneaDurationMax}</div>
          <div className="AD_input2">{apneaDurationMean}</div>

          <div className="HR_title">HEART RATE (BPM)</div>
          <div className="HR_input">{pulseRateData.lowest}</div>
          <div className="HR_input1">{pulseRateData.highest}</div>
          <div className="HR_input2">{pulseRateData.average}</div>

          <div className="RR_title">RESPIRATORY RATE (RR)</div>
          <div className="RR_input" >{respiratoryRateData.average} </div> 
          <div className="RR_Status" placeholder="NIL"></div>

          <div className="HRV_title">HEART RATE VARIABILITY (HRV)</div>
          <div className="HRV_input" >{heartratevariabilityData.value}</div>
          <div className="HRV_Status" placeholder="NIL"></div>

          <div className="Feedback">
            <div className="Report_Label">
              Test Summary:
              <br />
              <br />
              <span class="larger_font">
                Patient:{" "}
                {patientId == null && (
                  <input
                    type="number"
                    className="age_input_sr"
                    min="1"
                    max="100"
                    placeholder="Age"
                    onInput={(event) => {
                      if (event.target.value > 100) {
                        event.target.value = 100;
                      } else if (event.target.value < 1) {
                        event.target.value = 1;
                      }
                    }}
                  />
                )}
                {patientId != null && <>{patientAge} </>}
                years old
                {patientId == null && (
                  <select className="gender_input_sr">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                )}
                {patientId != null && (
                  <p className="patientgender1">Gender: {patientGender}</p>
                )}
              </span>
              <br />
              <br />
              <span class="Feedback_point1"></span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span class="Feedback_point2"></span>
              <br />
              <span class="Feedback_point1"></span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span class="Feedback_point2"></span>
              <br />
              <span class="Feedback_point1"></span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span class="Feedback_point2"></span>
              <br />
              <span class="Feedback_point1"></span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span class="Feedback_point2"></span>
            </div>
          </div>
        </PDFExport>
      </div>
    </div>
  );
};

export default SleepReport;
