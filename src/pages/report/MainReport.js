import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { Line } from "react-chartjs-2";
import "./MainReport.css";
import Papa from "papaparse";

const MainReport = () => {
  const [pulseRateData, setPulseRateData] = useState({});
  const [oxygenLevelData, setOxygenLevelData] = useState({});
  const [motionData, setMotionData] = useState({});
  const [timestampData, setTimestampData] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

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
            const timestampIndex = headerRow.indexOf("Timestamp");

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

            function handleNaN(value) {
              return isNaN(value) ? 0 : value;
            }

            // Finding the highest, average, and lowest values in each column
            const pulseRateMax = Math.max(...pulseRateColumn);
            const pulseRateAverage =
              pulseRateColumn.reduce((sum, value) => sum + value, 0) /
              pulseRateColumn.length;
            const pulseRateMin = Math.min(...pulseRateColumn);
            console.log("Pulse Rate Column:", pulseRateColumn);

            const oxygenLevelMax = Math.max(...oxygenLevelColumn);
            const oxygenLevelAverage =
              oxygenLevelColumn.reduce((sum, value) => sum + value, 0) /
              oxygenLevelColumn.length;
            const oxygenLevelMin = Math.min(...oxygenLevelColumn);
            console.log("Oxygen Level Column:", oxygenLevelColumn); // Log the extracted oxygen level column values

            const motionMax = Math.max(...motionColumn);
            const motionAverage =
              motionColumn.reduce((sum, value) => sum + value, 0) /
              motionColumn.length;
            const motionMin = Math.min(...motionColumn);

            const firstTimestamp = timestampColumn
              .map((timestamp) => new Date(timestamp))
              .sort((a, b) => a - b)[0];
            const lastTimestamp = timestampColumn
              .map((timestamp) => new Date(timestamp))
              .sort((a, b) => b - a)[0];
            const durationInMilliseconds =
              new Date(lastTimestamp) - new Date(firstTimestamp);
            const durationInSeconds = durationInMilliseconds / 1000;
            const durationInMinutes = durationInSeconds / 60;
            const durationInHours = durationInMinutes / 60;

            // Updating the state with the extracted data
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
            console.log("Oxygen Level Highest:", oxygenLevelMax.toFixed(2));
            console.log("Oxygen Level Average:", oxygenLevelAverage.toFixed(2));
            console.log("Oxygen Level Lowest:", oxygenLevelMin.toFixed(2));

            setMotionData({
              highest: motionMax.toFixed(2),
              average: motionAverage.toFixed(2),
              lowest: motionMin.toFixed(2),
            });
            if (firstTimestamp && lastTimestamp) {
              const startTime = firstTimestamp.toLocaleString();
              const endTime = lastTimestamp.toLocaleString();
              setStartTime(startTime);
              setEndTime(endTime);
              console.log("Start Time:", startTime);
              console.log("End Time:", endTime);

              const durationInMilliseconds = lastTimestamp - firstTimestamp;
              const durationInSeconds = Math.floor(
                durationInMilliseconds / 1000
              );
              const durationInMinutes = Math.floor(durationInSeconds / 60);
              const durationInHours = Math.floor(durationInMinutes / 60);
              const duration = `${durationInHours} hours ${
                durationInMinutes % 60
              } minutes`;
              setDuration(duration);
              console.log("Duration:", duration);
            } else {
              console.log("Invalid timestamps found.");
            }
            setTimestampData(timestampColumn);
            setDuration(
              `${durationInHours.toFixed(0)} hours ${durationInMinutes.toFixed(
                0
              )} minutes`
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
          <div className="name">Name: John Doe</div>
          <div className="age">Age: 30</div>
          <div className="gender">Gender: </div>
        </div>

        <div className="std_border">
          <div className="start">Start Time: {startTime || "-"}</div>
          <div className="end">End Time: {endTime || "-"}</div>
          <div className="duration">Duration: {duration || "-"}</div>
        </div>
        <div className="note_border">
          <div className="note">Note: Patient is recovering well.</div>
        </div>

        <div className="drop4_border">
          <div className="drop4"> Drops &gt;4%: 114</div>
          <div className="drop4_ph">Drops per hour: 14.2</div>
        </div>

        <div className="drop3_border">
          <div className="drop3"> Drops &gt;3%: 169</div>
          <div className="drop3_ph">Drops per hour: 21.1</div>
        </div>

        <table class="olt_table">
          <tr>
            <th>Oxygen Level Threshold: 94</th>
            <th>Duration</th>
            <th>%Total</th>
          </tr>
          <tr>
            <td> &ge;95</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>90-94</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>&le; 90</td>
            <td></td>
            <td></td>
          </tr>
        </table>

        <table class="plt_table">
          <tr>
            <th>Pulse Rate Threshold: </th>
            <th>Duration</th>
            <th>%Total</th>
          </tr>
          <tr>
            <td> &ge;120</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>50-120</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>&le; 50</td>
            <td></td>
            <td></td>
          </tr>
        </table>

        <div className="O2ratio_display"></div>

        <table class="hal_table">
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
              <div className="colored-bar"></div>
            </td>
            <td></td>
          </tr>
        </table>

        <table class="ODT_table">
          <tr>
            <th>Oxygen Level </th>
            <th>Duration</th>
            <th>%Total</th>
          </tr>
          <tr>
            <td>96-100</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>91-95</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>86-90</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>81-85</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>76-80</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>70-75</td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>&lt;70</td>
            <td></td>
            <td></td>
          </tr>
        </table>

        <div className="graphs_border"></div>
      </div>
    </div>
  );
};

export default MainReport;
