import React from 'react';
import './MOQValidator.css';

function MOQValidator({ currentMOQ, selectedQuantity, onQuantityChange, productName }) {
  const isValid = selectedQuantity >= currentMOQ;
  const difference = currentMOQ - selectedQuantity;

  return (
    <div className="moq-validator">
      <div className="moq-info">
        <div className="moq-label">
          <span className="moq-icon">📦</span>
          <span>Minimum Order Quantity (MOQ)</span>
        </div>
        <div className="moq-value">{currentMOQ} {currentMOQ === 1 ? 'piece' : 'pieces'}</div>
      </div>

      <div className="quantity-input-section">
        <label htmlFor="quantity">Your Quantity:</label>
        <div className="quantity-input-wrapper">
          <button 
            className="qty-btn"
            onClick={() => onQuantityChange(Math.max(1, selectedQuantity - 1))}
            disabled={selectedQuantity <= 1}
          >
            -
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            className={!isValid ? 'invalid' : ''}
          />
          <button 
            className="qty-btn"
            onClick={() => onQuantityChange(selectedQuantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      {!isValid && (
        <div className="moq-warning">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>MOQ Not Met</strong>
            <p>You need to order at least {difference} more {difference === 1 ? 'piece' : 'pieces'} to meet the minimum order quantity.</p>
          </div>
        </div>
      )}

      {isValid && currentMOQ > 1 && (
        <div className="moq-success">
          <span className="success-icon">✓</span>
          <span>MOQ requirement met</span>
        </div>
      )}
    </div>
  );
}

export default MOQValidator;
