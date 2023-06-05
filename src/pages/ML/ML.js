// import * as tf from "@tensorflow/tfjs";
// import { useEffect, useState } from "react";
// import Papa from "papaparse";

// const ML = () => {
//   const [model, setModel] = useState(null);

//   useEffect(() => {
//     const loadModel = async () => {
//       const model = await tf.loadGraphModel();
//       setModel(model);
//     };
//     loadModel();
//   }, []);
//   const predict = async (sensorsData) => {
//     if (model) {
//       const prediction = model.predict(sensorsData);
//       // Process the prediction results
//       console.log(prediction);
//     }
//   };
//   predict(sensorsData);
//   return <div></div>;
// };

// export default ML;
