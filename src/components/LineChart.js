import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function LineChart({ chartData }) {
  // Create a ref to hold the chart instance
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);
  // Use useEffect to create and update the chart
  React.useEffect(() => {
    if (chartRef.current) {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }
          chartInstanceRef.current = new ChartJS(chartRef.current.getContext("2d"), {
            type: "line",
            data: chartData,
            options: {
            responsive: true,
            scales: {
                x: {
                display: true,
                title: {
                    display: true,
                    text: "Time"
                }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    drawBorder: false,
                    lineWidth: 0.5,
                    color: "rgba(0, 0, 0, 0.1)",
                    tickMarkLength: 0, // Reduce the length of tick marks
                    drawTicks: false, // Disable drawing tick marks
                    padding: {
                      top: 0, // Reduce top padding
                      bottom: 0, // Reduce bottom padding
                    }
                }
                }
            }
            }
        });
        }
    }, [chartData]);

  return <canvas ref={chartRef} />;
}

export default LineChart;