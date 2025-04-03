import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPredictions } from '../slices/predictionSlice';
import '../styles/AiPredictions.css';

function AiPredictions() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.predictions);
  
  useEffect(() => {
    dispatch(fetchUserPredictions());
  }, [dispatch]);
  
  const getReadablePredictionType = (type) => {
    switch(type) {
      case 'goal_achievement':
        return 'Will I achieve my steps goal tomorrow?';
      case 'pattern_deviation':
        return 'What unusual patterns are in my activity?';
      case 'future_trend':
        return 'What are my predicted activity levels for the coming days?';
      case 'insight':
        return 'What insights can be drawn from my activity patterns?';
      default:
        return type;
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!data || data.length === 0) {
    return <div>No predictions available. Upload activity data first.</div>;
  }
  
  return (
    <div className="predictions-container">
      <h2>AI Predictions</h2>
      
      {data.map(prediction => (
        <div key={prediction.id} className="prediction-item">
          <h3>{getReadablePredictionType(prediction.prediction_type)}</h3>
          <div className="prediction-text">
            {prediction.prediction_result}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AiPredictions;