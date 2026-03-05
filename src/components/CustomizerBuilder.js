import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Stage, Layer, Rect, Text, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import ElementManager from './ElementManager';
import ElementConfig from './ElementConfig';
import GlowingEffect from './GlowingEffect';
import MOQValidator from './MOQValidator';
import { SCENTED_CANDLES, calculateTotalMOQ } from '../data/productData';
import './CustomizerBuilder.css';

const API_URL = 'https://cusstomizer-backend-production.up.railway.app/api';

function CanvasImage({ src, x = 0, y = 0, width = 350, height = 450 }) {
  const [image] = useImage(src);
  return image ? <KonvaImage image={image} x={x} y={y} width={width} height={height} /> : null;
}

function CustomizerBuilder({ model, onNext, onBack }) {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showAddElement, setShowAddElement] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [elementPreview, setElementPreview] = useState({});
  const [baseImage, setBaseImage] = useState(model.image_url || null);
  const [expandedSections, setExpandedSections] = useState({});
  const [livePreview, setLivePreview] = useState(true);
  const [userSelections, setUserSelections] = useState({});
  const [currentMOQ, setCurrentMOQ] = useState(1);
  const transformerRef = useRef(null);
  const boxRef = useRef(null);

  // Find product data from catalog
  const productData = SCENTED_CANDLES.find(p => p.id === model.product_code || p.name === model.name);

  useEffect(() => {
    // Calculate MOQ whenever selections change
    if (productData && productData.moq) {
      const calculatedMOQ = calculateTotalMOQ(productData.id, userSelections);
      setCurrentMOQ(calculatedMOQ);

      // Adjust quantity if it's below MOQ
      if (quantity < calculatedMOQ) {
        setQuantity(calculatedMOQ);
      }
    }
  }, [userSelections, productData]);

  useEffect(() => {
    fetchElements();
  }, [model.id]);

  useEffect(() => {
    // Load saved custom elements from localStorage after elements are fetched
    if (elements.length > 0) {
      const saved = localStorage.getItem(`customizer_${model.id}`);
      if (saved) {
        try {
          const savedElements = JSON.parse(saved);
          // Only add if not already in elements
          const newElements = savedElements.filter(saved =>
            !elements.find(e => e.id === saved.id)
          );
          if (newElements.length > 0) {
            setElements(prev => [...prev, ...newElements]);
          }
        } catch (err) {
          console.error('Error loading saved elements:', err);
        }
      }
    }
  }, [elements.length]);

  useEffect(() => {
    if (selectedElement?.type === 'customization-box' && boxRef.current && transformerRef.current) {
      transformerRef.current.nodes([boxRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElement]);

  const fetchElements = async () => {
    try {
      const response = await axios.get(`${API_URL}/elements/model/${model.id}`);
      setElements(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching elements:', err);
      setLoading(false);
    }
  };

  const handleAddElement = async (elementData) => {
    try {
      const response = await axios.post(`${API_URL}/elements`, {
        modelId: model.id,
        ...elementData
      });
      setElements([...elements, response.data]);
      setShowAddElement(false);
    } catch (err) {
      console.error('Error adding element:', err);
      alert('Error adding element');
    }
  };

  const handleUpdateElement = async (elementId, updates) => {
    try {
      await axios.put(`${API_URL}/elements/${elementId}`, updates);
      // Update local state without waiting for response
      setElements(elements.map(e =>
        e.id === elementId ? { ...e, ...updates } : e
      ));
      setSelectedElement(prev => prev?.id === elementId ? { ...prev, ...updates } : prev);
    } catch (err) {
      console.error('Error updating element:', err);
    }
  };

  const handlePreviewUpdate = (elementId, previewData) => {
    setElementPreview(prev => ({
      ...prev,
      [elementId]: previewData
    }));

    // Track user selections for MOQ calculation
    if (previewData.selectedOption) {
      setUserSelections(prev => ({
        ...prev,
        [elementId]: previewData.selectedOption
      }));
    }
  };

  const handleDeleteElement = async (elementId) => {
    try {
      await axios.delete(`${API_URL}/elements/${elementId}`);
      setElements(elements.filter(e => e.id !== elementId));
      setSelectedElement(null);
    } catch (err) {
      console.error('Error deleting element:', err);
      alert('Error deleting element');
    }
  };

  const handleSaveAll = async () => {
    try {
      console.log('Saving elements:', elements);

      // Save to localStorage for custom models
      const customElements = elements.filter(e => {
        const isCustom = e.id.toString().length > 10;
        console.log(`Element ${e.id}: isCustom=${isCustom}`);
        return isCustom;
      });

      console.log('Custom elements to save:', customElements);

      if (customElements.length > 0) {
        localStorage.setItem(`customizer_${model.id}`, JSON.stringify(customElements));
        console.log('Saved to localStorage:', `customizer_${model.id}`);
      }

      // Save numeric IDs to database
      for (const element of elements) {
        if (/^\d+$/.test(element.id.toString())) {
          await axios.put(`${API_URL}/elements/${element.id}`, { config: element.config });
        }
      }
      alert('All changes saved successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving changes');
    }
  };

  const handleAddCustomizationBox = () => {
    const newBox = {
      id: Date.now(),
      model_id: model.id,
      name: 'Customization Box',
      type: 'customization-box',
      config: {
        boxShape: 'rectangle',
        boxX: 50,
        boxY: 50,
        boxWidth: 200,
        boxHeight: 200
      },
      options: []
    };
    setElements([...elements, newBox]);
    setSelectedElement(newBox);
  };

  if (loading) return <div>Loading...</div>;

  const preview = selectedElement ? elementPreview[selectedElement.id] : null;

  const getBoxColor = () => {
    // Find color-choices element and get its selected color from config
    const colorElement = elements.find(e => e.type === 'color-choices');
    if (colorElement && colorElement.config?.selectedColor) {
      return colorElement.config.selectedColor;
    }
    return 'rgba(255,255,255,0.1)';
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="customizer-builder">
      <div className="builder-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="header-status">Active</span>
          <button className="header-menu">⋯</button>
        </div>
        <div className="header-center">
          <span>Live Preview</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={livePreview}
              onChange={(e) => setLivePreview(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <button className="header-menu">⋯</button>
        </div>
        <div className="header-right">
          <button className="settings-btn" onClick={handleSaveAll}>
            ⚙️ General settings
          </button>
        </div>
      </div>

      <div className="builder-content">
        {/* Left Panel - Accordion Sections */}
        <div className="left-panel" style={{ position: 'relative' }}>
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <div className="view-selector">
            <select className="view-dropdown">
              <option>🔍 Main View</option>
            </select>
            <button className="edit-view-btn">✏️</button>
          </div>

          <button
            className="add-element-btn"
            onClick={handleAddCustomizationBox}
            style={{ background: '#28a745', marginBottom: '0' }}
            title="Add customization box overlay"
          >
            <i className="fas fa-square"></i> Add Box
          </button>
          <button
            className="add-element-btn"
            onClick={() => setShowAddElement(!showAddElement)}
          >
            + Add Element
          </button>

          {showAddElement && (
            <div className="element-manager-overlay">
              <ElementManager onAdd={handleAddElement} onCancel={() => setShowAddElement(false)} />
            </div>
          )}

          <div className="accordion-sections">
            {elements.map((element, index) => (
              <div key={element.id} className="accordion-section">
                <div
                  className="accordion-header"
                  onClick={() => toggleSection(index)}
                >
                  <div className="accordion-title">
                    <span className="section-icon">{element.type === 'color-choices' ? '🎨' : element.type === 'text' || element.type === 'textarea' ? '✏️' : element.type === 'upload' ? '📁' : element.type === 'dropdown' ? '🕯️' : element.type === 'number' ? '📦' : '⚙️'}</span>
                    <span className="section-label">{element.name}</span>
                  </div>
                  <div className="accordion-controls">
                    <span className="section-number">{index + 1}</span>
                    <span className="accordion-arrow">{expandedSections[index] ? '▼' : '▶'}</span>
                  </div>
                </div>
                {expandedSections[index] && (
                  <div className="accordion-content">
                    <div
                      className={`element-item ${selectedElement?.id === element.id ? 'active' : ''}`}
                      onClick={() => setSelectedElement(element)}
                    >
                      <div className="element-info">
                        <span className="element-name">{element.name}</span>
                        <span className="element-type">{element.type}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this element?')) {
                            handleDeleteElement(element.id);
                          }
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Canvas Preview */}
        <div className="center-panel" style={{ position: 'relative' }}>
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <Stage width={350} height={500} className="canvas-stage">
            <Layer>
              <Rect x={0} y={0} width={350} height={500} fill="#f9f9f9" />

              {/* Base product image or default candle */}
              {baseImage ? (
                <>
                  <CanvasImage src={baseImage} />

                  {/* Customization box overlay */}
                  {elements.map(element => {
                    if (element.type !== 'customization-box' || !element.config) return null;

                    const boxX = element.config.boxX || 50;
                    const boxY = element.config.boxY || 50;
                    const boxWidth = element.config.boxWidth || 200;
                    const boxHeight = element.config.boxShape === 'square' ? boxWidth : (element.config.boxHeight || 200);

                    return (
                      <React.Fragment key={element.id}>
                        <Rect
                          ref={selectedElement?.id === element.id ? boxRef : null}
                          x={boxX}
                          y={boxY}
                          width={boxWidth}
                          height={boxHeight}
                          fill={getBoxColor()}
                          stroke={selectedElement?.id === element.id ? '#667eea' : '#333'}
                          strokeWidth={selectedElement?.id === element.id ? 3 : 2}
                          draggable
                          onClick={() => setSelectedElement(element)}
                          onDragEnd={(e) => {
                            const newConfig = {
                              ...element.config,
                              boxX: Math.round(e.target.x()),
                              boxY: Math.round(e.target.y())
                            };
                            const updatedElement = { ...element, config: newConfig };
                            setElements(elements.map(el => el.id === element.id ? updatedElement : el));
                            handleUpdateElement(element.id, { config: newConfig });
                          }}
                          onTransformEnd={(e) => {
                            const node = e.target;
                            const newWidth = Math.round(node.width() * node.scaleX());
                            const newHeight = Math.round(node.height() * node.scaleY());

                            const newConfig = {
                              ...element.config,
                              boxX: Math.round(node.x()),
                              boxY: Math.round(node.y()),
                              boxWidth: newWidth,
                              boxHeight: newHeight
                            };

                            node.scaleX(1);
                            node.scaleY(1);
                            node.width(newWidth);
                            node.height(newHeight);

                            const updatedElement = { ...element, config: newConfig };
                            setElements(elements.map(el => el.id === element.id ? updatedElement : el));
                            handleUpdateElement(element.id, { config: newConfig });
                          }}
                        />
                        {selectedElement?.id === element.id && <Transformer ref={transformerRef} />}
                      </React.Fragment>
                    );
                  })}

                  {/* Text inside box */}
                  {elements.map(element => {
                    const boxElement = elements.find(e => e.type === 'customization-box');
                    if ((element.type === 'text' || element.type === 'textarea' || element.type === 'text-placeholder') && boxElement && elementPreview[element.id]?.textValue) {
                      return (
                        <Text
                          key={`text-${element.id}`}
                          x={boxElement.config.boxX || 50}
                          y={boxElement.config.boxY || 50}
                          width={boxElement.config.boxWidth || 200}
                          height={boxElement.config.boxShape === 'square' ? (boxElement.config.boxWidth || 200) : (boxElement.config.boxHeight || 200)}
                          text={elementPreview[element.id].textValue}
                          fontSize={element.config.fontSize || 14}
                          fontFamily={element.config.fontStyle || 'Arial'}
                          fill={element.config.textColor || '#000000'}
                          align="center"
                          verticalAlign="middle"
                          pointerEvents="none"
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Image inside box */}
                  {elements.map(element => {
                    const boxElement = elements.find(e => e.type === 'customization-box');
                    if ((element.type === 'upload' || element.type === 'image-placeholder') && boxElement && elementPreview[element.id]?.uploadedImage) {
                      return (
                        <CanvasImage
                          key={`image-${element.id}`}
                          src={elementPreview[element.id].uploadedImage}
                          x={boxElement.config.boxX || 50}
                          y={boxElement.config.boxY || 50}
                          width={boxElement.config.boxWidth || 200}
                          height={boxElement.config.boxShape === 'square' ? (boxElement.config.boxWidth || 200) : (boxElement.config.boxHeight || 200)}
                        />
                      );
                    }
                    return null;
                  })}
                </>
              ) : (
                <>
                  <Rect
                    x={50}
                    y={80}
                    width={250}
                    height={250}
                    fill={preview && preview.selectedColor ? preview.selectedColor : '#4ECDC4'}
                    stroke="#333"
                    strokeWidth={2}
                    cornerRadius={15}
                  />
                  <Rect x={165} y={50} width={20} height={40} fill="#333" />
                  <Circle x={175} y={40} radius={10} fill="#FFD700" />
                </>
              )}

              {/* Render text if selected element is text type (for default candle) */}
              {!baseImage && preview && (preview.textValue || preview.config?.placeholder) && (
                <Text
                  x={50}
                  y={200}
                  width={250}
                  text={preview.textValue || preview.config?.placeholder}
                  fontSize={preview.config?.fontSize || 14}
                  fontFamily={preview.config?.fontStyle || 'Arial'}
                  fill={preview.config?.textColor || '#000000'}
                  align="center"
                />
              )}

              {/* Render image if selected element is upload type (for default candle) */}
              {!baseImage && preview && preview.uploadedImage && (
                <CanvasImage src={preview.uploadedImage} />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Right Panel - Product Details & Configuration */}
        <div className="right-panel" style={{ position: 'relative' }}>
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <div className="product-header">
            <h3 className="product-title">{model.name}</h3>
            <div className="product-price">Rs. {model.price || '20.00'}</div>
          </div>

          <div className="product-details">
            {productData && productData.moq && (
              <MOQValidator
                currentMOQ={currentMOQ}
                selectedQuantity={quantity}
                onQuantityChange={setQuantity}
                productName={model.name}
              />
            )}

            {selectedElement ? (
              <ElementConfig
                element={selectedElement}
                onUpdate={handleUpdateElement}
                onPreviewUpdate={handlePreviewUpdate}
                productData={productData}
              />
            ) : (
              <div className="empty-config">
                <p>Select an element to configure</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="builder-footer">
        <div className="quantity-section">
          <label>Quantity:</label>
          <input
            type="number"
            min={currentMOQ}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || currentMOQ;
              setQuantity(Math.max(currentMOQ, val));
            }}
          />
          {currentMOQ > 1 && (
            <span className="moq-hint">Min: {currentMOQ}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {quantity < currentMOQ && (
            <span className="moq-error">⚠️ Quantity below MOQ</span>
          )}
          <button className="next-btn" onClick={handleSaveAll} style={{ background: '#10b981' }}>
            💾 Save
          </button>
          <button
            className="next-btn"
            onClick={() => {
              if (quantity < currentMOQ) {
                alert(`Minimum order quantity is ${currentMOQ} pieces. Please increase your quantity.`);
                return;
              }

              const boxElement = elements.find(e => e.type === 'customization-box');
              const textElement = elements.find(e => e.type === 'text');
              const colorElement = elements.find(e => e.type === 'color-choices');

              const selections = {
                boxConfig: boxElement?.config,
                textValue: textElement && elementPreview[textElement.id]?.textValue,
                textConfig: textElement?.config,
                selectedColor: colorElement?.config?.selectedColor,
                userSelections,
                moq: currentMOQ
              };

              onNext(selections, quantity);
            }}
            disabled={quantity < currentMOQ}
            style={{ opacity: quantity < currentMOQ ? 0.5 : 1 }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizerBuilder;
