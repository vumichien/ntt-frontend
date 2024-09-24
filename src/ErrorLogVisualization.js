import React, { useState, useEffect } from 'react';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import ErrorLogDetails from './ErrorLogDetails';
import Pagination from './Pagination';
import './ErrorLogVisualization.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler);

const hoverPlugin = {
  id: 'hover',
  beforeDraw(chart, args, options) {
    const { ctx, chartArea: {top, bottom, left, right, width, height} } = chart;
    ctx.save();

    if (chart.getActiveElements().length > 0) {
      const activeElement = chart.getActiveElements()[0];
      const dataIndex = activeElement.index;
      const datasetIndex = activeElement.datasetIndex;
      const dataset = chart.data.datasets[datasetIndex];
      const meta = chart.getDatasetMeta(datasetIndex);
      const model = meta.data[dataIndex];

      ctx.beginPath();
      ctx.arc(model.x, model.y, model.outerRadius + 10, model.startAngle, model.endAngle);
      ctx.arc(model.x, model.y, model.innerRadius, model.endAngle, model.startAngle, true);
      ctx.closePath();
      ctx.fillStyle = dataset.backgroundColor[dataIndex];
      ctx.fill();
    }

    ctx.restore();
  }
};

function ErrorLogVisualization() {
  const [errorTypeData, setErrorTypeData] = useState(null);
  const [userErrorData, setUserErrorData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [errorTypeChartType, setErrorTypeChartType] = useState('bar');
  const [summarizedErrorLogs, setSummarizedErrorLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchErrorTypeData();
    fetchUserErrorData();
    fetchUsers();
    fetchSummarizedErrorLogs();
  }, []);

  useEffect(() => {
    fetchErrorTypeData();
  }, [errorTypeChartType]);

  useEffect(() => {
    fetchUserErrorData(selectedUser);
  }, [selectedUser]);

  const fetchErrorTypeData = async () => {
    try {
      const response = await fetch('/api/error_type_statistics/');
      const data = await response.json();
      const colors = generateColors(data.length);
      setErrorTypeData({
        labels: data.map(item => item.error_type),
        datasets: [{
          label: 'エラー発生回数',
          data: data.map(item => item.total_occurrences),
          backgroundColor: errorTypeChartType === 'bar' ? 'rgba(75, 192, 192, 0.6)' : colors,
          borderColor: errorTypeChartType === 'bar' ? 'rgba(75, 192, 192, 1)' : colors,
        }]
      });
    } catch (error) {
      console.error('Error fetching error type data:', error);
    }
  };

  const fetchUserErrorData = async (userName = '') => {
    try {
      const response = await fetch(`/api/user_error_statistics/${userName}`);
      const data = await response.json();
      if (userName) {
        const totalErrors = data.reduce((sum, item) => sum + item.error_count, 0);
        setUserErrorData({
          labels: data.map(item => item.error_type),
          datasets: [{
            label: 'エラー割合 (%)',
            data: data.map(item => ((item.error_count / totalErrors) * 100).toFixed(2)),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            pointBackgroundColor: 'rgba(153, 102, 255, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
            errorCounts: data.map(item => item.error_count)
          }]
        });
      } else {
        setUserErrorData({
          labels: data.map(item => item.user_name),
          datasets: [{
            label: 'エラー回数',
            data: data.map(item => item.error_count),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
          }]
        });
      }
    } catch (error) {
      console.error('Error fetching user error data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSummarizedErrorLogs = async () => {
    try {
      const response = await fetch('/api/summarized_error_logs/');
      const data = await response.json();
      setSummarizedErrorLogs(data);
    } catch (error) {
      console.error('Error fetching summarized error logs:', error);
    }
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setErrorTypeChartType(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const errorTypeOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'エラー発生回数'
        }
      },
      x: {
        title: {
          display: true,
          text: 'エラータイプ'
        }
      }
    },
  };

  const userErrorOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'エラー回数'
        }
      },
      x: {
        title: {
          display: true,
          text: 'ユーザー名'
        }
      }
    },
  };

  const pieOptions = {
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value}件 (${percentage}%)`;
          }
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    plugins: [hoverPlugin]
  };

  const radarOptions = {
    ...baseOptions,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const errorCount = context.dataset.errorCounts[context.dataIndex];
            return `${label}: ${value}% (${errorCount}件)`;
          }
        }
      }
    }
  };

  const generateColors = (count) => {
    return [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ].slice(0, count);
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const sortedErrorLogs = summarizedErrorLogs.sort((a, b) => a.error_type.localeCompare(b.error_type));
  const currentRecords = sortedErrorLogs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(summarizedErrorLogs.length / recordsPerPage);

  return (
    <div className="error-log-visualization">
      <div className="row">
        <div className="col-md-6">
          <div className="chart-card">
            <h4>エラータイプ統計</h4>
            <select value={errorTypeChartType} onChange={handleChartTypeChange} className="form-select mb-3">
              <option value="bar">バーグラフ</option>
              <option value="pie">円グラフ</option>
            </select>
            <div className={`chart-container ${errorTypeChartType === 'pie' ? 'pie-container' : ''}`}>
              {errorTypeData && (
                errorTypeChartType === 'bar' ? (
                  <Bar data={errorTypeData} options={errorTypeOptions} />
                ) : (
                  <Pie data={errorTypeData} options={pieOptions} plugins={[hoverPlugin]} />
                )   
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-card">
            <h4>ユーザーエラー統計</h4>
            <select value={selectedUser} onChange={handleUserChange} className="form-select mb-3">
              <option value="">全てのユーザー</option>
              {users.map(user => (
                <option key={user.id} value={user.user_name}>{user.user_name}</option>
              ))}
            </select>
            <div className="chart-container">
              {userErrorData && (
                selectedUser ? (
                  <Radar data={userErrorData} options={radarOptions} />
                ) : (
                  <Bar data={userErrorData} options={userErrorOptions} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="chart-card">
            <h4>エラー種別統計</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>エラー種別</th>
                  <th>発生件数</th>
                  <th>エラー発生前の操作手順</th>
                  <th>ユーザーID</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((log, index) => (
                  <tr key={index}>
                    <td>{log.error_type}</td>
                    <td>{log.total_occurrences}件</td>
                    <td>{log.actions_before_error.split(',').join(' ⇒ ')}</td>
                    <td>{log.user_ids}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="chart-card">
            <ErrorLogDetails />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorLogVisualization;