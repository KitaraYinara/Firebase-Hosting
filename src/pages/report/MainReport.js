import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import LineChart from "../../components/DisplayChart/LineChart";
import BarChart from "../../components/DisplayChart/BarChart";
import Papa from "papaparse";
import "./MainReport.css";

const O2Report = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pulseRateData, setPulseRateData] = useState({});
  const [oxygenLevelData, setOxygenLevelData] = useState({});
  const [dateData, setDateData] = useState({});
  const [motionData, setMotionData] = useState({});
  const [timestampData, setTimestampData] = useState([]);

  const [pulseRateChartData, setPulseRateChartData] = useState({});
  const [oxygenLevelChartData, setOxygenLevelChartData] = useState({});
  const [motionChartData, setMotionChartData] = useState({});
  const [OLRatioData, setOLRatioData] = useState({});

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [o2t, setO2t] = useState({});
  const [o2tPercentage, setO2TPercentage] = useState({});
  const [pr, setPR] = useState({});
  const [prPercentage, setPRPercentage] = useState({});
  const [ol, setOL] = useState({});
  const [olPercentage, setOLPercentage] = useState({});

  const [o2Score, seto2Score] = useState("");

  const [drop3Input, setDrop3Input] = useState("");
  const [drop3phInput, setDrop3phInput] = useState("");
  const [drop4Input, setDrop4Input] = useState("");
  const [drop4phInput, setDrop4phInput] = useState("");

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
            const dateColumn = data.slice(1).map((row) => row[dateIndex]);

            function handleNaN(value) {
              return isNaN(value) ? 0 : value;
            }

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

              setMotionData({
                highest: motionMax.toFixed(2),
                average: motionAverage.toFixed(2),
                lowest: motionMin.toFixed(2),
              });
            }
            calculateColumnStats(
              pulseRateColumn,
              oxygenLevelColumn,
              motionColumn
            );

            function calculateO2Score(oxygenLevelColumn) {
              const o2valueCounts = {
                "70-74": 0,
                "75-79": 0,
                "80-84": 0,
                "85-89": 0,
                "90-94": 0,
                "95-100": 0,
              };
              // Step 2: Count the values within each range
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

              // Step 3: Calculate the total count
              const o2totalCount = oxygenLevelColumn.length;

              // Step 4: Calculate the ratio for each range
              const o2ratios = Object.values(o2valueCounts).map(
                (o2count) => (o2count / o2totalCount) * 100
              );

              // Step 5: Calculate the score
              const o2Score =
                o2ratios[0] * 0.2 +
                o2ratios[1] * 0.4 +
                o2ratios[2] * 0.6 +
                o2ratios[3] * 0.8 +
                o2ratios[4] * 1 +
                o2ratios[5] * 1.2;

              // Scale the score to fit within the range of 0-10
              const scaledO2Score = (o2Score / 12) * 10;

              return scaledO2Score;
            }
            const o2Score = calculateO2Score(oxygenLevelColumn);
            //console.log("O2 Score:", o2Score);
            seto2Score(o2Score);

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
              const startTime = timestampColumn[0];
              const endTime = timestampColumn[timestampColumn.length - 1];
              // Convert start time and end time to 24-hour format
              const startTime24 = new Date(
                "2000-01-01 " + startTime
              ).toLocaleTimeString("en-US", { hour12: false });
              const endTime24 = new Date(
                "2000-01-01 " + endTime
              ).toLocaleTimeString("en-US", { hour12: false });
              // Convert start time and end time to Date objects
              const startDate = new Date("2000-01-01 " + startTime24);
              const endDate = new Date("2000-01-01 " + endTime24);
              // Calculate the difference in milliseconds
              const durationMs = endDate - startDate;
              // Calculate the duration in hours, minutes, and seconds
              const hours = Math.floor(durationMs / 3600000);
              const minutes = Math.floor((durationMs % 3600000) / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              // Format the duration in HH:mm:ss format
              const duration = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

              if (durationMs >= 21599000) {
                setDrop4Input("0");
                setDrop3Input("0");
                setDrop4phInput("0");
                setDrop3phInput("0");
              } else {
                setDrop4Input("NA");
                setDrop3Input("NA");
                setDrop4phInput("NA");
                setDrop3phInput("NA");
              }
              setStartTime(startTime);
              setEndTime(endTime);
              setDuration(duration);
            }
            calculateTimeDuration(timestampColumn);

            function prepareChartData(
              timestampColumn,
              oxygenLevelColumn,
              pulseRateColumn,
              motionColumn
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
            }
            prepareChartData(
              timestampColumn,
              oxygenLevelColumn,
              pulseRateColumn,
              motionColumn
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
      <div className="page">
        <div className="header">
          <h1>Oxygen Level Report</h1>
          <button className="import_button_text" onClick={handleFileImport}>
            Click to Import CSV File
          </button>
          {fileUploaded && (
            <div className="upload-status">File uploaded successfully!</div>
          )}
        </div>

        <div className="info_border">
          <div className="name">Name: </div>
          <div className="age">Age: </div>
          <div className="gender">Gender: </div>
        </div>

        <div className="std_border">
          <div className="start">
            Start Time:{" "}
            {startTime ? startTime + "," + (dateStart ? dateStart : "-") : "-"}
          </div>
          <div className="end">
            End Time:{" "}
            {endTime ? endTime + "," + (dateEnd ? dateEnd : "-") : "-"}
          </div>
          <div className="duration">Duration: {duration ? duration : "-"}</div>
        </div>

        <div className="note_border">
          <div className="note">Note: </div>
        </div>

        <div className="drop4_border">
          <div className="drop4"> Drops &gt;4%: {drop4Input}</div>
          <div className="drop4_ph">Drops per hour: {drop4phInput}</div>
        </div>

        <div className="drop3_border">
          <div className="drop3"> Drops &gt;3%: {drop3Input}</div>
          <div className="drop3_ph">Drops per hour: {drop3phInput}</div>
        </div>

        <table className="olt_table">
          <tr>
            <th>Oxygen Level Threshold:</th>
            <th>Duration</th>
            <th>%Total</th>
          </tr>
          <tr>
            <td>&ge;95</td>
            <td>{(o2t["≥95"] * 2).toFixed(0)}</td>
            <td>{o2tPercentage["≥95"]}%</td>
          </tr>
          <tr>
            <td>90-94</td>
            <td>{(o2t["90-94"] * 2).toFixed(0)}</td>
            <td>{o2tPercentage["90-94"]}%</td>
          </tr>
          <tr>
            <td>&le; 90</td>
            <td>{(o2t["≤90"] * 2).toFixed(0)}</td>
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
            <td>{(pr["≥120"] * 2).toFixed(0)}</td>
            <td>{prPercentage["≥120"]}%</td>
          </tr>
          <tr>
            <td>50-120</td>
            <td>{(pr["50-120"] * 2).toFixed(0)}</td>
            <td>{prPercentage["50-120"]}%</td>
          </tr>
          <tr>
            <td>&le; 50</td>
            <td>{(pr["≤50"] * 2).toFixed(0)}</td>
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
          <br />
          <tr>
            <td>O2 Score</td>
            <td colSpan="2">
              <div className="colored-bar">
                <div className="arrow-indicator"></div>
              </div>
              {o2Score}
            </td>
            <td> </td>
          </tr>
        </table>

        <table className="ODT_table">
          <tr>
            <th>Oxygen Level </th>
            <th>Duration</th>
            <th>%Total</th>
          </tr>
          <tr>
            <td>96-100</td>
            <td>{(ol["96-100"] * 2).toFixed(0)}</td>
            <td>{olPercentage["96-100"]}%</td>
          </tr>

          <tr>
            <td>91-95</td>
            <td>{(ol["91-95"] * 2).toFixed(0)}</td>
            <td>{olPercentage["91-95"]}%</td>
          </tr>

          <tr>
            <td>86-90</td>
            <td>{(ol["86-90"] * 2).toFixed(0)}</td>
            <td>{olPercentage["86-90"]}%</td>
          </tr>

          <tr>
            <td>81-85</td>
            <td>{(ol["81-85"] * 2).toFixed(0)}</td>
            <td>{olPercentage["81-85"]}%</td>
          </tr>

          <tr>
            <td>76-80</td>
            <td>{(ol["76-80"] * 2).toFixed(0)}</td>
            <td>{olPercentage["76-80"]}%</td>
          </tr>

          <tr>
            <td>70-75</td>
            <td>{(ol["70-75"] * 2).toFixed(0)}</td>
            <td>{olPercentage["70-75"]}%</td>
          </tr>

          <tr>
            <td>&lt;70</td>
            <td>{(ol["≤70"] * 2).toFixed(0)}</td>
            <td>{olPercentage["≤70"]}%</td>
          </tr>
        </table>

        <div className="graphs_border">
          <div className="graph_size">
            <LineChart chartData={oxygenLevelChartData} />
            <LineChart chartData={pulseRateChartData} />
            <LineChart chartData={motionChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default O2Report;
