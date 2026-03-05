import React from 'react';
import './MOQOptionSelector.css';

function MOQOptionSelector({ 
  title, 
  options, 
  selectedValue, 
  onSelect, 
  type = 'radio' // 'radio', 'color', 'button'
}) {
  
  const renderOption = (option) => {
    const isSelected = selectedValue === option.value;
    const moqLabel = option.moq > 1 ? `MOQ: ${option.moq}` : 'MOQ: 1pc';
    
    if (type === 'color') {
      return (
        <div
          key={option.value}
          className={`color-option ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelect(option.value, option.moq)}
          title={`${option.label} - ${moqLabel}`}
        >
          <div 
            className="color-swatch" 
            style={{ backgroundColor: option.color || option.value }}
          />
          <div className="color-info">
            <span className="color-label">{option.label}</span>
            <span className={`moq-badge ${option.moq === 1 ? 'low' : option.moq < 500 ? 'medium' : 'high'}`}>
              {moqLabel}
            </span>
          </div>
          {isSelected && <span className="check-icon">✓</span>}
        </div>
      );
    }
    
    if (type === 'button') {
      return (
        <button
          key={option.value}
          className={`button-option ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelect(option.value, option.moq)}
        >
          <span className="button-label">{option.label}</span>
          <span className={`moq-badge ${option.moq === 1 ? 'low' : option.moq < 500 ? 'medium' : 'high'}`}>
            {moqLabel}
          </span>
        </button>
      );
    }
    
    // Default radio type
    return (
      <label key={option.value} className={`radio-option ${isSelected ? 'selected' : ''}`}>
        <input
          type="radio"
          name={title}
          value={option.value}
          checked={isSelected}
          onChange={() => onSelect(option.value, option.moq)}
        />
        <div className="radio-content">
          <span className="radio-label">{option.label}</span>
          <span className={`moq-badge ${option.moq === 1 ? 'low' : option.moq < 500 ? 'medium' : 'high'}`}>
            {moqLabel}
          </span>
        </div>
      </label>
    );
  };

  return (
    <div className="moq-option-selector">
      <h4 className="selector-title">{title}</h4>
      <div className={`options-grid ${type}`}>
        {options.map(renderOption)}
      </div>
    </div>
  );
}

export default MOQOptionSelector;
