import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MOQEditor.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

function MOQEditor() {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCSV();
  }, []);

  const loadCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/csv/moq`);
      const content = await response.text();
      parseCSVToTable(content);
    } catch (err) {
      setError('Failed to load CSV file');
    } finally {
      setLoading(false);
    }
  };

  const parseCSVToTable = (csvText) => {
    const lines = csvText.trim().split('\n');
    const data = lines.map(line => {
      return line.split(',').map(cell => cell.trim());
    });
    setCsvData(data);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newData = [...csvData];
    newData[rowIndex][colIndex] = value;
    setCsvData(newData);
  };

  const saveCSV = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      const response = await axios.put(`${API_URL}/csv/moq`, {
        csvContent
      });
      
      setMessage(`✅ ${response.data.message}`);
      if (response.data.backupFile) {
        setMessage(prev => prev + ` (Backup: ${response.data.backupFile})`);
      }
    } catch (err) {
      setError('❌ Failed to save CSV: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetCSV = () => {
    if (window.confirm('Are you sure you want to reset changes? This will reload the original CSV.')) {
      loadCSV();
      setMessage('');
      setError('');
    }
  };

  const getColumnLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isGlassTypeRow = (rowIndex) => {
    return csvData[rowIndex] && csvData[rowIndex][0] && csvData[rowIndex][0].startsWith('GL');
  };

  const isMOQColumn = (colIndex) => {
    // Key MOQ columns: F(5), G(6), N(13), O(14), S(18), W(22), X(23), AB(27), AC(28)
    return [5, 6, 13, 14, 18, 22, 23, 27, 28].includes(colIndex);
  };

  return (
    <div className="moq-editor">
      <div className="moq-editor-header">
        <h2>📊 MOQ Configuration Editor</h2>
        <div className="moq-editor-actions">
          <button onClick={resetCSV} disabled={loading} className="btn-secondary">
            🔄 Reset
          </button>
          <button onClick={saveCSV} disabled={loading} className="btn-primary">
            {loading ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="moq-editor-content">
        <div className="csv-info">
          <h3>📋 MOQ Columns Guide</h3>
          <div className="moq-columns">
            <div><strong>F:</strong> Extra Colors MOQ</div>
            <div><strong>G:</strong> Any Color MOQ</div>
            <div><strong>N:</strong> Extra Fragrances MOQ</div>
            <div><strong>O:</strong> Own Fragrance MOQ</div>
            <div><strong>S:</strong> Extra Wax Colors MOQ</div>
            <div><strong>W:</strong> Gummy Decoration MOQ</div>
            <div><strong>X:</strong> UV Print MOQ</div>
            <div><strong>AB:</strong> Printed Box MOQ</div>
            <div><strong>AC:</strong> Bottom Lid Box MOQ</div>
          </div>
        </div>

        <div className="csv-table-container">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="csv-table">
              <thead>
                <tr>
                  <th className="row-header">#</th>
                  {csvData[0] && csvData[0].map((_, colIndex) => (
                    <th key={colIndex} className={`col-header ${isMOQColumn(colIndex) ? 'moq-column' : ''}`}>
                      {getColumnLetter(colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={isGlassTypeRow(rowIndex) ? 'glass-type-row' : ''}>
                    <td className="row-header">{rowIndex + 1}</td>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className={`
                        ${isMOQColumn(colIndex) ? 'moq-cell' : ''}
                        ${isGlassTypeRow(rowIndex) && isMOQColumn(colIndex) ? 'editable-moq' : ''}
                      `}>
                        {isGlassTypeRow(rowIndex) && isMOQColumn(colIndex) ? (
                          <input
                            type="number"
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="cell-input moq-input"
                            min="0"
                          />
                        ) : (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="cell-input"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="moq-editor-footer">
        <div className="warning">
          ⚠️ <strong>Warning:</strong> Only edit MOQ values (highlighted columns) for glass types (GL80, GL84, etc.). 
          Changes take effect immediately after saving.
        </div>
      </div>
    </div>
  );
}

export default MOQEditor;
