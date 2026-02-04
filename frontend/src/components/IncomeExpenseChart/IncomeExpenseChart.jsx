import React, { useState, useEffect } from 'react';
import dashboardApi from '../../api/dashboardApi';
import './IncomeExpenseChart.css';

const IncomeExpenseChart = () => {
  const [timeRange, setTimeRange] = useState('6M');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const months = timeRange === '6M' ? 6 : timeRange === '1Y' ? 12 : 24;
        const response = await dashboardApi.getMonthlyTrend(months);
        setChartData(response || []);
      } catch (error) {
        console.error('Error fetching trend data:', error);
        // Fallback to placeholder data
        setChartData([
          { month: 'Jul', totalIncome: 3200, totalExpense: 2800 },
          { month: 'Aug', totalIncome: 3500, totalExpense: 3100 },
          { month: 'Sep', totalIncome: 2800, totalExpense: 2600 },
          { month: 'Oct', totalIncome: 3800, totalExpense: 3300 },
          { month: 'Nov', totalIncome: 3200, totalExpense: 2900 },
          { month: 'Dec', totalIncome: 3600, totalExpense: 3100 }
        ]);
      }
    };
    loadData();
  }, [timeRange]);

  const currentData = chartData;
  const maxValue = currentData.length > 0 ? Math.max(...currentData.flatMap(d => [d.totalIncome || 0, d.totalExpense || 0])) : 4000;

  return (
    <div className="income-expense-chart">
      <div className="chart-header">
        <h3 className="chart-title">Income vs Expense Trend</h3>
        <div className="chart-controls">
          {['6M', '1Y', 'All'].map((range) => (
            <button
              key={range}
              className={`control-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-placeholder">
          <div className="bar-chart">
            {currentData.map((item) => (
              <div key={item.month} className="chart-bar-group">
                <div className="bar-container">
                  <div
                    className="bar income-bar"
                    style={{ height: `${((item.totalIncome || 0) / maxValue) * 100}%` }}
                  >
                    <span className="bar-value">${item.totalIncome || 0}</span>
                  </div>
                  <div
                    className="bar expense-bar"
                    style={{ height: `${((item.totalExpense || 0) / maxValue) * 100}%` }}
                  >
                    <span className="bar-value">${item.totalExpense || 0}</span>
                  </div>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color income-color"></div>
          <span className="legend-label">Income</span>
        </div>
        <div className="legend-item">
          <div className="legend-color expense-color"></div>
          <span className="legend-label">Expense</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;