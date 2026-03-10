import React from 'react';
import './LandingPage.css';

function LandingPage({ onStart, onAdminAccess }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <span className="landing-icon"><i className="fas fa-fire"></i></span>
        <h1 className="landing-title">Craft Your Perfect Candle</h1>
        <p className="landing-subtitle">
          Design bespoke candles tailored to your brand. Choose from premium glass containers,
          custom fragrances, unique decorations, and personalized labels — all with
          real-time preview and instant pricing.
        </p>
        <button className="landing-cta" onClick={onStart}>
          Start Customizing →
        </button>
        <button className="landing-admin-link" onClick={onAdminAccess}>
          🔧 Admin Dashboard
        </button>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="landing-feature-icon"><i className="fas fa-palette"></i></span>
          <h4>Full Customization</h4>
          <p>Colors, scents & packaging</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon"><i className="fas fa-eye"></i></span>
          <h4>Live Preview</h4>
          <p>See changes in real-time</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon"><i className="fas fa-box"></i></span>
          <h4>MOQ Flexible</h4>
          <p>From samples to bulk</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon"><i className="fas fa-dollar-sign"></i></span>
          <h4>Instant Pricing</h4>
          <p>Dynamic cost calculation</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
