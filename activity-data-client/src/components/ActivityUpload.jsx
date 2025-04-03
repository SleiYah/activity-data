import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadActivityData, clearUploadState } from '../slices/uploadSlice';
import "../styles/ActivityUpload.css"
function ActivityUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const dispatch = useDispatch();
  const { loading, success, error, stats } = useSelector(state => state.upload);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert('Please select a valid CSV file');
      setFile(null);
      setFileName('');
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64String = event.target.result.split(',')[1];
        
        dispatch(uploadActivityData(base64String));
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setFileName('');
    dispatch(clearUploadState());
  };
  
  return (
    <div className="upload-container">
      <h3>Upload Activity Data</h3>
      <p className="upload-instructions">
        Upload your CSV file containing activity data (steps, distance, active minutes)
      </p>
      
      <div className="file-input-container">
        <input 
          type="file" 
          id="csv-file-input"
          onChange={handleFileChange}
          accept=".csv"
          className="file-input"
        />
        {fileName && <span className="file-name">Selected: {fileName}</span>}
      </div>
      
      <div className="upload-actions">
        <button 
          className="upload-btn" 
          onClick={handleUpload} 
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload Activity Data'}
        </button>
        
        {file && (
          <button className="reset-btn" onClick={handleReset}>
            Clear
          </button>
        )}
      </div>
      
      {success && (
        <div className="upload-success">
          <h4>Upload Successful!</h4>
          <p>Your activity data has been processed:</p>
          <ul>
            <li>Records imported: {stats?.inserted}</li>
            <li>Error records: {stats?.errors}</li>
          </ul>
          <button className="dismiss-btn" onClick={handleReset}>
            Dismiss
          </button>
        </div>
      )}
      
      {error && (
        <div className="upload-error">
          <h4>Upload Failed</h4>
          <p>{error}</p>
          <button className="dismiss-btn" onClick={handleReset}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityUpload;