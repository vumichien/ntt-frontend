import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchResults from './SearchResults';
import LogDetails from './LogDetails';
import './App.css'; // Tạo file này để thêm các styles tùy chỉnh
import ErrorLogVisualization from './ErrorLogVisualization';

function App() {
  const [searchParams, setSearchParams] = useState({ business: '', action: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    fetch('/api/search_logs/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
    })
      .then(response => response.json())
      .then(setSearchResults)
      .catch(error => console.error('Error:', error));
  };

  const handleLogDetails = (logId) => setSelectedLogId(logId);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ログ検索システム</h1>
      </header>
      
      <nav className="app-nav mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button onClick={() => setActiveTab('search')} className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}>
              ログ検索
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('errorLogs')} className={`nav-link ${activeTab === 'errorLogs' ? 'active' : ''}`}>
              エラーログ
            </button>
          </li>
        </ul>
      </nav>

      <main className="app-main">
        {activeTab === 'search' ? (
          !selectedLogId ? (
            <>
              <form onSubmit={handleSearch} className="search-container">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="業務"
                  name="business"
                  value={searchParams.business}
                  onChange={handleInputChange}
                />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="操作"
                  name="action"
                  value={searchParams.action}
                  onChange={handleInputChange}
                />
                <button 
                  type="submit"
                  className="search-button"
                >
                  検索
                </button>
              </form>

              <SearchResults results={searchResults} onLogDetails={handleLogDetails} />
            </>
          ) : (
            <LogDetails logId={selectedLogId} onBack={() => setSelectedLogId(null)} searchAction={searchParams.action} />
          )
        ) : (
          <ErrorLogVisualization />
        )}
      </main>
    </div>
  );
}

export default App;