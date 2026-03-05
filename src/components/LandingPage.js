import React from 'react';
import './LandingPage.css';

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <span className="landing-icon">🕯️</span>
        <h1 className="landing-title">Craft Your Perfect Candle</h1>
        <p className="landing-subtitle">
          Design bespoke candles tailored to your brand. Choose from premium glass containers,
          custom fragrances, unique decorations, and personalized labels — all with
          real-time preview and instant pricing.
        </p>
        <button className="landing-cta" onClick={onStart}>
          Start Customizing →
        </button>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="landing-feature-icon">🎨</span>
          <h4>Full Customization</h4>
          <p>Colors, scents & packaging</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">👁️</span>
          <h4>Live Preview</h4>
          <p>See changes in real-time</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">📦</span>
          <h4>MOQ Flexible</h4>
          <p>From samples to bulk</p>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">💰</span>
          <h4>Instant Pricing</h4>
          <p>Dynamic cost calculation</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
