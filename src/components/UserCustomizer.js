import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import './UserCustomizer.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

const CanvasBackground = ({ src }) => {
    const [image] = useImage(src, 'anonymous');
    return image ? <KonvaImage image={image} x={0} y={0} width={350} height={420} /> : null;
};

const CanvasImg = ({ src, x, y, width, height }) => {
    const [image] = useImage(src, 'anonymous');
    return image ? <KonvaImage image={image} x={x} y={y} width={width} height={height} /> : null;
};

function UserCustomizer({ product, onBack }) {
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userSelections, setUserSelections] = useState({});   // color/image/dropdown selections
    const [textValues, setTextValues] = useState({});           // text inputs
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const fileInputRefs = useRef({});

    useEffect(() => {
        axios.get(`${API_URL}/elements/model/${product.id}/enabled`)
            .then(res => {
                setElements(res.data);
                // default all sections open
                const expanded = {};
                res.data.forEach(el => { expanded[el.id] = true; });
                setExpandedSections(expanded);
            })
            .catch(err => console.error('Error fetching enabled elements:', err))
            .finally(() => setLoading(false));
    }, [product.id]);

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleTextChange = (id, value) => {
        setTextValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSelect = (id, value) => {
        setUserSelections(prev => ({ ...prev, [id]: value }));
    };

    const handleUpload = async (elementId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const baseUrl = API_URL.replace('/api', '');
            const fullUrl = `${baseUrl}${res.data.url}`;
            handleSelect(elementId, fullUrl);
        } catch (err) {
            alert('Error uploading file. Please try again.');
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const orderNumber = `ORD-${Date.now()}`;
            const totalPrice = parseFloat(product.base_price || 0) * quantity;

            await axios.post(`${API_URL}/orders`, {
                order_number: orderNumber,
                model_id: product.id,
                quantity,
                total_price: totalPrice,
                order_data: {
                    product: { id: product.id, name: product.name },
                    userSelections,
                    textValues,
                    elements: elements.map(e => ({ id: e.id, type: e.type, name: e.name }))
                }
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Order error:', err);
            alert('Error placing order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="user-customizer">
                <div className="order-success">
                    <div className="success-icon"><i className="fas fa-party-horn"></i></div>
                    <h2>Order Placed!</h2>
                    <p>Thank you for your order. We'll get started on your custom product right away.</p>
                    <button className="back-home-btn" onClick={onBack}>← Back to Products</button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-customizer">
            {/* Top bar */}
            <div className="uc-top-bar">
                <button className="uc-back-btn" onClick={onBack}>← Back</button>
                <h2 className="uc-product-name">{product.name}</h2>
                <div className="uc-price">$ {parseFloat(product.base_price || 0).toFixed(2)} / unit</div>
            </div>

            {loading ? (
                <div className="uc-loading">
                    <div className="loading-dots"><span /><span /><span /></div>
                    <p>Loading customization options...</p>
                </div>
            ) : (
                <div className="uc-body">
                    {/* Left: Canvas Preview */}
                    <div className="uc-preview-panel">
                        <div className="uc-preview-label">Live Preview</div>
                        <div className="uc-canvas-wrap">
                            <Stage width={350} height={420}>
                                <Layer>
                                    {/* Background */}
                                    {product.image_url && <CanvasBackground src={product.image_url} />}
                                    {!product.image_url && (
                                        <Rect x={0} y={0} width={350} height={420} fill="#f5f5f5" />
                                    )}

                                    {/* Render each enabled element */}
                                    {elements.map(el => {
                                        if (!el.config) return null;
                                        const x = el.config.boxX || 50;
                                        const y = el.config.boxY || 50;
                                        const w = el.config.boxWidth || 150;
                                        const h = el.config.boxShape === 'square' ? w : (el.config.boxHeight || 50);

                                        if (el.type === 'color-choices') {
                                            const selVal = userSelections[el.id];
                                            const opt = (el.options || []).find(o => o.value === selVal);
                                            if (opt?.color_hex) {
                                                return (
                                                    <Rect
                                                        key={el.id}
                                                        x={x} y={y} width={w} height={h}
                                                        fill={opt.color_hex}
                                                        opacity={0.6}
                                                        cornerRadius={el.config.boxShape === 'circle' ? w / 2 : 0}
                                                        listening={false}
                                                    />
                                                );
                                            }
                                        }

                                        if (el.type === 'text' || el.type === 'textarea') {
                                            const txt = textValues[el.id];
                                            if (txt) {
                                                return (
                                                    <Text
                                                        key={el.id}
                                                        x={x} y={y} width={w} height={h}
                                                        text={txt}
                                                        fontSize={el.config.fontSize || 16}
                                                        fontFamily={el.config.fontStyle || 'Arial'}
                                                        fill={el.config.textColor || '#000000'}
                                                        align="center"
                                                        verticalAlign="middle"
                                                        listening={false}
                                                    />
                                                );
                                            }
                                        }

                                        if (el.type === 'upload' || el.type === 'image-choices') {
                                            const imgUrl = userSelections[el.id];
                                            if (imgUrl) {
                                                return (
                                                    <CanvasImg
                                                        key={el.id}
                                                        src={imgUrl}
                                                        x={x} y={y} width={w} height={h}
                                                    />
                                                );
                                            }
                                        }

                                        return null;
                                    })}

                                    {/* Product name at bottom */}
                                    <Text
                                        x={0} y={395} width={350}
                                        text={product.name}
                                        fontSize={13} fontFamily="Arial"
                                        fill="#aaa" align="center"
                                        listening={false}
                                    />
                                </Layer>
                            </Stage>
                        </div>
                        <p className="uc-preview-hint">Preview updates as you make selections</p>
                    </div>

                    {/* Right: Options */}
                    <div className="uc-options-panel">
                        {elements.length === 0 ? (
                            <div className="uc-no-elements">
                                <span><i className="fas fa-palette"></i></span>
                                <p>No customization options configured for this product yet.</p>
                            </div>
                        ) : (
                            elements.map(el => (
                                <div key={el.id} className="uc-section">
                                    <div className="uc-section-header" onClick={() => toggleSection(el.id)}>
                                        <div className="uc-section-title">
                                            <span className="uc-section-icon">
                                                {el.type === 'color-choices' ? '<i className="fas fa-palette"></i>' : el.type === 'upload' ? '☁️' : el.type === 'text' || el.type === 'textarea' ? '✏️' : el.type === 'image-choices' ? '🖼️' : '<i className="fas fa-cog"></i>'}
                                            </span>
                                            {el.name || el.type}
                                        </div>
                                        <span className="uc-section-arrow">{expandedSections[el.id] ? '▼' : '▶'}</span>
                                    </div>

                                    {expandedSections[el.id] && (
                                        <div className="uc-section-body">
                                            {/* COLOR CHOICES */}
                                            {el.type === 'color-choices' && (
                                                <div className="uc-colors">
                                                    {(el.options || []).length === 0 ? (
                                                        <p className="uc-no-opts">No colors configured</p>
                                                    ) : (
                                                        (el.options || []).map(opt => (
                                                            <div
                                                                key={opt.id}
                                                                className={`uc-color-swatch ${userSelections[el.id] === opt.value ? 'selected' : ''}`}
                                                                style={{ backgroundColor: opt.color_hex }}
                                                                onClick={() => handleSelect(el.id, opt.value)}
                                                                title={opt.label}
                                                            >
                                                                {userSelections[el.id] === opt.value && <span className="swatch-check">✓</span>}
                                                                <span className="swatch-name">{opt.label}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {/* TEXT */}
                                            {(el.type === 'text' || el.type === 'textarea') && (
                                                <div className="uc-text-group">
                                                    {el.type === 'textarea' ? (
                                                        <textarea
                                                            className="uc-text-input"
                                                            placeholder={el.config?.placeholder || 'Enter your text...'}
                                                            value={textValues[el.id] || ''}
                                                            onChange={e => handleTextChange(el.id, e.target.value)}
                                                            maxLength={el.config?.maxChars || 200}
                                                            rows={4}
                                                        />
                                                    ) : (
                                                        <input
                                                            className="uc-text-input"
                                                            type="text"
                                                            placeholder={el.config?.placeholder || 'Enter your text...'}
                                                            value={textValues[el.id] || ''}
                                                            onChange={e => handleTextChange(el.id, e.target.value)}
                                                            maxLength={el.config?.maxChars || 100}
                                                        />
                                                    )}
                                                    {el.config?.maxChars && (
                                                        <span className="uc-char-count">
                                                            {(textValues[el.id] || '').length} / {el.config.maxChars}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* UPLOAD */}
                                            {el.type === 'upload' && (
                                                <div className="uc-upload">
                                                    <input
                                                        ref={r => { fileInputRefs.current[el.id] = r; }}
                                                        type="file"
                                                        accept={el.config?.allowedFormats ? el.config.allowedFormats.split(',').map(f => `image/${f.trim()}`).join(',') : 'image/*'}
                                                        style={{ display: 'none' }}
                                                        onChange={e => handleUpload(el.id, e)}
                                                    />
                                                    {userSelections[el.id] ? (
                                                        <div className="uc-uploaded-preview">
                                                            <img src={userSelections[el.id]} alt="Uploaded" />
                                                            <button
                                                                className="uc-remove-upload"
                                                                onClick={() => handleSelect(el.id, null)}
                                                            >
                                                                ✕ Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="uc-upload-area"
                                                            onClick={() => fileInputRefs.current[el.id]?.click()}
                                                        >
                                                            <span className="uc-upload-icon">☁️</span>
                                                            <p>Click to upload {el.name}</p>
                                                            <small>Max {el.config?.fileSizeLimit || 5}MB</small>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* IMAGE CHOICES / DROPDOWN */}
                                            {(el.type === 'image-choices' || el.type === 'dropdown') && (
                                                <div className="uc-option-chips">
                                                    {(el.options || []).length === 0 ? (
                                                        <p className="uc-no-opts">No options configured</p>
                                                    ) : (
                                                        (el.options || []).map(opt => (
                                                            <div
                                                                key={opt.id}
                                                                className={`uc-chip ${userSelections[el.id] === opt.value ? 'selected' : ''}`}
                                                                onClick={() => handleSelect(el.id, opt.value)}
                                                            >
                                                                {opt.image_url && (
                                                                    <img src={opt.image_url} alt={opt.label} className="chip-img" />
                                                                )}
                                                                <span>{opt.label}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Quantity + Submit */}
                        <div className="uc-order-section">
                            <div className="uc-qty-row">
                                <label>Quantity</label>
                                <div className="uc-qty-controls">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                </div>
                            </div>

                            <div className="uc-total">
                                <span>Total:</span>
                                <span className="uc-total-price">
                                    Rs. {(parseFloat(product.base_price || 0) * quantity).toFixed(2)}
                                </span>
                            </div>

                            <button
                                className="uc-submit-btn"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Placing Order...' : '<i className="fas fa-store"></i> Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserCustomizer;
