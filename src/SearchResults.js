import React from 'react';
import './SearchResults.css';

function SearchResults({ results, onLogDetails }) {
  return (
    <div className="search-results">
      {results.map((result, index) => (
        <div key={index} className="result-card">
          <div className="result-header">
            <h3 className="filename">{result.filename}</h3>
            <span className="note">{result.note}</span>
          </div>
          <div className="result-body">
            <div className="result-info">
              <span className="info-label">操作時間:</span>
              <span className="info-value">{result.operation_time}</span>
            </div>
            <div className="result-info">
              <span className="info-label">総操作数:</span>
              <span className="info-value">{result.total_operations}</span>
            </div>
          </div>
          <button 
            className="details-button" 
            onClick={() => onLogDetails(result.id)}
          >
            詳細
          </button>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
