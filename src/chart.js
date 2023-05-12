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
import { db1 } from "./firebase";

function Chart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    db1.ref("/").on("value", (snapshot) => {
      const rawData = snapshot.val();
      const formattedData = Object.keys(rawData).map((key) => ({
        //timestamp: key,
        bpm: rawData.bpm,
        spo2: rawData.spo2,
      }));
      console.log(rawData);
      console.log(rawData.bpm);
      //console.log(formattedData);
      setData(formattedData);
      //addData(formattedData);
      console.log("================================>");
    });
  }, []);

  return (
    <LineChart width={800} height={600} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="bpm" stroke="#8884d8" />
      <Line type="monotone" dataKey="spo2" stroke="#82ca9d" />
    </LineChart>
  );
}

export default Chart;
