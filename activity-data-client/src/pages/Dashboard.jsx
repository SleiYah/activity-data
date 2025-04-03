import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActivitySummary } from '../slices/activitySlice';
import "../styles/Dashboard.css";
import ActivityUpload from '../components/ActivityUpload';
import ActivitySummary from '../components/ActivitySummary';
import DailyTrends from '../components/DailyTrends';
import WeeklyTrends from '../components/WeeklyTrends';
import ActivityDashboard from '../components/ActivityDashboard';

function Dashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('summary');
  const [checkingForData, setCheckingForData] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  
  // Check if user has existing data when component mounts
  useEffect(() => {
    const checkData = async () => {
      try {
        const result = await dispatch(fetchActivitySummary()).unwrap();
        if (result && result.allTime && result.allTime.totalDaysTracked > 0) {
          setHasExistingData(true);
        }
      } catch (error) {
        // No data available
        console.log('No activity data found');
      } finally {
        setCheckingForData(false);
      }
    };
    
    checkData();
  }, [dispatch]);
  
  // Also check for data after upload
  const uploadSuccess = useSelector(state => state.upload.success);
  useEffect(() => {
    if (uploadSuccess) {
      setHasExistingData(true);
    }
  }, [uploadSuccess]);
  
  // Render tab content based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <ActivitySummary />;
      case 'daily':
        return <DailyTrends />;
      case 'weekly':
        return <WeeklyTrends />;
      default:
        return <ActivitySummary />;
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h2>Activity Dashboard</h2>
            <p>Track and analyze your fitness activity</p>
          </div>
        </div>
        
        <div className="dashboard-content">
          <ActivityUpload />
          
          <ActivityDashboard />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;