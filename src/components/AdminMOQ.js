import React from 'react';
import MOQEditor from './MOQEditor';
import './AdminMOQ.css';

function AdminMOQ() {
  return (
    <div className="admin-moq-page">
      <div className="admin-moq-header">
        <h1>🔧 Admin Panel - MOQ Configuration</h1>
        <a href="/admin" className="back-btn">← Back to Dashboard</a>
      </div>
      <MOQEditor />
    </div>
  );
}

export default AdminMOQ;
