import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from './config';
import './LogDetails.css';

function LogDetails({ logId, onBack, searchAction }) {
  const [details, setDetails] = useState([]);
  const [logInfo, setLogInfo] = useState({ total_operations: 0, operation_time: '00:00:00' });

  useEffect(() => {
    const fetchLogDetails = async () => {
      try {
        const response = await axios.get(`/api/log-details/${logId}/`);
        setDetails(response.data);
        // Fetch log info
        const logInfoResponse = await axios.get(`/api/get_log_info/${logId}/`);
        setLogInfo(logInfoResponse.data);
      } catch (error) {
        console.error('Error fetching log details:', error);
      }
    };

    fetchLogDetails();
  }, [logId]);

  return (
    <div className="log-details">
      <button className="btn btn-secondary mb-3" onClick={onBack}>前へ</button>
      <div className="log-summary">
        <div className="summary-item">
          <span className="summary-label">操作数:</span>
          <span className="summary-value">{logInfo.total_operations}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">操作時間:</span>
          <span className="summary-value">{logInfo.operation_time}</span>
        </div>
      </div>
      <div className="timeline">
        {details.map((detail, index) => {
          const isHighlighted = searchAction && detail.explanation && 
            detail.explanation.toLowerCase().includes(searchAction.toLowerCase());
          return (
            <div key={index} className={`timeline-item ${isHighlighted ? 'highlighted' : ''}`}>
              <div className="timeline-content">
                <img src={`${BACKEND_URL}/media/${detail.capimg}`} alt="Captured" className="captured-image" />
                <div className="text-content">
                  <p className={`explanation ${isHighlighted ? 'highlighted-text' : ''}`}>{detail.explanation}</p>
                  <p className="action-time">開始時間：{detail.action_time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LogDetails;
