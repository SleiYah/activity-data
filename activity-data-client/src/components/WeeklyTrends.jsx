import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeeklyTrends } from '../slices/activitySlice';
import Chart from 'chart.js/auto';
import '../styles/ActivityCharts.css';

function WeeklyTrends() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.activity.weeklyTrends);
  
  const stepsChartRef = useRef(null);
  const distanceChartRef = useRef(null);
  
  const stepsChartInstance = useRef(null);
  const distanceChartInstance = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchWeeklyTrends(6)); 
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
        
        // Create steps chart
        if (stepsChartRef.current) {
          stepsChartInstance.current = new Chart(stepsChartRef.current, {
            type: 'bar',
            data: {
              labels: data.map(week => `${week.weekStart} to ${week.weekEnd}`),
              datasets: [
                {
                  label: 'Total Steps',
                  data: data.map(week => week.totalSteps),
                  backgroundColor: 'rgba(74, 108, 247, 0.6)',
                  borderColor: 'rgba(74, 108, 247, 1)',
                  borderWidth: 1,
                  yAxisID: 'y'
                },
                {
                  label: 'Daily Average',
                  data: data.map(week => week.avgSteps),
                  backgroundColor: 'rgba(72, 187, 120, 0.6)',
                  borderColor: 'rgba(72, 187, 120, 1)',
                  borderWidth: 1,
                  type: 'line',
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Weekly Steps'
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Total Steps'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Avg Steps/Day'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
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
        
        // Create distance chart
        if (distanceChartRef.current) {
          distanceChartInstance.current = new Chart(distanceChartRef.current, {
            type: 'bar',
            data: {
              labels: data.map(week => `${week.weekStart} to ${week.weekEnd}`),
              datasets: [
                {
                  label: 'Total Distance (km)',
                  data: data.map(week => week.totalDistance),
                  backgroundColor: 'rgba(237, 100, 166, 0.6)',
                  borderColor: 'rgba(237, 100, 166, 1)',
                  borderWidth: 1,
                  yAxisID: 'y'
                },
                {
                  label: 'Daily Average (km)',
                  data: data.map(week => week.avgDistance),
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1,
                  type: 'line',
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Weekly Distance'
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Total Distance (km)'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Avg Distance/Day (km)'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
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
    };
  }, [data]);
  
  if (loading) {
    return <div className="chart-loading">Loading weekly activity trends...</div>;
  }
  
  if (error) {
    return <div className="chart-error">Error loading weekly trends: {error}</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="chart-empty">No weekly activity data available. Please upload your activity data.</div>;
  }
  
  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <canvas ref={stepsChartRef}></canvas>
      </div>
      
      <div className="chart-wrapper">
        <canvas ref={distanceChartRef}></canvas>
      </div>
    </div>
  );
}

export default WeeklyTrends;