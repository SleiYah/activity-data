import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyTrends } from '../slices/activitySlice';
import Chart from 'chart.js/auto';
import '../styles/ActivityCharts.css';

function DailyTrends() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.activity.dailyTrends);
  
  const stepsChartRef = useRef(null);
  const distanceChartRef = useRef(null);
  const minutesChartRef = useRef(null);
  
  const stepsChartInstance = useRef(null);
  const distanceChartInstance = useRef(null);
  const minutesChartInstance = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchDailyTrends(30));
    }
  }, [dispatch, data]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      const createCharts = () => {
        if (stepsChartInstance.current) {
          stepsChartInstance.current.destroy();
        }
        if (distanceChartInstance.current) {
          distanceChartInstance.current.destroy();
        }
        if (minutesChartInstance.current) {
          minutesChartInstance.current.destroy();
        }
        
        if (stepsChartRef.current) {
          stepsChartInstance.current = new Chart(stepsChartRef.current, {
            type: 'bar',
            data: {
              labels: data.map(item => item.date),
              datasets: [{
                label: 'Steps',
                data: data.map(item => item.steps),
                backgroundColor: 'rgba(74, 108, 247, 0.6)',
                borderColor: 'rgba(74, 108, 247, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Daily Steps'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }
          });
        }
        
        if (distanceChartRef.current) {
          distanceChartInstance.current = new Chart(distanceChartRef.current, {
            type: 'line',
            data: {
              labels: data.map(item => item.date),
              datasets: [{
                label: 'Distance (km)',
                data: data.map(item => item.distance),
                backgroundColor: 'rgba(72, 187, 120, 0.2)',
                borderColor: 'rgba(72, 187, 120, 1)',
                borderWidth: 2,
                fill: true
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Daily Distance (km)'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }
          });
        }
        
        if (minutesChartRef.current) {
          minutesChartInstance.current = new Chart(minutesChartRef.current, {
            type: 'bar',
            data: {
              labels: data.map(item => item.date),
              datasets: [{
                label: 'Active Minutes',
                data: data.map(item => item.activeMinutes),
                backgroundColor: 'rgba(237, 100, 166, 0.6)',
                borderColor: 'rgba(237, 100, 166, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Daily Active Minutes'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }
          });
        }
      };
      
      createCharts();
    }
    
    return () => {
      if (stepsChartInstance.current) {
        stepsChartInstance.current.destroy();
        stepsChartInstance.current = null;
      }
      if (distanceChartInstance.current) {
        distanceChartInstance.current.destroy();
        distanceChartInstance.current = null;
      }
      if (minutesChartInstance.current) {
        minutesChartInstance.current.destroy();
        minutesChartInstance.current = null;
      }
    };
  }, [data]);
  
  if (loading) {
    return <div className="chart-loading">Loading daily activity data...</div>;
  }
  
  if (error) {
    return <div className="chart-error">Error loading daily trends: {error}</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="chart-empty">No daily activity data available. Please upload your activity data.</div>;
  }
  
  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <canvas ref={stepsChartRef}></canvas>
      </div>
      
      <div className="chart-wrapper">
        <canvas ref={distanceChartRef}></canvas>
      </div>
      
      <div className="chart-wrapper">
        <canvas ref={minutesChartRef}></canvas>
      </div>
    </div>
  );
}

export default DailyTrends;