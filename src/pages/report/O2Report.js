import React, { useState, useRef } from "react";
import Navigation from "../../components/Navigation/Navigation";
import LineChart from "../../components/DisplayChart/LineChart";
import BarChart from "../../components/DisplayChart/BarChart";
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
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
import Papa from "papaparse";
import "./O2Report.css";

const O2Report = () => {
  const { patientId, testId } = useParams();
  const [tests, setTests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [respiratoryRateData, setRespiratoryRateData] = useState({});
  const [heartratevariabilityData, setHeartratevariabilityData] = useState({});
  const [pulseRateData, setPulseRateData] = useState({});
  const [oxygenLevelData, setOxygenLevelData] = useState({});
  const [motionData, setMotionData] = useState({});
  const [pulseRateChartData, setPulseRateChartData] = useState({});
  const [oxygenLevelChartData, setOxygenLevelChartData] = useState({});
  const [motionChartData, setMotionChartData] = useState({});
  const [OLRatioData, setOLRatioData] = useState({});
  const [respiratoryRateChartData, setRespiratoryRateChartData] = useState({});
  const [firstDate, setDateStart] = useState("");
  const [lastDate, setDateEnd] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [mstartTime, setMStartTime] = useState("");
  const [mendTime, setMEndTime] = useState("");
  const [mduration, setMDuration] = useState("");
  const [gt95, setGt95] = useState("");
  const [el9094, setEl9094] = useState("");
  const [lt90, setLt90] = useState("");
  const [gt120, setGt120] = useState("");
  const [bt50120, setBt50120] = useState("");
  const [lt50, setLt50] = useState("");
  const [bt95100, setbt95100] = useState("");
  const [bt9094, setbt9094] = useState("");
  const [bt8690, setBt8690] = useState("");
  const [bt8185, setBt8185] = useState("");
  const [bt8089, setbt8089] = useState("");
  const [bt7079, setbt7079] = useState("");
  const [lt70, setLt70] = useState("");
  const [o2tPercentage, setO2TPercentage] = useState({});
  const [prPercentage, setPRPercentage] = useState({});
  const [olPercentage, setOLPercentage] = useState({});
  const [Drop3ph, setDrop3ph] = useState("");
  const [Drop4ph, setDrop4ph] = useState("");
  const [o2Score, seto2Score] = useState("");
  const [o2drop, setO2drop] = useState("");
  const [o2t, setO2t] = useState({});
  const [pr, setPR] = useState({});
  const [ol, setOL] = useState({});
  const [IfileName, setIFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const pdfExportComponent = React.useRef(null);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });


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

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

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

      setRespiratoryRateData({
        highest: (pulseRateMax/4).toFixed(2),
        average: (pulseRateAverage/4).toFixed(2),
        lowest: (pulseRateMin/4).toFixed(2),
      });

      setOxygenLevelData({
        highest: oxygenLevelMax.toFixed(2),
        average: oxygenLevelAverage.toFixed(2),
        lowest: oxygenLevelMin.toFixed(2),
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
      setHeartratevariabilityData({value: (RMSSD/SDNN).toFixed(2)/Math.pow(10, -3),});
    }
    calculateColumnStats(pulseRateColumn, oxygenLevelColumn, motionColumn);


    function calculateO2Score(oxygenLevelColumn) {
      const o2valueCounts = {
        "70-74": 0,
        "75-79": 0,
        "80-84": 0,
        "85-89": 0,
        "90-94": 0,
        "95-100": 0,
      };

      oxygenLevelColumn.forEach((o2value) => {
        if (o2value >= 70 && o2value <= 74) {
          o2valueCounts["70-74"]++;
        } else if (o2value >= 75 && o2value <= 79) {
          o2valueCounts["75-79"]++;
        } else if (o2value >= 80 && o2value <= 84) {
          o2valueCounts["80-84"]++;
        } else if (o2value >= 85 && o2value <= 89) {
          o2valueCounts["85-89"]++;
        } else if (o2value >= 90 && o2value <= 94) {
          o2valueCounts["90-94"]++;
        } else if (o2value >= 95 && o2value <= 100) {
          o2valueCounts["95-100"]++;
        }
      });

      const o2totalCount = oxygenLevelColumn.length;
      const o2ratios = Object.values(o2valueCounts).map(
        (o2count) => (o2count / o2totalCount) * 100
      );
      const o2Score =
        o2ratios[0] * 0.2 +
        o2ratios[1] * 0.4 +
        o2ratios[2] * 0.6 +
        o2ratios[3] * 0.8 +
        o2ratios[4] * 1 +
        o2ratios[5] * 1.2;
      const scaledO2Score = (o2Score / 12) * 10;
      return scaledO2Score;
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const durationMs = endDate - startDate + 10000;
    const hours = Math.floor(durationMs / 3600000);
    let timeString = String(hours);
    let Ihours = timeString.slice(0, 2);
    let o2Score;
    if (Ihours < 6) {
      o2Score = "Time<6h";
    } else {
      o2Score = (calculateO2Score(oxygenLevelColumn, Ihours) / 10).toFixed(1);
    }
    //const o2Score = (calculateO2Score(oxygenLevelColumn) /10).toFixed(1);
    //console.log("O2 Score:", o2Score);
    seto2Score(o2Score);

    // function calculateDateRange(dateColumn) {
    //   const dateStart = dateColumn[0];
    //   const dateEnd = dateColumn[dateColumn.length - 1];
    //   setDateStart(dateStart);
    //   setDateEnd(dateEnd);
    //   console.log("start", dateStart);
    //   console.log("end", dateEnd);
    // }
    // calculateDateRange(dateColumn);

    function secondsToHMS(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

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

      //const startDate = new Date('2000-01-01 ' + startTime24);
      //const endDate = new Date('2000-01-01 ' + endTime24);
      //console.log(duration);

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
        if (value > Drop4) {
          o2drop[">4"]++;
        } else if (value > Drop3) {
          o2drop[">3"]++;
        }
      });

      let timeString = String(hours);
      let Ihours = timeString.slice(0, 2);
      //console.log(Ihours);

      let Drop4ph = (o2drop[">4"] / Ihours).toFixed(2);
      //console.log(Drop4ph)
      let Drop3ph = (o2drop[">3"] / Ihours).toFixed(2);

      if (Ihours < 6) {
        Drop3ph = "Time<6h";
        Drop4ph = "Time<6h";
      }
      //console.log(Drop3ph)
      //console.log(Drop4ph)

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

    function prepareRRChart(pulseRateColumn)
    {
      var respiratoryRateColumn = [];
      for(let i = 0; i < pulseRateColumn.length; i++){
        respiratoryRateColumn.push(pulseRateColumn[i]/4);
      }
      return respiratoryRateColumn;
    }

    const respiratoryRateColumn = prepareRRChart(pulseRateColumn);

    function prepareChartData(
      timestampColumn,
      oxygenLevelColumn,
      pulseRateColumn,
      motionColumn,
      respiratoryRateColumn,
    ) {
      const valueCounts = {
        "95-100": 0,
        "90-94": 0,
        "85-89": 0,
        "80-84": 0,
        "75-79": 0,
        "70-74": 0,
      };
      const totalCount = oxygenLevelColumn.length;
      oxygenLevelColumn.forEach((value) => {
        if (value >= 70 && value <= 74) {
          valueCounts["70-74"]++;
        } else if (value >= 75 && value <= 79) {
          valueCounts["75-79"]++;
        } else if (value >= 80 && value <= 84) {
          valueCounts["80-84"]++;
        } else if (value >= 85 && value <= 89) {
          valueCounts["85-89"]++;
        } else if (value >= 90 && value <= 94) {
          valueCounts["90-94"]++;
        } else if (value >= 95 && value <= 100) {
          valueCounts["95-100"]++;
        }
      });
      const ranges = Object.keys(valueCounts);
      const counts = Object.values(valueCounts);
      const ratios = counts.map((count) => (count / totalCount) * 100);

      const OLRatioData = {
        labels: ranges,
        datasets: [
          {
            label: "Oxygen Level",
            data: ratios,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
          },
        ],
      };

      const OLchartData = {
        labels: timestampColumn,
        datasets: [
          {
            label: "Oxygen Level",
            data: oxygenLevelColumn,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
          },
        ],
      };

      const PRchartData = {
        labels: timestampColumn,
        datasets: [
          {
            label: "Pulse Rate",
            data: pulseRateColumn,
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.3)",
          },
        ],
      };
      
      const RRchartData = {
        labels: timestampColumn,
        datasets: [
          {
            label: "Respiratory Rate",
            data: respiratoryRateColumn,
            borderColor: "purple",
            backgroundColor: "rgba(255, 0, 255, 0.3)",
          },
        ],
      };
      const MotionChartData = {
        labels: timestampColumn,
        datasets: [
          {
            label: "Motion",
            data: motionColumn,
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.3)",
          },
        ],
      };

      setOLRatioData(OLRatioData);
      setOxygenLevelChartData(OLchartData);
      setPulseRateChartData(PRchartData);
      setMotionChartData(MotionChartData);
      setRespiratoryRateChartData(RRchartData);
    }
    prepareChartData(
      timestampColumn,
      oxygenLevelColumn,
      pulseRateColumn,
      motionColumn,
      respiratoryRateColumn
    );

    function calculateOxygenLevelThreshold(oxygenLevelColumn) {
      const o2t = {
        "≥95": 0,
        "90-94": 0,
        "≤90": 0,
      };
      const totalCount = oxygenLevelColumn.length;

      oxygenLevelColumn.forEach((o2tvalue) => {
        if (o2tvalue >= 95) {
          o2t["≥95"]++;
        } else if (o2tvalue >= 90 && o2tvalue <= 94) {
          o2t["90-94"]++;
        } else {
          o2t["≤90"]++;
        }
      });

      const o2tPercentage = {
        "≥95": ((o2t["≥95"] / totalCount) * 100).toFixed(2),
        "90-94": ((o2t["90-94"] / totalCount) * 100).toFixed(2),
        "≤90": ((o2t["≤90"] / totalCount) * 100).toFixed(2),
      };

      const gt95 = secondsToHMS(o2t["≥95"] * 4);
      const el9094 = secondsToHMS(o2t["90-94"] * 4);
      const lt90 = secondsToHMS(o2t["≤90"] * 4);

      //console.log("Variable '≥95' duration:", gt95);
      //console.log("Variable '90-94' duration:", el9094);
      //console.log("Variable '≤90' duration:", lt90);

      setGt95(gt95);
      setEl9094(el9094);
      setLt90(lt90);
      setO2t(o2t);
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
        if (prvalue >= 120) {
          pr["≥120"]++;
        } else if (prvalue >= 50 && prvalue <= 120) {
          pr["50-120"]++;
        } else if (prvalue <= 50) {
          pr["≤50"]++;
        }
      });

      const prPercentage = {
        "≥120": ((pr["≥120"] / totalCount) * 100).toFixed(2),
        "50-120": ((pr["50-120"] / totalCount) * 100).toFixed(2),
        "≤50": ((pr["≤50"] / totalCount) * 100).toFixed(2),
      };

      const gt120 = secondsToHMS(pr["≥120"] * 4);
      const bt50120 = secondsToHMS(pr["50-120"] * 4);
      const lt50 = secondsToHMS(pr["≤50"] * 4);

      setGt120(gt120);
      setBt50120(bt50120);
      setLt50(lt50);
      setPR(pr);
      setPRPercentage(prPercentage);
    }
    calculatePulseRateThreshold(pulseRateColumn);

    function calculateOxygenLevelDuration(oxygenLevelColumn) {
      const ol = {
        "95-100": 0,
        "90-94": 0,
        "80-89": 0,
        "70-79": 0,
        "≤70": 0,
      };
      const totalCount = oxygenLevelColumn.length;

      oxygenLevelColumn.forEach((value) => {
        if (value <= 70) {
          ol["≤70"]++;
        } else if (value >= 70 && value <= 79) {
          ol["70-79"]++;
        } else if (value >= 80 && value <= 89) {
          ol["80-89"]++;
        } else if (value >= 90 && value <= 94) {
          ol["90-94"]++;
        } else if (value >= 95 && value <= 100) {
          ol["95-100"]++;
        }
      });

      const olPercentage = {
        "95-100": ((ol["95-100"] / totalCount) * 100).toFixed(2),
        "90-94": ((ol["90-94"] / totalCount) * 100).toFixed(2),
        "80-89": ((ol["80-89"] / totalCount) * 100).toFixed(2),
        "70-79": ((ol["70-79"] / totalCount) * 100).toFixed(2),
        "≤70": ((ol["≤70"] / totalCount) * 100).toFixed(2),
      };

      const bt95100 = secondsToHMS(ol["95-100"] * 4);
      const bt9094 = secondsToHMS(ol["90-94"] * 4);
      const bt8089 = secondsToHMS(ol["80-89"] * 4);
      const bt7079 = secondsToHMS(ol["70-79"] * 4);
      const lt70 = secondsToHMS(ol["≤70"] * 4);

      setbt95100(bt95100);
      setbt9094(bt9094);
      setbt8089(bt8089);
      setbt7079(bt7079);
      setLt70(lt70);
      setOL(ol);
      setOLPercentage(olPercentage);
    }
    calculateOxygenLevelDuration(oxygenLevelColumn);
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
            // const dateIndex = headerRow.indexOf("Date");
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
            // const dateColumn = data.slice(1).map((row) => row[dateIndex]);

            // console.log(timestampColumn);
            // console.log(dateColumn);
            function handleNaN(value) {
              return Number.isNaN(value) ? "-" : value;
            }
            // console.log(typeof timestampColumn);
            manipulateData(
              pulseRateColumn,
              oxygenLevelColumn,
              motionColumn,
              timestampColumn
              // dateColumn
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
          <button className="import_button_text_o2" onClick={handleFileImport}>
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
        {/* {patientId != null && loadFromFirebase()} */}
        {errorMessage && <div className="error-message_o2">{errorMessage}</div>}
        {fileUploaded && (
          <div className="upload-status_o2">File uploaded successfully!</div>
        )}
        <div className="export_label_o2"> Export as: </div>
        <button
          className="export_button_text_o2"
          onClick={exportPDFWithComponent}
        >
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

      <div className="page">
        <PDFExport
          ref={pdfExportComponent}
          paperSize="auto"
          margin={40}
          fileName={`O2Report for`}
        >
          <div className="header">
            <h1>Oxygen Level Report</h1>
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

          <div className="info_border">
            <div className="name">Name: </div>
            {patientId == null && (
              <input
                type="text"
                className="name_input"
                placeholder="Enter Name"
              />
            )}
            {patientId != null && <p className="patientname">{patientName}</p>}
            <div className="age">Age: </div>
            {patientId == null && (
              <input
                type="number"
                className="age_input"
                min="1"
                max="100"
                placeholder="Enter Age"
                onInput={(event) => {
                  if (event.target.value > 100) {
                    event.target.value = 100;
                  } else if (event.target.value < 1) {
                    event.target.value = 1;
                  }
                }}
              />
            )}
            {patientId != null && <p className="patientage">{patientAge}</p>}
            {/* <input type="num" className="age_input" placeholder="Enter Age"/> */}
            <div className="gender">Gender: </div>
            {patientId == null && (
              <select className="gender_input">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            )}
            {patientId != null && (
              <p className="patientgender">{patientGender}</p>
            )}
          </div>

          <div className="std_border">
            <div className="start">
              Start Time: {startTime ? startTime : "-"}
            </div>
            {/* <div className="start">Start Time: {startTime ? startTime + "," + (firstDate ? firstDate : "-") : "-"}</div> */}
            <div className="end">End Time: {endTime ? endTime : "-"}</div>
            {/* <div className="end">End Time: {endTime ? endTime + "," + (lastDate ? lastDate : "-") : "-"}</div> */}
            <div className="duration">
              Duration: {duration ? duration : "-"}
            </div>
            {/*<div className="duration">Duration: {duration ? duration + "," + (mduration ? mduration: "-"): "-"}</div>*/}
          </div>

          <div className="note_border">
            <div className="note">
              <textarea
                type="text"
                className="note_input"
                placeholder="Note: "
                rows="5"
                maxlength="800"
              />
            </div>
          </div>

          <div className="drop4_border">
            <div className="drop4"> Drops &gt;4%: {o2drop[">4"]} </div>
            <div className="drop4_ph">Drops per hour: {Drop4ph}</div>
          </div>

          <div className="drop3_border">
            <div className="drop3"> Drops &gt;3%: {o2drop[">3"]}</div>
            <div className="drop3_ph">Drops per hour: {Drop3ph}</div>
          </div>

          <table className="olt_table">
            <tr>
              <th>Oxygen Level Threshold:</th>
              <th>Duration</th>
              <th>%Total</th>
            </tr>
            <tr>
              <td>&ge;95</td>
              <td>{gt95}</td>
              <td>{o2tPercentage["≥95"]}%</td>
            </tr>
            <tr>
              <td>90-94</td>
              <td>{el9094}</td>
              <td>{o2tPercentage["90-94"]}%</td>
            </tr>
            <tr>
              <td>&lt; 90</td>
              <td>{lt90}</td>
              <td>{o2tPercentage["≤90"]}%</td>
            </tr>
          </table>

          <table className="plt_table">
            <tr>
              <th>Pulse Rate Threshold: </th>
              <th>Duration</th>
              <th>%Total</th>
            </tr>
            <tr>
              <td> &ge;120</td>
              <td>{gt120}</td>
              <td>{prPercentage["≥120"]}%</td>
            </tr>
            <tr>
              <td>50-120</td>
              <td>{bt50120}</td>
              <td>{prPercentage["50-120"]}%</td>
            </tr>
            <tr>
              <td>&lt; 50</td>
              <td>{lt50}</td>
              <td>{prPercentage["≤50"]}%</td>
            </tr>
          </table>

          <div className="O2ratio_display">
            <div className="ratio_size">
              <BarChart chartData={OLRatioData} />
            </div>
          </div>

          <table className="hal_table">
            <tr>
              <th> </th>
              <th>Highest </th>
              <th>Average</th>
              <th>Lowest</th>
            </tr>
            <tr>
              <td> Oxygen Level</td>
              <td>{oxygenLevelData.highest}</td>
              <td>{oxygenLevelData.average}</td>
              <td>{oxygenLevelData.lowest}</td>
            </tr>
            <tr>
              <td>Pulse Rate</td>
              <td>{pulseRateData.highest}</td>
              <td>{pulseRateData.average}</td>
              <td>{pulseRateData.lowest}</td>
            </tr>
            <tr>
              <td>O2 Score</td>
              <td colSpan="2">
                <div className="colored-bar">
                  <div
                    className="arrow-indicator"
                    style={{ left: `${(o2Score / 10) * 100}%` }}
                  ></div>
                </div>
              </td>
              <td> {o2Score} </td>
            </tr>
            <tr>
              <td>HRV</td>
              <td></td>
              <td>{heartratevariabilityData.value}</td>
              <td></td>
            </tr>
            <tr>
              <td>RR</td>
              <td>{respiratoryRateData.highest}</td>
              <td>{respiratoryRateData.average}</td>
              <td>{respiratoryRateData.lowest}</td>
            </tr>
          </table>

          <table className="ODT_table">
            <tr>
              <th>Oxygen Level </th>
              <th>Duration</th>
              <th>%Total</th>
            </tr>
            <tr>
              <td>95-100</td>
              <td>{bt95100}</td>
              <td>{olPercentage["95-100"]}%</td>
            </tr>

            <tr>
              <td>90-94</td>
              <td>{bt9094}</td>
              <td>{olPercentage["90-94"]}%</td>
            </tr>
            <tr>
              <td>80-89</td>
              <td>{bt8089}</td>
              <td>{olPercentage["80-89"]}%</td>
            </tr>

            <tr>
              <td>70-79</td>
              <td>{bt7079}</td>
              <td>{olPercentage["70-79"]}%</td>
            </tr>

            <tr>
              <td>&lt;70</td>
              <td>{lt70}</td>
              <td>{olPercentage["≤70"]}%</td>
            </tr>
          </table>

          <div className="graphs_border">
            <div className="graph_size">
              <LineChart chartData={oxygenLevelChartData} />
              <LineChart chartData={pulseRateChartData} />
              <LineChart chartData={motionChartData} />
              <LineChart chartData={respiratoryRateChartData} />
            </div>
          </div>
        </PDFExport>
      </div>
    </div>
  );
};
export default O2Report;
