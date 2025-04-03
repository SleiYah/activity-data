import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActivitySummary } from '../slices/activitySlice';
import '../styles/ActivitySummary.css';

function ActivitySummary() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.activity.summary);
  
  useEffect(() => {
    if (!data) {
      dispatch(fetchActivitySummary());
    }
  }, [dispatch, data]);
  
  if (loading) {
    return <div className="summary-loading">Loading activity summary...</div>;
  }
  
  if (error) {
    return <div className="summary-error">Error loading activity summary: {error}</div>;
  }
  
  if (!data) {
    return <div className="summary-empty">No activity summary available. Please upload your activity data.</div>;
  }
  
  return (
    <div className="activity-summary">
      <div className="summary-cards">
        <div className="summary-card today-card">
          <h4 className="card-title">Today</h4>
          {data.today ? (
            <div className="today-stats">
              <div className="stat-item">
                <span className="stat-value">{data.today.steps.toLocaleString()}</span>
                <span className="stat-label">Steps</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{data.today.distance_km.toFixed(1)}</span>
                <span className="stat-label">km</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{data.today.active_minutes}</span>
                <span className="stat-label">Active Min</span>
              </div>
            </div>
          ) : (
            <p className="no-data">No data for today</p>
          )}
        </div>
        
        <div className="summary-card streak-card">
          <h4 className="card-title">Current Streak</h4>
          <div className="streak-display">
            <span className="streak-value">{data.currentStreak}</span>
            <span className="streak-label">days</span>
          </div>
          <p className="streak-description">
            {data.currentStreak > 0 
              ? `You've been active for ${data.currentStreak} consecutive days!` 
              : "No active streak. Upload today's activity to start!"}
          </p>
        </div>
        
        <div className="summary-card weekly-avg-card">
          <h4 className="card-title">Weekly Average</h4>
          <div className="weekly-stats">
            <div className="stat-item">
              <span className="stat-value">{data.weeklyAverage.steps.toLocaleString()}</span>
              <span className="stat-label">Steps</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{data.weeklyAverage.distance}</span>
              <span className="stat-label">km</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{data.weeklyAverage.activeMinutes}</span>
              <span className="stat-label">Active Min</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="all-time-stats">
        <h4 className="section-title">All-time Stats</h4>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Days Tracked</span>
            <span className="stat-value">{data.allTime.totalDaysTracked}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Steps</span>
            <span className="stat-value">{data.allTime.avgSteps.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Max Steps</span>
            <span className="stat-value">{data.allTime.maxSteps.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Distance</span>
            <span className="stat-value">{data.allTime.avgDistance} km</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Max Distance</span>
            <span className="stat-value">{data.allTime.maxDistance} km</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Active Min</span>
            <span className="stat-value">{data.allTime.avgActiveMinutes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivitySummary;