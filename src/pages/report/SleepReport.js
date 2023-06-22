import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import Papa from "papaparse";
import "./SleepReport.css";

const SleepReport = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pulseRateData, setPulseRateData] = useState({});
  const [oxygenLevelData, setOxygenLevelData] = useState({});

  const [apneaDuration, setApneaDuration] = useState(null);
  const [apneaDurationMax, setApneaMax] = useState(null);
  const [apneaDurationMin, setApneaMin] = useState(null);
  const [apneaDurationMean, setApneaMean] = useState(null);


  const [dateData, setDateData] = useState({});
  const [motionData, setMotionData] = useState({});
  const [timestampData, setTimestampData] = useState([]);

  const [pulseRateChartData, setPulseRateChartData] = useState({});
  const [oxygenLevelChartData, setOxygenLevelChartData] = useState({});
  const [motionChartData, setMotionChartData] = useState({}); 
  const [OLRatioData, setOLRatioData] = useState({});

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

  const [o2Score, seto2Score] = useState("");

  const [drop3Input, setDrop3Input] = useState("");
  const [drop3phInput, setDrop3phInput] = useState("");  
  const [drop4Input, setDrop4Input] = useState("");
  const [drop4phInput, setDrop4phInput] = useState("");  

  const [firstDate, setDateStart] = useState("");
  const [lastDate, setDateEnd] = useState("");

  const [mstartTime, setMStartTime] = useState("");
  const [mendTime, setMEndTime] = useState("");
  const [mduration, setMDuration] = useState("");
  const [gt95,setGt95]  = useState("");
  const [el9094,setEl9094]  = useState("");
  const [lt90,setLt90] = useState("");
  const [gt120,setGt120]  = useState("");
  const [bt50120,setBt50120]  = useState("");
  const [lt50,setLt50] = useState("");
  const [bt96100,setBt96100]  = useState("");  
  const [bt9195,setBt9195]  = useState("");  
  const [bt8690,setBt8690]  = useState("");
  const [bt8185,setBt8185]  = useState("");
  const [bt7680,setBt7680]  = useState("");
  const [bt7075,setBt7075]  = useState("");
  const [lt70,setLt70]  = useState("");



  const [o2drop,setO2drop] = useState("");


  const [showPdf, setShowPdf] = useState(false);


  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

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
              .slice(1)
              .map((row) => handleNaN(Number(row[pulseRateIndex])));
            const oxygenLevelColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[oxygenLevelIndex])));
            const motionColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[motionIndex])));
            const timestampColumn = data
              .slice(1)
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
              // Convert start time and end time to Date objects
              const mstartDate = new Date("2000-01-01 " + startTime24);
              const mendDate = new Date("2000-01-01 " + endTime24);

              // Calculate the difference in milliseconds
              const mdurationMs = mendDate - mstartDate;
              // Calculate the duration in hours, minutes, and seconds
              const mhours = Math.floor(mdurationMs / 3600000);
              const mminutes = Math.floor((mdurationMs % 3600000) / 60000);
              const mseconds = Math.floor((mdurationMs % 60000) / 1000);
              // Format the duration in HH:mm:ss format
              const mduration = `${mhours.toString().padStart(2, "0")}:${mminutes
                .toString()
                .padStart(2, "0")}:${mseconds.toString().padStart(2, "0")}`;


              const startTime = timestampColumn[0];
              const endTime = timestampColumn[timestampColumn.length -2];
              //console.log (startTime);
              //console.log(endTime);
              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
              // Convert start time and end time to Date objects
              //const startDate = new Date('2000-01-01 ' + startTime24);
              //const endDate = new Date('2000-01-01 ' + endTime24);
              // Calculate the difference in milliseconds
              const durationMs = endDate - startDate  + 10000;
              // Calculate the duration in hours, minutes, and seconds
              const hours = Math.floor(durationMs / 3600000);
              const minutes = Math.floor((durationMs % 3600000) / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              // Format the duration in HH:mm:ss format
              const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              console.log(duration);

              //const Drop4 = ((Math.max(...oxygenLevelColumn)/100)*96)
              //console.log(Drop4);
              const Drop4 = (Math.max(...oxygenLevelColumn)-4)

              //const Drop3 = ((Math.max(...oxygenLevelColumn)/100)*97)
              //console.log(Drop3);
              const Drop = (Math.max(...oxygenLevelColumn)-4)

              const Drop4ph = Drop4/hours
              //console.log(Drop4ph)
              const Drop3ph = Drop3/hours

              const o2drop = {
                ">3": 0 ,
                ">4":0
              }
              oxygenLevelColumn.forEach(value => {
                if (value > Drop4) {
                  o2drop[">4"]++;
                } else if (value >Drop3) { 
                  o2drop[">3"]++;
                }
              });

              console.log(Drop3ph)
              console.log(Drop4ph)

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
          
              const o2tPercentage = {
                "<90": (o2t["<90"] / totalCount* 100).toFixed(2),
                "<88": (o2t["<88"] / totalCount* 100).toFixed(2) ,
                "<80": (o2t["<80"] / totalCount* 100).toFixed(2)
              };
              setO2t(o2t);
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
              let apneaDurationMin = Infinity;
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
  
              const apneaDurationMean = apneaDurationSum / apneaDurationCount;
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
    <div className="SRpage">
    <div className="SRheader">
      <h1>Sleep Quality Report</h1>
      <button className="import_button_text" onClick={handleFileImport}>
        Click to Import CSV File
      </button>
      {fileUploaded && (
        <div className="upload-status">File uploaded successfully!</div>
      )}
    </div>
    

    <div className="SQ_section">
      <div className="SQ_label">Sleep Quality</div>
      <div className="SQ_SQI">SQI : <br/>Expected &gt; 55 </div>
      <div className="SQ_EFF">Efficiency : <br/> Expected &gt; 85%</div>
    </div>

    <div className="SO_section">
      <div className="SO_label">Sleep Opportunity</div>
      <div className="SO_Latency">Latency<br/> Expected &lt; 30 min</div>
      <div className="SO_Duration">Duration  {duration ? duration: "-"}<br/> Expected 7-9 hours </div>
    </div>

    <div className="=SA _section">
      <div className="SA_label">Sleep Apnea</div>
      <div className="SA_SAI">SAI<br/> Expected &lt; 5 </div>
      <div className="SA_sAHI">sAHI</div>
    </div>

    <div className="SP_section">
      <div className="SP_label">Sleep Pathology</div>
      <div className="SP_fragmentation">FRAGEMENTATION <br/>Expected &lt; 15%</div>
      <div className="SP_periodicity">PERIODICITY</div>
    </div>
    
  

  
    <div className="SLPO_title">Sleep onset </div>
    <div className="SLPO_input"></div>

    <div className="SLPC_title">Sleep Conclusion </div>
    <div className="SLPC_input"></div>

    <div className="TST_title">TST</div>
    <div className="TST_input"></div>

    <div className="WASO_title">WASO </div>
    <div className="WASO_input"></div>

    <div className="WT_title">Wake Transistion</div>
    <div className="WT_input"></div>   

    <div className="SAI_title">SAI </div>
    <div className="SAI_input"></div>

    <div className="Snore_title">Snore </div>
    <div className="Snore_input">N/A</div>

    <div className="BP_title">Body Position </div>
    <div className="BP_input">N/A</div>








    <div className="SPH_title">Sp02 &lt;90%</div>
    <div className="SPH_input">{(o2t['<90'] * 2).toFixed(0)}-{o2tPercentage['<90']}%</div>

    <div className="SPM_title">Sp02 &lt;88%</div>
    <div className="SPM_input">{(o2t['<88'] * 2).toFixed(0)}-{o2tPercentage['<88']}%</div>

    <div className="SPL_title">Sp02 &lt;80%</div>
    <div className="SPL_input">{(o2t['<80'] * 2).toFixed(0)}-{o2tPercentage['<80']}%</div>

    <div className="MMM_title">MIN-MAX-MEAN SPo2</div>
    <div className="MMM_input">{oxygenLevelData.lowest}%-{oxygenLevelData.highest}%-{oxygenLevelData.average}%</div>


    <div className="D_label">Desaturation</div>
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
    <div className="ODI_input">{(Drop3ph) ? "NaN" : Drop3ph} </div>
    <div className="ODI_input1">{(Drop4ph) ? "NaN" : Drop4ph}</div>

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
    




    <div className = "Feedback"></div>
    </div>
  </div>

);
};




export default SleepReport;
