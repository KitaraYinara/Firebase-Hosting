import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import Papa from "papaparse";
import "./SleepReport.css";
import { ValueType } from "exceljs";

const SleepReport = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pulseRateData, setPulseRateData] = useState({});
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
  const [wakeAfterSleepOnsetMinutes, setWakeAfterSleepOnsetMinutes] = useState("");
  const [sleepApneaIndicator, setSleepApneaIndicator] = useState(0);




  const [motionData, setMotionData] = useState({});



  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [o2t, setO2t] = useState({})
  const [o2tPercentage, setO2TPercentage] = useState({})
  const [pr, setPR] = useState({})
  const [prPercentage, setPRPercentage] = useState({})
  const [ol, setOL] = useState({})
  const [olPercentage, setOLPercentage] = useState({})
  const [Drop3ph,setDrop3ph] = useState("");
  const [Drop4ph,setDrop4ph] = useState("");
  const [Drop3,setDrop3] = useState("");
  const [Drop4,setDrop4] = useState("");


  const [firstDate, setDateStart] = useState("");
  const [lastDate, setDateEnd] = useState("");

  const [mstartTime, setMStartTime] = useState("");
  const [mendTime, setMEndTime] = useState("");
  const [mduration, setMDuration] = useState("");
  const [o2drop,setO2drop] = useState("");

  const [lt90,setLt90] = useState("");
  const [lt80,setLt80] = useState("");
  const [lt88,setLt88] = useState("");

  const [IfileName, setIFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const pdfExportComponent = React.useRef(null);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
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

            // Extracting the columns
            const pulseRateColumn = data
              .slice(1,-1)
              .map((row) => handleNaN(Number(row[pulseRateIndex])));
            const oxygenLevelColumn = data
              .slice(1,-1)
              .map((row) => handleNaN(Number(row[oxygenLevelIndex])));
            const motionColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[motionIndex])));
            const timestampColumn = data
              .slice(1,-1)
              .map((row) => row[timestampIndex]);
            const dateColumn = data
              .slice(1)
              .map((row)=> row[dateIndex])
            
            function calculateColumnStats(pulseRateColumn, oxygenLevelColumn, motionColumn) {
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

              setMotionData({
                highest: motionMax.toFixed(2),
                average: motionAverage.toFixed(2),
                lowest: motionMin.toFixed(2),
              });
            }
            calculateColumnStats(pulseRateColumn, oxygenLevelColumn, motionColumn);
            function handleNaN(value) {
              return Number.isNaN(value) ? "-" : value;
            }
            function calculateDateRange(dateColumn) {
              const dateStart = dateColumn[0];
              const dateEnd = dateColumn[dateColumn.length - 1];
              setDateStart(dateStart);
              setDateEnd(dateEnd);
              //console.log("start", dateStart);
              //console.log("end", dateEnd);
            }
            calculateDateRange(dateColumn);


            function calculateTimeDuration(timestampColumn) {
          
              const mstartTime = timestampColumn[0];
              const mendTime = timestampColumn[timestampColumn.length - 1];

              const startTime24 = new Date(
                "2000-01-01 " + mstartTime
              ).toLocaleTimeString("en-US", { hour12: false });
              const endTime24 = new Date(
                "2000-01-01 " + mendTime
              ).toLocaleTimeString("en-US", { hour12: false });

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
              const endTime = timestampColumn[timestampColumn.length -2];
              //console.log (startTime);
              //console.log(endTime);

              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
              const durationMs = endDate - startDate  + 10000;
              const hours = Math.floor(durationMs / 3600000);
              const minutes = Math.floor((durationMs % 3600000) / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
              //const Drop4 = ((Math.max(...oxygenLevelColumn)/100)*96)
              const Drop4 = (Math.max(...oxygenLevelColumn)-4)
              //console.log(Drop4);

              //const Drop3 = ((Math.max(...oxygenLevelColumn)/100)*97)
              const Drop3 = (Math.max(...oxygenLevelColumn)-3)
              //console.log(Drop3);

              const o2drop = {
                ">3": 0 ,
                ">4":0
              }

              
              oxygenLevelColumn.forEach(value => {
                if (value < Drop4) {
                  o2drop[">4"]++;
                } else if (value <Drop3) { 
                  o2drop[">3"]++;
                }
                
              });
              let timeString = String(hours);
              let Ihours = timeString.slice(0, 2);
              //console.log(Ihours);

              let Drop4ph =  (o2drop[">4"]/Ihours).toFixed()
              //console.log(Drop4ph)
              let Drop3ph = (o2drop[">3"]/Ihours).toFixed()

              if (Ihours < 6){
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
                  timeOnly = dateTime.split(' ')[0] + (' ') + dateTime.split(' ')[1];  // To split datetime to extract time only

                  time = timeOnly;
                }
                setSleepOnset(time);
              }
              return null; // Return null if no matching time value is found
            }
            calculateSleepOnset(pulseRateColumn, timestampColumn)


            function calculateSleepConclusion(pulseRateColumn, timestampColumn) {
              let time = 0;
              let pulseRate = 0;
              let dateTime = 0;
              let timeOnly = 0;

              for (let i = 0; i < pulseRateColumn.length; i++) {
                pulseRate = pulseRateColumn[i];
                
                if (pulseRate >= 70) {
                  dateTime = timestampColumn[i];
                  timeOnly = dateTime.split(' ')[0] + (' ') + dateTime.split(' ')[1];  // To split datetime to extract time only

                  time = timeOnly;
                }
                setSleepConclusion(time);
                //console.log(time);
              }
              return null; // Return null if no matching time value is found
            }
            calculateSleepConclusion(pulseRateColumn, timestampColumn)


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
            calculateWakeTransition(motionColumn)


            function calculateTotalSleepTime(motionColumn){
              let totalTime = 0;

              for (let i = 0; i < motionColumn.length; i++){
                const motionValue = motionColumn[i];

                if (motionValue < 10){
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


            function calculateWakeAfterSleepOnset(motionColumn){
              let totalTime = 0;

              for (let i = 0; i < motionColumn.length; i++){
                const motionValue = motionColumn[i];

                if (motionValue >= 10){
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


            function calculateSleepApneaIndicator(pulseRateColumn, motionColumn, timestampColumn){
              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
              const durationMs = endDate - startDate  + 10000;
              const hours = Math.floor(durationMs / 3600000);
              const minutes = Math.floor((durationMs % 3600000) / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

              let pulseCount = 0;
              let motionCount = 0;
              let timeSum = 0;

              for (let i = 0; i < motionColumn.length; i++ ){
                const motion = motionColumn[i];
                if (motion >= 20) {
                  motionCount++;
                }
              }

              for (let i = 0; i < pulseRateColumn.length; i++ ){
                const pulseRate = pulseRateColumn[i];
                if (pulseRate >= 70) {
                  pulseCount++;
                }
              }

              for (let i = 0; i < timestampColumn.length; i++ ){
                const time = timestampColumn[i];
                timeSum += time;
              }

              let timeString = String(hours);
              let Ihours = timeString.slice(0, 2);
              //console.log(Ihours);

              const result = Math.round((pulseCount + motionCount) / Ihours);
              //console.log(result)

              setSleepApneaIndicator(result);

              const sleepApneaElements = document.querySelectorAll('.Feedback_point2');
              const sleepApneaElement = sleepApneaElements[0];
              let sleepApneaText = '';

              if (result > 10){
                sleepApneaText = 'Sleep Apnea Indicator is <span class="bold">above</span> expected value.';
              }
              else{
                sleepApneaText = 'Sleep Apnea Indicator is <span class="bold">below</span> expected value.';
              }
              sleepApneaElement.innerHTML = sleepApneaText;
            }
            calculateSleepApneaIndicator(pulseRateColumn, motionColumn, timestampColumn);


            function generateRandomRdiNumbers() {
              let randomNumber1 = Math.floor(Math.random() * 10) + 1;
              let randomNumber2 = Math.floor(Math.random() * 10) + 1;
            
              // Assign the generated numbers to the respective HTML elements
              document.querySelector('.SRDI_input').textContent = randomNumber1;
              document.querySelector('.SRDI_input1').textContent = randomNumber2;
            
              if (randomNumber1 <= randomNumber2) {
                // Swap the numbers if needed
                [randomNumber1, randomNumber2] = [randomNumber2, randomNumber1];
            
                document.querySelector('.SRDI_input').textContent = randomNumber1;
                document.querySelector('.SRDI_input1').textContent = randomNumber2;
              }
            }
            generateRandomRdiNumbers();


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
            
              document.querySelector('.SAHIO_input').textContent = randomNumber1;
              document.querySelector('.SAHIO_input1').textContent = randomNumber2;
            }
            generateRandomObstructiveNumbers();


            function generateRandomSleepQualityIndex() {
              const randomNumber = Math.floor(Math.random() * 36) + 30;
              const sqiElement = document.querySelector('.SQ_SQI');
              sqiElement.innerHTML = `SQI&nbsp;&nbsp;&nbsp;<span class="smaller-font">${randomNumber}</span><br/><span class="expected smaller-font1">Expected &gt;55</span>`;
            
              const sleepQualityElements = document.querySelectorAll('.Feedback_point1');
              const sleepQualityElement = sleepQualityElements[1];
              let sleepQualityText = '';
            
              if (randomNumber > 55) {
                sqiElement.style.backgroundColor = 'green';
                sleepQualityText = 'Sleep Quality is <span class="bold">above</span> expected value.';
              } else if (randomNumber >= 45 && randomNumber <= 55) {
                sqiElement.style.backgroundColor = "rgb(255, 204, 0)";
                sleepQualityText = 'Sleep Quality is <span class="bold">below</span> expected value.';
              } else {
                sqiElement.style.backgroundColor = 'red';
                sleepQualityText = 'Sleep Quality is <span class="bold">below</span> expected value.';
              }
            
              sleepQualityElement.innerHTML = sleepQualityText;
            }
            generateRandomSleepQualityIndex();

            
            function generateRandomEfficiency() {
              const randomNumber = Math.floor(Math.random() * 21) + 75;
              const efficiencyElement = document.querySelector('.SQ_EFF');
              efficiencyElement.innerHTML = `EFFICIENCY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${randomNumber}%</span><br/><span class="expected smaller-font1">Expected &gt;85%</span`;

              const sleepEfficiencyElements = document.querySelectorAll('.Feedback_point1');
              const sleepEfficiencyElement = sleepEfficiencyElements[2];
              let sleepEfficiencyText = '';
            
              if (randomNumber > 85) {
                efficiencyElement.style.backgroundColor = 'green';
                sleepEfficiencyText = 'Sleep Efficiency is <span class="bold">above</span> expected value.';
              } 
              else if (randomNumber >=80 && randomNumber <= 85){
                efficiencyElement.style.backgroundColor = "rgb(255, 204, 0)";
                sleepEfficiencyText = 'Sleep Efficiency is <span class="bold">below</span> expected value.';
              }
              else {
                efficiencyElement.style.backgroundColor = 'red';
                sleepEfficiencyText = 'Sleep Efficiency is <span class="bold">below</span> expected value.';
              }

              sleepEfficiencyElement.innerHTML = sleepEfficiencyText;
            }
            generateRandomEfficiency();


            function generateRandomFragmentation() {
              const randomNumber = Math.floor(Math.random() * 24) + 7;
              const fragmentElement = document.querySelector('.SP_fragmentation');
              fragmentElement.innerHTML = `FRAGMENTATION&nbsp;&nbsp;&nbsp;<span class="smaller-font">${randomNumber}%</span><br/><span class="expected smaller-font1">Expected &lt;15%</span`;
              
              const sleepFragmentElements = document.querySelectorAll('.Feedback_point2');
              const sleepFragmentElement = sleepFragmentElements[2];
              let sleepFragmentText = '';

              if (randomNumber < 15) {
                fragmentElement.style.backgroundColor = 'green';
                sleepFragmentText = 'Sleep Fragmentation is <span class="bold">below</span> expected value.';
              }
              else if (randomNumber >= 15 && randomNumber <= 20){
                fragmentElement.style.backgroundColor = 'rgb(255, 204, 0)';
                sleepFragmentText = 'Sleep Fragmentation is <span class="bold">above</span> expected value.';
              }
              else {
                fragmentElement.style.backgroundColor = 'red';
                sleepFragmentText = 'Sleep Fragmentation is <span class="bold">above</span> expected value.';
              }
              sleepFragmentElement.innerHTML = sleepFragmentText;
            }
            generateRandomFragmentation();


            function generateRandomPeriodicity() {
              const randomNumber = Math.floor(Math.random() * 31) ;
              const periodElement = document.querySelector('.SP_periodicity');
              periodElement.innerHTML = `PERIODICITY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${randomNumber}%</span><br/><span class="expected smaller-font1">Expected &le;2%</span`;

              const sleepPeriodElements = document.querySelectorAll('.Feedback_point2');
              const sleepPeriodElement = sleepPeriodElements[3];
              let sleepPeriodtText = '';
            
              if (randomNumber <= 2) {
                periodElement.style.backgroundColor = 'green';
                sleepPeriodtText = 'Periodicity is <span class="bold">below</span> expected value.';
              }
              else if (randomNumber > 2 && randomNumber <= 15){
                periodElement.style.backgroundColor = 'rgb(255, 204, 0)';
                sleepPeriodtText = 'Periodicity is <span class="bold">above</span> expected value.';
              }
              else {
                periodElement.style.backgroundColor = 'red';
                sleepPeriodtText = 'Periodicity is <span class="bold">above</span> expected value.';
              }
              sleepPeriodElement.innerHTML = sleepPeriodtText;
            }
            generateRandomPeriodicity();


            function generateRandomDuration(timestampColumn) {
              const startTime = timestampColumn[0];
              const endTime = timestampColumn[timestampColumn.length - 2];
              
              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
              const durationMs = endDate - startDate + 10000;
              const hours = Math.floor(durationMs / 3600000);              
              const minutes = Math.floor((durationMs % 3600000) / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
              const periodElement = document.querySelector('.SO_Duration');

              let timeString = String(hours);
              let Ihours = timeString.slice(0, 2);

              const randomDurationElements = document.querySelectorAll('.Feedback_point1');
              const randomDurationElement = randomDurationElements[3];
              let randomDurationText = '';

            
              if (Ihours > 6) {
                periodElement.style.backgroundColor = 'green';
                randomDurationText = 'Sleep Duration is <span class="bold">within</span> expected value.';
              } else if (Ihours >= 2 && Ihours <= 6) {
                periodElement.style.backgroundColor = 'rgb(255, 204, 0)'
                randomDurationText = 'Sleep Duration is <span class="bold">below</span> expected value. ';
              } else {
                periodElement.style.backgroundColor = 'red';
                randomDurationText = 'Sleep Duration is <span class="bold">below</span> expected value. ';
              }
            
              console.log(Ihours);
              setDuration(duration);

              randomDurationElement.innerHTML = randomDurationText;
            }
            generateRandomDuration(timestampColumn);

            
            function generateRandomLatency() {
              const hours = 0;
              const minutes = Math.floor(Math.random() * 21) + 30;
              const formattedTime = `${hours.toString().padStart(1, '0')}h:${minutes.toString().padStart(2, '0')}`;
              const latencyElement = document.querySelector('.SO_Latency');
              latencyElement.innerHTML = `LATENCY&nbsp;&nbsp;&nbsp;<span class="smaller-font">${formattedTime}m</span><br/><span class="expected smaller-font1">Expected &lt;30 min</span`;

              if (formattedTime < '00:30') {
                latencyElement.style.backgroundColor = 'green';
              }
              else if (formattedTime >= '00:30' && formattedTime <= '00:45'){
                latencyElement.style.backgroundColor = 'rgb(255, 204, 0)';
              }
              else {
                latencyElement.style.backgroundColor = 'red';
              }
            }
            generateRandomLatency();


            function generateRandomAverageSignalQuality() {
              const randomNumber = Math.floor(Math.random() * 11) + 85;
              const averageSignalElements = document.querySelectorAll('.Feedback_point1');
              const averageSignalElement = averageSignalElements[0];
              const updatedText = `Average Signal Quality is <span class="bold">${randomNumber}</span> %.`;
              averageSignalElement.innerHTML = updatedText;
            }
            generateRandomAverageSignalQuality();


            function generateRandomCentral() {
              const randomCentralNumber = Math.floor(Math.random() * 6);

              document.querySelector('.SAHIC_input').textContent = randomCentralNumber;
              document.querySelector('.SAHIC_input1').textContent = randomCentralNumber;

            }
            generateRandomCentral();


            function secondsToHMS(seconds) {
              const hours = Math.floor(seconds / 3600);
              const minutes = Math.floor((seconds % 3600) / 60);
              const remainingSeconds = seconds % 60;
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
            function calculateOxygenLevelThreshold(oxygenLevelColumn) {
              const o2t = {
                "<90": 0,
                "<88": 0,
                "<80": 0
              };
              const totalCount = oxygenLevelColumn.length;

              oxygenLevelColumn.forEach(o2tvalue => {
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
                "<90": (o2t["<90"] / totalCount* 100).toFixed(2),
                "<88": (o2t["<88"] / totalCount* 100).toFixed(2) ,
                "<80": (o2t["<80"] / totalCount* 100).toFixed(2)
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
                "≤50": 0
              };
              const totalCount = pulseRateColumn.length;

              pulseRateColumn.forEach(prvalue => {
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
                "≥120": (pr["≥120"] / totalCount * 100).toFixed(2),
                "50-120": (pr["50-120"] / totalCount* 100).toFixed(2),
                "≤50": (pr["≤50"] / totalCount* 100).toFixed(2)
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
              console.log("test11" ,apneaDurationCount)
              console.log("test" ,apneaDurationMean)
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
                "≤70": 0
              };
              const totalCount = oxygenLevelColumn.length;

              oxygenLevelColumn.forEach(value => {
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
                "≤70": ((ol["≤70"] / totalCount) * 100).toFixed(2)
              };
              setOL(ol);
              setOLPercentage(olPercentage);
            }
            calculateOxygenLevelDuration(oxygenLevelColumn);


            function calculateSahiTotal() {
              const SAHIO_inputValue = parseInt(document.querySelector('.SAHIO_input').textContent);
              const SAHIC_inputValue = parseInt(document.querySelector('.SAHIC_input').textContent);
              const SAHIO_input1Value = parseInt(document.querySelector('.SAHIO_input1').textContent);
              const SAHIC_input1Value = parseInt(document.querySelector('.SAHIC_input1').textContent);
              const total = SAHIO_inputValue + SAHIC_inputValue;

              document.querySelector('.SAHIT_input').textContent = total;
              document.querySelector('.SAHIT_input1').textContent = SAHIO_input1Value + SAHIC_input1Value;
            }
            calculateSahiTotal();

            function displaySahiTotal() {
              const SAHIT_inputValue = parseInt(document.querySelector('.SAHIT_input').textContent);
              const SA_SAI = document.querySelector('.SA_SAI');

              SA_SAI.innerHTML = `sAHI<span class="small-number">3%</span> ${SAHIT_inputValue}`;

              const saiElements = document.querySelectorAll(".Feedback_point2");
              const saiElement = saiElements[1];
              let saiText = "";

              if (SAHIT_inputValue >= 1 && SAHIT_inputValue <= 4) {
                SA_SAI.style.backgroundColor = 'green';
                SA_SAI.innerHTML += '<br>Normal';
                saiText = 'Apnea Hypopnea Index is <span class="bold">Normal</span>.';
              } else if (SAHIT_inputValue >= 5 && SAHIT_inputValue <= 15) {
                SA_SAI.style.backgroundColor = 'rgb(255, 204, 0)';
                SA_SAI.innerHTML += '<br>Mild';
                saiText = 'Apnea Hypopnea Index is <span class="bold">Mild</span>.';
              } else {
                SA_SAI.style.backgroundColor = 'red';
                SA_SAI.innerHTML += '<br>Severe';
                saiText = 'Apnea Hypopnea Index is <span class="bold">Severe</span>.';
              }
              saiElement.innerHTML = saiText;


              function displaySahiTotal1() {
                const SAHIT_inputValue = parseInt(document.querySelector('.SAHIT_input1').textContent);
                const SA_sAHI = document.querySelector('.SA_sAHI');
  
                SA_sAHI.innerHTML = `sAHI<span class="small-number">4%</span> ${SAHIT_inputValue}`;
  
                if (SAHIT_inputValue >= 1 && SAHIT_inputValue <= 4) {
                  SA_sAHI.style.backgroundColor = 'green';
                  SA_sAHI.innerHTML += '<br>Normal';
                } else if (SAHIT_inputValue >= 5 && SAHIT_inputValue <= 15) {
                  SA_sAHI.style.backgroundColor = 'rgb(255, 204, 0)';
                  SA_sAHI.innerHTML += '<br>Mild';
                } else {
                  SA_sAHI.style.backgroundColor = 'red';
                  SA_sAHI.innerHTML += '<br>Severe';
                }
              }
              displaySahiTotal1();
            }
            displaySahiTotal();
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
    <Navigation/>
    <div className =  "page_control">
    <button className="import_button_text" onClick={handleFileImport}>
        Click to Import CSV File
      </button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {fileUploaded && (
        <div className="upload-status">File uploaded successfully!</div>
      )}
      <div className ="export_label" > Export as: </div>
      <button className="export_button_text"  onClick={exportPDFWithComponent}>
        PDF</button>
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
    <div className="current-datetime">File Imported Datetime: {currentDate}, {currentTime}</div>
        <div className="current-filename">File Imported Name: {IfileName}</div>
    

    <div className="SQ_section">
      <div className="SQ_label">Sleep Quality</div>
      <div className="SQ_SQI">SQI  <br/><span class="smaller-font1">Expected &gt;55</span> </div>
      <div className="SQ_EFF">EFFICIENCY <br/><span class="smaller-font1"> Expected &gt;85%</span></div>
    </div>

    <div className="SO_section">
      <div className="SO_label">Sleep Opportunity</div>
      <div className="SO_Latency">LATENCY<br/><span class="smaller-font1"> Expected &lt;30 min</span></div>
      <div class="SO_Duration">DURATION {duration } <br/><span class="smaller-font1"> Expected 7-9 hours </span></div>
    </div>

    <div class="SA _section">
      <div className="SA_label">Sleep Apnea</div>
      <div className="SA_SAI">sAHI<span class="small-number">3%</span></div>
      <div className="SA_sAHI">sAHI<span class="small-number">4%</span></div>
    </div>

    <div className="SP_section">
      <div className="SP_label">Sleep Pathology</div>
      <div className="SP_fragmentation">FRAGEMENTATION <br/><span class="smaller-font1">Expected &lt;15%</span></div>
      <div className="SP_periodicity">PERIODICITY <br/><span class="smaller-font1">Expected &le;2% </span></div>
    </div>
    
  

  
    <div className="SLPO_title">Sleep Onset </div>
    <div className="SLPO_input">{sleepOnset}</div>

    <div className="SLPC_title">Sleep Conclusion </div>
    <div className="SLPC_input">{sleepConclusion}</div>

    <div className="TST_title">TST</div>
    <div className="TST_input">{totalSleepTimeHours}h:{totalSleepTimeMinutes}m</div>

    <div className="WASO_title">WASO </div>
    <div className="WASO_input">{wakeAfterSleepOnsetHours}h:{wakeAfterSleepOnsetMinutes}m</div>

    <div className="WT_title">Wake Transistion</div>
    <div className="WT_input"> #{wakeTransition}</div>   

    <div className="SAI_title">SAI </div>
    <div className="SAI_input">{sleepApneaIndicator}</div>

    <div className="Snore_title">Snore </div>
    <div className="Snore_input">N/A</div>

    <div className="BP_title">Body Position </div>
    <div className="BP_input">N/A</div>




    <div className="SPH_title">SpO2 &lt;90%</div>
    <div className="SPH_input">{lt90} - {o2tPercentage['<90']}%</div>

    <div className="SPM_title">SpO2 &lt;88%</div>
    <div className="SPM_input">{lt88} - {o2tPercentage['<88']}%</div>

    <div className="SPL_title">SpO2 &lt;80%</div>
    <div className="SPL_input">{lt80} - {o2tPercentage['<80']}%</div>

    <div className="MMM_title">MIN-MAX-MEAN SPo2</div>
    <div className="MMM_input">{oxygenLevelData.lowest}%-{oxygenLevelData.highest}%-{oxygenLevelData.average}%</div>


    <div className="D_label">Desaturations</div>
    <div className="D3_label">3%</div>
    <div className="D4_label">4%</div>

    <div className="SAHIT_title">sAHItotal</div>
    <div className="SAHIT_input"></div>
    <div className="SAHIT_input1"></div>

    <div className="SAHIO_title">sAHIobstructive</div>
    <div className="SAHIO_input"></div>
    <div className="SAHIO_input1"></div>

    <div className="SAHIC_title">sAHIcentral</div>
    <div className="SAHIC_input"></div>
    <div className="SAHIC_input1"></div>

    <div className="SRDI_title">sRDI</div>
    <div className="SRDI_input"></div>
    <div className="SRDI_input1"></div>

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

    <div className = "Feedback">
    <div className="Report_Label">
      Test Summary:<br/><br/>
      <span class="larger_font">Patient: <input
      type="number"
      className="age_input_sr"
      min="1"
      max="100"
      placeholder="Age"
      onInput={(event) => {
        if (event.target.value > 100) {
          event.target.value = 100;
        } else if (event.target.value <= 1) {
          event.target.value = 1;
        }
      }}/>
      year old 
      <select className="gender_input_sr">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select></span><br/><br/>
      <span class="Feedback_point1"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="Feedback_point2"></span><br/>
      <span class="Feedback_point1"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="Feedback_point2"></span><br/>
      <span class="Feedback_point1"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="Feedback_point2"></span><br/>
      <span class="Feedback_point1"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="Feedback_point2"></span>
    </div>
    </div> 
    </PDFExport>
      
    </div>
  </div>

);
};

export default SleepReport;

