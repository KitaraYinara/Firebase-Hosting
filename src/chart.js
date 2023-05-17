import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { subscribeToSensorData } from "./firebase";

function Chart() {
  const [sensorData, setSensorData] = useState([]);
  const [showAllData, setShowAllData] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleData, setVisibleData] = useState([]);

  useEffect(() => {
    subscribeToSensorData((data) => {
      setSensorData(data);
    });
  }, []);

  useEffect(() => {
    if (showAllData) {
      setVisibleData(sensorData);
    } else {
      const endIndex = startIndex + 10;
      setVisibleData(sensorData.slice(startIndex, endIndex));
    }
  }, [sensorData, showAllData, startIndex]);

  const handleShowAllData = () => {
    setShowAllData(true);
    setStartIndex(0);
  };

  const handlePrevData = () => {
    if (!showAllData && startIndex > 0) {
      setStartIndex(startIndex - 10);
    }
  };

  const handleNextData = () => {
    if (!showAllData && startIndex + 10 < sensorData.length) {
      setStartIndex(startIndex + 10);
    }
  };

  return (
    <div>
      <div>
        {!showAllData && (
          <button onClick={handleShowAllData}>Show All Data</button>
        )}
      </div>
      <LineChart width={800} height={600} data={visibleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="bpm" stroke="#8884d8" />
        <Line type="monotone" dataKey="spO2" stroke="#82ca9d" />
        <Line type="monotone" dataKey="motion" stroke="#ffc658" />
      </LineChart>
      {!showAllData && (
        <div>
          <button onClick={handlePrevData} disabled={startIndex === 0}>
            Prev
          </button>
          <button
            onClick={handleNextData}
            disabled={startIndex + 10 >= sensorData.length}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Chart;
