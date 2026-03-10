import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ElementConfig.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

function ElementConfig({ element, onUpdate, onPreviewUpdate }) {
  const [config, setConfig] = useState(element.config || {});
  const [options, setOptions] = useState(element.options && element.options.length > 0 ? element.options : []);
  const [newOption, setNewOption] = useState({ label: '', value: '', color_hex: '#000000' });
  const [textValue, setTextValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (element.options) {
      setOptions(element.options.filter(o => o.id !== null));
    }
  }, [element.id, element.options]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(element.id, { config: newConfig });
    onPreviewUpdate(element.id, { config: newConfig, textValue, uploadedImage });
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setTextValue(text);
    onPreviewUpdate(element.id, { config, textValue: text, uploadedImage });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const baseUrl = API_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${response.data.url}`;
      setUploadedImage(fullUrl);
      onPreviewUpdate(element.id, { config, textValue, uploadedImage: fullUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    }
  };

  const handleAddOption = async () => {
    if (element.type === 'color-choices') {
      if (!newOption.label || !newOption.color_hex) {
        alert('Please fill in label and pick a color');
        return;
      }
    } else {
      if (!newOption.label || !newOption.value) {
        alert('Please fill in label and value');
        return;
      }
    }

    try {
      const response = await axios.post(`${API_URL}/elements/${element.id}/options`, newOption);
      setOptions([...options, response.data]);
      setNewOption({ label: '', value: '', color_hex: '#000000' });
    } catch (err) {
      console.error('Error adding option:', err);
      alert('Error adding option');
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await axios.delete(`${API_URL}/elements/option/${optionId}`);
      setOptions(options.filter(o => o.id !== optionId));
    } catch (err) {
      console.error('Error deleting option:', err);
      alert('Error deleting option');
    }
  };

  return (
    <div className="element-config">
      <h3>{element.name}</h3>
      <p className="element-type">Type: {element.type}</p>

      {/* Common Config */}
      <div className="config-section">
        <h4>Configuration</h4>

        {(element.type === 'text' || element.type === 'textarea' || element.type === 'text-placeholder') && (
          <>
            <div className="config-item">
              <label>Enter Text</label>
              {element.type === 'textarea' ? (
                <textarea
                  value={textValue}
                  onChange={handleTextChange}
                  placeholder="Type text to display"
                  rows="4"
                />
              ) : (
                <input
                  type="text"
                  value={textValue}
                  onChange={handleTextChange}
                  placeholder="Type text to display"
                />
              )}
            </div>
            <div className="config-item">
              <label>Placeholder Text</label>
              <input
                type="text"
                value={config.placeholder || ''}
                onChange={(e) => handleConfigChange('placeholder', e.target.value)}
              />
            </div>
            <div className="config-item">
              <label>Font Style</label>
              <select value={config.fontStyle || 'Arial'} onChange={(e) => handleConfigChange('fontStyle', e.target.value)}>
                <option>Arial</option>
                <option>Georgia</option>
                <option>Courier</option>
                <option>Handwriting</option>
              </select>
            </div>
            <div className="config-item">
              <label>Font Size</label>
              <input
                type="number"
                value={config.fontSize || 14}
                onChange={(e) => handleConfigChange('fontSize', parseInt(e.target.value))}
              />
            </div>
            <div className="config-item">
              <label>Text Color</label>
              <input
                type="color"
                value={config.textColor || '#000000'}
                onChange={(e) => handleConfigChange('textColor', e.target.value)}
              />
            </div>
            <div className="config-item">
              <label>Max Characters</label>
              <input
                type="number"
                value={config.maxChars || 50}
                onChange={(e) => handleConfigChange('maxChars', parseInt(e.target.value))}
              />
            </div>
          </>
        )}

        {element.type === 'upload' && (
          <>
            <div className="config-item">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImage && <p className="upload-success">✓ Image uploaded</p>}
            </div>
            <div className="config-item">
              <label>Image Size (Width)</label>
              <input
                type="number"
                value={config.imageWidth || 100}
                onChange={(e) => handleConfigChange('imageWidth', parseInt(e.target.value))}
              />
            </div>
            <div className="config-item">
              <label>File Size Limit (MB)</label>
              <input
                type="number"
                value={config.fileSizeLimit || 5}
                onChange={(e) => handleConfigChange('fileSizeLimit', parseInt(e.target.value))}
              />
            </div>
            <div className="config-item">
              <label>Allowed Formats</label>
              <input
                type="text"
                value={config.allowedFormats || 'jpg,png,gif'}
                onChange={(e) => handleConfigChange('allowedFormats', e.target.value)}
              />
            </div>
          </>
        )}

        {element.type === 'dropdown' && (
          <div className="config-item">
            <label>Dropdown Label</label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => handleConfigChange('label', e.target.value)}
            />
          </div>
        )}

        {element.type === 'checkbox' && (
          <div className="config-item">
            <label>Checkbox Label</label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => handleConfigChange('label', e.target.value)}
            />
          </div>
        )}

        {element.type === 'color-choices' && (
          <>
            <div className="config-item">
              <label>Display Style</label>
              <select value={config.displayStyle || 'grid'} onChange={(e) => handleConfigChange('displayStyle', e.target.value)}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
            <div className="config-item">
              <label>Select Color to Preview</label>
              {options && options.length > 0 ? (
                <div className="color-preview-grid">
                  {options.map(opt => (
                    <div
                      key={opt.id}
                      className="color-preview-swatch"
                      style={{ backgroundColor: opt.color_hex || '#000000' }}
                      onClick={() => {
                        handleConfigChange('selectedColor', opt.color_hex);
                        onPreviewUpdate(element.id, { config, textValue, uploadedImage, selectedColor: opt.color_hex });
                      }}
                      title={opt.label}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', fontSize: '0.85rem' }}>Add colors in options below</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Box Customization Controls - Show for elements that need positioning */}
      {['customization-box', 'text', 'textarea', 'text-placeholder', 'upload', 'image-placeholder', 'color-choices', 'image-choices'].includes(element.type) && (
        <div className="config-section">
          <h4>Box Settings</h4>
          <div className="config-item">
            <label>Shape</label>
            <select value={config.boxShape || 'rectangle'} onChange={(e) => handleConfigChange('boxShape', e.target.value)}>
              <option value="rectangle">Rectangle</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          <div className="config-item">
            <label>Box X Position</label>
            <input
              type="number"
              value={config.boxX || 50}
              onChange={(e) => handleConfigChange('boxX', parseInt(e.target.value))}
            />
          </div>
          <div className="config-item">
            <label>Box Y Position</label>
            <input
              type="number"
              value={config.boxY || 50}
              onChange={(e) => handleConfigChange('boxY', parseInt(e.target.value))}
            />
          </div>
          <div className="config-item">
            <label>Box Width</label>
            <input
              type="number"
              value={config.boxWidth || 200}
              onChange={(e) => handleConfigChange('boxWidth', parseInt(e.target.value))}
            />
          </div>
          <div className="config-item">
            <label>Height</label>
            <input
              type="number"
              value={config.boxHeight || 200}
              onChange={(e) => handleConfigChange('boxHeight', parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Options Management */}
      {(element.type === 'dropdown' || element.type === 'color-choices' || element.type === 'image-choices') && (
        <div className="options-section">
          <h4>Options</h4>

          <div className="options-list">
            {options && options.length > 0 && options.map(opt => (
              <div key={opt.id} className="option-item">
                <span>{opt.label || opt.value}</span>
                <button onClick={() => handleDeleteOption(opt.id)} className="delete-btn">✕</button>
              </div>
            ))}
          </div>

          <div className="add-option">
            <input
              type="text"
              placeholder="Label (e.g., Red)"
              value={newOption.label}
              onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
            />
            <input
              type="text"
              placeholder="Value"
              value={newOption.value}
              onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
            />
            {element.type === 'color-choices' && (
              <>
                <div className="color-picker-wrapper">
                  <label>Pick Color:</label>
                  <input
                    type="color"
                    value={newOption.color_hex}
                    onChange={(e) => setNewOption({ ...newOption, color_hex: e.target.value })}
                  />
                  <span className="color-hex-display">{newOption.color_hex}</span>
                  <button onClick={handleAddOption} className="add-color-btn" title="Add this color">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </>
            )}
            <button onClick={handleAddOption} className="add-option-btn">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElementConfig;
