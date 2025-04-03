import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyTrends, fetchWeeklyTrends, fetchActivitySummary } from '../slices/activitySlice';
import ActivitySummary from './ActivitySummary';
import DailyTrends from './DailyTrends';
import WeeklyTrends from './WeeklyTrends';
import '../styles/ActivityDashboard.css';

function ActivityDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  
  
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
    <div className="activity-dashboard">
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Trends
        </button>
        <button 
          className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Trends
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default ActivityDashboard;