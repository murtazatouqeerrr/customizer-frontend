import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stage, Layer, Rect, Text, Circle, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import './Customizer.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

function UploadedImage({ src }) {
  const [image] = useImage(src);
  return image ? <KonvaImage image={image} x={80} y={120} width={140} height={140} /> : null;
}

function Customizer({ model, onNext, onSelectionChange, onBack }) {
  const [options, setOptions] = useState([]);
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [customText, setCustomText] = useState('');
  const [addText, setAddText] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [textPosition, setTextPosition] = useState('center');
  const [textOrientation, setTextOrientation] = useState('horizontal');
  const [fontStyle, setFontStyle] = useState('Arial');
  const [additionalCharge, setAdditionalCharge] = useState(0);

  useEffect(() => {
    fetchOptions();
  }, [model.id]);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/options/model/${model.id}`);
      setOptions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching options:', err);
      setLoading(false);
    }
  };

  const handleOptionChange = (optionId, valueId) => {
    const newSelections = { ...selections, [optionId]: valueId };
    setSelections(newSelections);
    updateSelections(newSelections);
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value);
    setQuantity(qty);
  };

  const handleFileUpload = async (e) => {
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
      setUploadedFile(fullUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file');
    }
  };

  const updateSelections = (newSelections) => {
    const selectionsArray = Object.entries(newSelections).map(([optionId, valueId]) => ({
      optionId: parseInt(optionId),
      valueId
    }));
    onSelectionChange(selectionsArray, quantity, uploadedFile, {
      customText: addText ? customText : '',
      textColor,
      textPosition,
      textOrientation,
      fontStyle
    });
  };

  if (loading) return <div>Loading options...</div>;

  const groupedOptions = {};
  options.forEach(opt => {
    if (!groupedOptions[opt.type]) {
      groupedOptions[opt.type] = [];
    }
    groupedOptions[opt.type].push(opt);
  });

  const colorOptions = groupedOptions['color'] || [];
  const selectedColorId = selections[colorOptions[0]?.id];
  const selectedColor = colorOptions.find(o => o.value_id === selectedColorId);
  const candleColor = selectedColor ? selectedColor.value.toLowerCase() : 'white';

  const colorMap = {
    'red': '#FF6B6B',
    'blue': '#4ECDC4',
    'white': '#FFFFFF',
    'cream': '#FFF8DC',
    'ivory': '#FFFFF0'
  };

  const colorSwatches = [
    { name: 'Light Blue', hex: '#ADD8E6' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Purple', hex: '#DDA0DD' },
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Mint', hex: '#98FF98' },
    { name: 'Yellow', hex: '#FFFF99' },
    { name: 'Peach', hex: '#FFCC99' },
    { name: 'Cyan', hex: '#00FFFF' }
  ];

  const fontStyles = ['Arial', 'Handwriting', 'Cursive', 'Monospace', 'Georgia', 'Courier'];
  const textColors = ['#0000FF', '#800080', '#FF0000', '#00FF00', '#00FF00', '#FF6600'];

  return (
    <div className="customizer">
      <div className="customizer-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{model.name}</h2>
      </div>

      <div className="customizer-content">
        <div className="preview-panel">
          <Stage width={300} height={380} className="canvas-stage">
            <Layer>
              <Rect
                x={75}
                y={80}
                width={150}
                height={200}
                fill={colorMap[candleColor] || '#FFFFFF'}
                stroke="#333"
                strokeWidth={2}
                cornerRadius={15}
              />
              <Rect x={145} y={50} width={10} height={40} fill="#333" />
              <Circle x={150} y={40} radius={8} fill="#FFD700" />
              {uploadedFile && <UploadedImage src={uploadedFile} />}
              {addText && (
                <Text
                  x={50}
                  y={textPosition === 'top' ? 100 : textPosition === 'center' ? 180 : 260}
                  width={200}
                  text={customText}
                  fontSize={14}
                  fontFamily={fontStyle}
                  fill={textColor}
                  align="center"
                  rotation={textOrientation === 'vertical' ? 90 : 0}
                />
              )}
            </Layer>
          </Stage>
        </div>

        <div className="options-panel">
          <div className="option-group">
            <h3>Case Color</h3>
            <div className="color-swatches">
              {colorSwatches.map(color => (
                <div
                  key={color.hex}
                  className="swatch"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={addText}
                onChange={(e) => setAddText(e.target.checked)}
              />
              Add Text?
            </label>
          </div>

          {addText && (
            <>
              <div className="option-group">
                <label>Text Type</label>
                <select>
                  <option>Text</option>
                </select>
              </div>

              <div className="option-group">
                <label>Orientation</label>
                <div className="button-group">
                  <button
                    className={textOrientation === 'horizontal' ? 'active' : ''}
                    onClick={() => setTextOrientation('horizontal')}
                  >
                    Horizontal
                  </button>
                  <button
                    className={textOrientation === 'vertical' ? 'active' : ''}
                    onClick={() => setTextOrientation('vertical')}
                  >
                    Vertical
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label>Text Position</label>
                <select value={textPosition} onChange={(e) => setTextPosition(e.target.value)}>
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div className="option-group">
                <label>Your Text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={50}
                  placeholder="Enter your text"
                />
                <small>{customText.length}/50 characters</small>
              </div>

              <div className="option-group">
                <label>Font Style</label>
                <div className="font-styles">
                  {fontStyles.map(font => (
                    <button
                      key={font}
                      className={fontStyle === font ? 'active' : ''}
                      onClick={() => setFontStyle(font)}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Text Color</label>
                <div className="color-swatches">
                  {textColors.map(color => (
                    <div
                      key={color}
                      className={`swatch ${textColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="option-group">
            <label>Additional Charge: ${additionalCharge.toFixed(2)}</label>
          </div>

          <div className="option-group">
            <label>Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <button className="next-btn" onClick={onNext}>Continue to Preview →</button>
        </div>
      </div>
    </div>
  );
}

export default Customizer;
