import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ElementManager.css';

const ELEMENT_TYPES = [
  { id: 'text', label: 'Text (Single Line)', icon: 'fa-font' },
  { id: 'textarea', label: 'Text Area (Multi-line)', icon: 'fa-align-left' },
  { id: 'text-placeholder', label: 'Text Placeholder', icon: 'fa-pen' },
  { id: 'upload', label: 'Upload Image', icon: 'fa-cloud-arrow-up' },
  { id: 'image-choices', label: 'Image Choices', icon: 'fa-images' },
  { id: 'image-placeholder', label: 'Image Placeholder', icon: 'fa-image' },
  { id: 'color-choices', label: 'Color Choices', icon: 'fa-palette' },
  { id: 'dropdown', label: 'Dropdown', icon: 'fa-list' },
  { id: 'checkbox', label: 'Checkbox', icon: 'fa-square-check' },
  { id: 'customization-box', label: 'Customization Box', icon: 'fa-square' }
];

function ElementManager({ onAdd, onCancel }) {
  const [selectedType, setSelectedType] = useState(null);
  const [elementName, setElementName] = useState('');

  const handleAdd = () => {
    if (!elementName || !selectedType) {
      alert('Please enter element name and select type');
      return;
    }

    onAdd({
      name: elementName,
      type: selectedType,
      config: {}
    });

    setElementName('');
    setSelectedType(null);
  };

  return (
    <div className="element-manager">
      <h4>Add New Element</h4>

      <div className="form-group">
        <label>Element Name</label>
        <input
          type="text"
          value={elementName}
          onChange={(e) => setElementName(e.target.value)}
          placeholder="e.g., Main Color"
        />
      </div>

      <div className="form-group">
        <label>Element Type</label>
        <div className="type-grid">
          {ELEMENT_TYPES.map(type => (
            <button
              key={type.id}
              className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
              title={type.label}
            >
              <i className={`fas ${type.icon}`}></i>
              <span className="label">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="button-group">
        <button className="add-btn" onClick={handleAdd}>Add Element</button>
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ElementManager;
