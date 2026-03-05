import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
// productData imports removed to fix build warnings
import './ProductConfigurator.css';

const API_URL = 'https://cusstomizer-backend-production.up.railway.app/api';

// --- Konva Draggable/Resizable Components ---

const TransformableRect = ({ shapeProps, isSelected, onSelect, onChange, fill }) => {
    const shapeRef = React.useRef();
    const trRef = React.useRef();

    React.useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Rect
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                fill={fill}
                opacity={0.25}
                cornerRadius={10}
                draggable
                dragBoundFunc={(pos) => {
                    // Restrict movement to [75, 32] -> [275, 330] area
                    const bounds = { x: 75, y: 32, w: 200, h: 298 };
                    const node = shapeRef.current;
                    if (!node) return pos;
                    const scaleX = node.scaleX() || 1;
                    const scaleY = node.scaleY() || 1;
                    const width = node.width() * scaleX;
                    const height = node.height() * scaleY;

                    return {
                        x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
                        y: Math.max(bounds.y, Math.min(bounds.y + bounds.h - height, pos.y)),
                    };
                }}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

const TransformableText = ({ shapeProps, isSelected, onSelect, onChange, text, fontSize, fontFamily, fontColor }) => {
    const shapeRef = React.useRef();
    const trRef = React.useRef();

    React.useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Text
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                text={text}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fill={fontColor}
                align="center"
                verticalAlign="middle"
                draggable
                dragBoundFunc={(pos) => {
                    const bounds = { x: 75, y: 32, w: 200, h: 298 };
                    const node = shapeRef.current;
                    if (!node) return pos;
                    const scaleX = node.scaleX() || 1;
                    const scaleY = node.scaleY() || 1;
                    const width = node.width() * scaleX;
                    const height = node.height() * scaleY;

                    return {
                        x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
                        y: Math.max(bounds.y, Math.min(bounds.y + bounds.h - height, pos.y)),
                    };
                }}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

const TransformableImage = ({ shapeProps, isSelected, onSelect, onChange, src }) => {
    const shapeRef = React.useRef();
    const trRef = React.useRef();
    const [image] = useImage(src, 'anonymous');

    React.useEffect(() => {
        if (isSelected && image && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, image]);

    if (!image) return null;

    return (
        <React.Fragment>
            <KonvaImage
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                image={image}
                draggable
                dragBoundFunc={(pos) => {
                    const bounds = { x: 75, y: 32, w: 200, h: 298 };
                    const node = shapeRef.current;
                    if (!node) return pos;
                    const scaleX = node.scaleX() || 1;
                    const scaleY = node.scaleY() || 1;
                    const width = node.width() * scaleX;
                    const height = node.height() * scaleY;

                    return {
                        x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
                        y: Math.max(bounds.y, Math.min(bounds.y + bounds.h - height, pos.y)),
                    };
                }}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

// Canvas background Helper
const CanvasBackground = ({ src }) => {
    const [image] = useImage(src, 'anonymous');
    return image ? <KonvaImage image={image} x={0} y={0} width={350} height={420} name="background" /> : null;
};


// ---- Data Definitions ----
const GLASS_COLORS = {
    standard: [
        { id: 'white-matt', name: 'White Matt', hex: '#f5f5f5' },
        { id: 'black-matt', name: 'Black Matt', hex: '#2a2a2a' },
    ],
    extra: [
        { id: 'amber', name: 'Amber', hex: '#d4900a' },
        { id: 'green', name: 'Green', hex: '#4a7c59' },
    ],
    any: [
        { id: 'pink', name: 'Pink', hex: '#e8a0bf' },
        { id: 'navy', name: 'Navy', hex: '#1e3a5f' },
        { id: 'burgundy', name: 'Burgundy', hex: '#722f37' },
        { id: 'teal', name: 'Teal', hex: '#2c7873' },
    ]
};

const FRAGRANCES = {
    standard: [
        { id: 'floral', name: 'Floral', icon: '🌸' },
        { id: 'woody', name: 'Woody', icon: '🌲' },
        { id: 'fresh', name: 'Fresh', icon: '🍃' },
        { id: 'spicy', name: 'Spicy', icon: '🌶️' },
        { id: 'sandalwood', name: 'Sandalwood', icon: '🪵' },
    ],
    extended: [
        { id: 'vanilla', name: 'Vanilla', icon: '🍦' },
        { id: 'lavender', name: 'Lavender', icon: '💜' },
        { id: 'citrus', name: 'Citrus', icon: '🍋' },
        { id: 'ocean', name: 'Ocean Breeze', icon: '🌊' },
        { id: 'rose', name: 'Rose', icon: '🌹' },
        { id: 'cinnamon', name: 'Cinnamon', icon: '🫚' },
        { id: 'jasmine', name: 'Jasmine', icon: '🌼' },
    ],
    custom: [
        { id: 'custom-fragrance', name: 'Own Custom Fragrance', icon: '✨' },
    ]
};

const WAX_COLORS = {
    standard: [
        { id: 'white', name: 'White', hex: '#fefefe' },
    ],
    extra: [
        { id: 'ivory', name: 'Ivory', hex: '#fffff0' },
        { id: 'cream', name: 'Cream', hex: '#fffdd0' },
    ]
};

const DECORATIONS = [
    { id: 'sticker', name: 'Sticker', icon: '🏷️', moqKey: 'sticker' },
    { id: 'gummy', name: 'Gummy Sticker', icon: '🔖', moqKey: 'gummy' },
    { id: 'uvPrint', name: 'UV Print', icon: '🖨️', moqKey: 'uvPrint' },
];

const PACKAGING = [
    { id: 'noBox', name: 'No Box', icon: '📦', moqKey: 'noBox' },
    { id: 'standardBox', name: 'Standard Box + Sticker', icon: '🎁', moqKey: 'standardBox' },
    { id: 'printedBox', name: 'Full Printed Box', icon: '🖼️', moqKey: 'printedBox' },
    { id: 'bottomLidBox', name: 'Bottom Lid Box', icon: '📫', moqKey: 'bottomLidBox' },
];

const FONTS = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];

function ProductConfigurator({ product, onNext, onBack }) {
    // State
    const [quantity, setQuantity] = useState(1);
    const [expandedSections, setExpandedSections] = useState({
        quantity: true, glassColor: true, fragrance: true, waxColor: true,
        decoration: true, packaging: true, labelText: true, artwork: true, baseImage: true
    });

    // Selections
    const [selectedGlassColor, setSelectedGlassColor] = useState(null);
    const [glassColorTier, setGlassColorTier] = useState('standard');
    const [selectedFragrance, setSelectedFragrance] = useState(null);
    const [fragranceTier, setFragranceTier] = useState('standard');
    const [selectedWaxColor, setSelectedWaxColor] = useState('white');
    const [waxColorTier, setWaxColorTier] = useState('standard');
    const [selectedDecoration, setSelectedDecoration] = useState('sticker');
    const [selectedPackaging, setSelectedPackaging] = useState('noBox');

    const [labelText, setLabelText] = useState('');
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontColor, setFontColor] = useState('#000000');

    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [baseImage, setBaseImage] = useState(null);
    const [baseImageUrl, setBaseImageUrl] = useState(null);

    const fileInputRef = useRef(null);
    const baseImageInputRef = useRef(null);

    // Draggable Transforms State
    const [selectedShape, setSelectedShape] = useState(null);
    const [glassColorProps, setGlassColorProps] = useState({ x: 75, y: 50, width: 200, height: 280, rotation: 0 });
    const [textProps, setTextProps] = useState({ x: 50, y: 160, width: 250, height: 50, rotation: 0 });
    const [artworkProps, setArtworkProps] = useState({ x: 125, y: 150, width: 100, height: 100, rotation: 0 });

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
        if (clickedOnEmpty) {
            setSelectedShape(null);
        }
    };

    // Is this a scented candle with MOQ rules?
    const isScentedCandle = product.category === 'scented-candles' || product.moq;
    const moqData = product.moq || null;

    // Calculate current MOQ requirement
    const getCurrentMOQ = () => {
        if (!moqData) return 1;
        let maxMoq = 1;

        if (moqData.glassColor && moqData.glassColor[glassColorTier]) maxMoq = Math.max(maxMoq, moqData.glassColor[glassColorTier].moq);
        if (moqData.fragrance && moqData.fragrance[fragranceTier]) maxMoq = Math.max(maxMoq, moqData.fragrance[fragranceTier].moq);
        if (moqData.waxColor && moqData.waxColor[waxColorTier]) maxMoq = Math.max(maxMoq, moqData.waxColor[waxColorTier].moq);
        if (moqData.decoration && moqData.decoration[selectedDecoration]) maxMoq = Math.max(maxMoq, moqData.decoration[selectedDecoration].moq);
        if (moqData.packaging && moqData.packaging[selectedPackaging]) maxMoq = Math.max(maxMoq, moqData.packaging[selectedPackaging].moq);

        return maxMoq;
    };

    const currentMOQ = getCurrentMOQ();
    const moqMet = quantity >= currentMOQ;

    // Check if an option tier is unlocked
    const isTierUnlocked = (category, tierKey) => {
        if (!moqData || !moqData[category] || !moqData[category][tierKey]) return true;
        return quantity >= moqData[category][tierKey].moq;
    };

    const getOptionMOQ = (category, key) => {
        if (!moqData || !moqData[category] || !moqData[category][key]) return 1;
        return moqData[category][key].moq;
    };

    const getMoqBadgeClass = (moq) => {
        if (moq <= 1) return 'moq-low';
        if (moq < 500) return 'moq-med';
        return 'moq-high';
    };

    // Dynamic pricing
    const calculatePrice = () => {
        let basePrice = 5.00;
        let unitPrice = basePrice;

        if (glassColorTier === 'extra') unitPrice += 0.50;
        if (glassColorTier === 'any') unitPrice += 1.50;
        if (fragranceTier === 'extended') unitPrice += 0.75;
        if (fragranceTier === 'custom') unitPrice += 2.00;
        if (waxColorTier === 'extra') unitPrice += 0.30;
        if (selectedDecoration === 'gummy') unitPrice += 0.40;
        if (selectedDecoration === 'uvPrint') unitPrice += 1.00;
        if (selectedPackaging === 'standardBox') unitPrice += 0.50;
        if (selectedPackaging === 'printedBox') unitPrice += 1.50;
        if (selectedPackaging === 'bottomLidBox') unitPrice += 2.00;

        let discount = 1;
        if (quantity >= 1000) discount = 0.85;
        else if (quantity >= 500) discount = 0.90;
        else if (quantity >= 100) discount = 0.95;

        unitPrice = unitPrice * discount;
        return { unitPrice: unitPrice.toFixed(2), totalPrice: (unitPrice * quantity).toFixed(2) };
    };

    const pricing = calculatePrice();

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // File uploads
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/upload/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadedFile(file.name);
            setUploadedFileUrl(`https://cusstomizer-backend-production.up.railway.app${response.data.url}`);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error uploading file');
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadedFileUrl(null);
    };

    const handleBaseImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/upload/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBaseImage(file.name);
            setBaseImageUrl(`https://cusstomizer-backend-production.up.railway.app${response.data.url}`);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error uploading base image');
        }
    };

    const removeBaseImage = () => {
        setBaseImage(null);
        setBaseImageUrl(null);
    };

    const handleNext = () => {
        if (!moqMet) {
            alert(`Minimum order quantity is ${currentMOQ}. Please adjust your quantity.`);
            return;
        }

        const glassColorHex = [...GLASS_COLORS.standard, ...GLASS_COLORS.extra, ...GLASS_COLORS.any]
            .find(c => c.id === selectedGlassColor)?.hex || 'transparent';

        const selections = {
            glassColor: selectedGlassColor,
            glassColorHex,
            glassColorProps,
            glassColorTier,
            fragrance: selectedFragrance,
            fragranceTier,
            waxColor: selectedWaxColor,
            waxColorTier,
            decoration: selectedDecoration,
            packaging: selectedPackaging,
            labelText,
            textProps,
            labelConfig: { fontSize, fontFamily, fontColor },
            artworkFile: uploadedFile,
            artworkUrl: uploadedFileUrl,
            artworkProps,
            baseImageUrl,
            pricing: { unitPrice: pricing.unitPrice, totalPrice: pricing.totalPrice },
            moq: currentMOQ,
        };

        onNext(selections, quantity);
    };

    const renderOptionChip = (opt, isSelected, onSelect, moq, locked) => (
        <div
            key={opt.id}
            className={`option-chip ${isSelected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
            onClick={() => !locked && onSelect(opt.id)}
            title={locked ? `Requires MOQ ${moq}+` : ''}
        >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.name}</span>
            {moq > 1 && (
                <span className={`moq-badge ${getMoqBadgeClass(moq)}`}>MOQ {moq}</span>
            )}
            {locked && <span>🔒</span>}
        </div>
    );

    return (
        <div className="product-configurator">
            {/* Top Bar */}
            <div className="configurator-top-bar">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h2>{product.name || product.id}</h2>
                <div className="price-display">
                    <span className="price-label">Total</span>
                    <span className="price-value">${pricing.totalPrice}</span>
                </div>
            </div>

            {/* Main Body */}
            <div className="configurator-body">
                {/* Left: Preview */}
                <div className="configurator-preview">
                    <p className="preview-instructions" style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px', textAlign: 'center' }}>
                        Click elements in the preview to move and resize them.
                    </p>
                    <div className="preview-canvas-container">
                        <Stage width={350} height={420} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
                            <Layer>
                                {/* Base Image */}
                                {(baseImageUrl || product.image_url) && (
                                    <CanvasBackground src={baseImageUrl || product.image_url} />
                                )}

                                {/* Glass color overlay */}
                                {selectedGlassColor && (
                                    <TransformableRect
                                        shapeProps={glassColorProps}
                                        isSelected={selectedShape === 'glassColor'}
                                        onSelect={() => setSelectedShape('glassColor')}
                                        onChange={setGlassColorProps}
                                        fill={
                                            [...GLASS_COLORS.standard, ...GLASS_COLORS.extra, ...GLASS_COLORS.any]
                                                .find(c => c.id === selectedGlassColor)?.hex || 'transparent'
                                        }
                                    />
                                )}

                                {/* Label text preview */}
                                {labelText && (
                                    <TransformableText
                                        shapeProps={textProps}
                                        isSelected={selectedShape === 'text'}
                                        onSelect={() => setSelectedShape('text')}
                                        onChange={setTextProps}
                                        text={labelText}
                                        fontSize={fontSize}
                                        fontFamily={fontFamily}
                                        fontColor={fontColor}
                                    />
                                )}

                                {/* Artwork upload preview */}
                                {uploadedFileUrl && (
                                    <TransformableImage
                                        shapeProps={artworkProps}
                                        isSelected={selectedShape === 'artwork'}
                                        onSelect={() => setSelectedShape('artwork')}
                                        onChange={setArtworkProps}
                                        src={uploadedFileUrl}
                                    />
                                )}

                                {/* Product name */}
                                <Text x={0} y={390} width={350} text={product.name || product.id} fontSize={14} fontFamily="Arial" align="center" fill="#999" name="background" />
                            </Layer>
                        </Stage>
                    </div>
                </div>

                {/* Right: Options */}
                <div className="configurator-options">

                    {/* 0. BASE IMAGE UPLOAD */}
                    <div className="option-section">
                        <div className="option-section-header" onClick={() => toggleSection('baseImage')}>
                            <h3><span className="section-icon">🖼️</span> Base Product Image</h3>
                            <span className={`section-toggle ${(expandedSections.baseImage !== false) ? 'open' : ''}`}>▼</span>
                        </div>
                        {(expandedSections.baseImage !== false) && (
                            <div className="option-section-body">
                                <input
                                    ref={baseImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleBaseImageUpload}
                                />
                                <div className="upload-area" onClick={() => baseImageInputRef.current?.click()}>
                                    <span className="upload-icon">📷</span>
                                    <p>Click to upload a base image of the product</p>
                                    <p className="upload-hint">Supports: PNG, JPG (Transparent PNG recommended)</p>
                                </div>
                                {baseImage && (
                                    <div className="uploaded-file-info">
                                        <span>📄</span>
                                        <span className="file-name">{baseImage}</span>
                                        <button className="remove-file" onClick={removeBaseImage}>✕</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 1. QUANTITY */}
                    <div className="option-section">
                        <div className="option-section-header" onClick={() => toggleSection('quantity')}>
                            <h3><span className="section-icon">📊</span> Order Quantity</h3>
                            <span className={`section-toggle ${expandedSections.quantity ? 'open' : ''}`}>▼</span>
                        </div>
                        {expandedSections.quantity && (
                            <div className="option-section-body">
                                <div className="quantity-row">
                                    <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <input
                                        className="qty-input"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                                    <button className="qty-btn" onClick={() => setQuantity(quantity + 10)} style={{ width: 'auto', padding: '0 12px', fontSize: '0.8rem' }}>+10</button>
                                    <button className="qty-btn" onClick={() => setQuantity(quantity + 100)} style={{ width: 'auto', padding: '0 12px', fontSize: '0.8rem' }}>+100</button>
                                </div>
                                <div className={`moq-info ${moqMet ? 'moq-ok' : 'moq-error'}`}>
                                    {moqMet
                                        ? `✓ MOQ satisfied (minimum: ${currentMOQ} pcs)`
                                        : `✗ Current MOQ: ${currentMOQ} pcs — need ${currentMOQ - quantity} more`
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. GLASS COLOR */}
                    {isScentedCandle && (
                        <div className="option-section">
                            <div className="option-section-header" onClick={() => toggleSection('glassColor')}>
                                <h3><span className="section-icon">🎨</span> Glass Color</h3>
                                <span className={`section-toggle ${expandedSections.glassColor ? 'open' : ''}`}>▼</span>
                            </div>
                            {expandedSections.glassColor && (
                                <div className="option-section-body">
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.75rem' }}>Standard colors are available at any quantity</p>
                                    <div className="color-swatch-grid">
                                        {/* Standard colors */}
                                        {GLASS_COLORS.standard.map(c => (
                                            <div
                                                key={c.id}
                                                className={`color-swatch ${selectedGlassColor === c.id ? 'selected' : ''}`}
                                                style={{ backgroundColor: c.hex }}
                                                onClick={() => { setSelectedGlassColor(c.id); setGlassColorTier('standard'); }}
                                                title={c.name}
                                            >
                                                <span className="swatch-label">{c.name}</span>
                                            </div>
                                        ))}
                                        {/* Extra colors */}
                                        {GLASS_COLORS.extra.map(c => {
                                            const locked = !isTierUnlocked('glassColor', 'extra');
                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`color-swatch ${selectedGlassColor === c.id ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                                                    style={{ backgroundColor: c.hex }}
                                                    onClick={() => { if (!locked) { setSelectedGlassColor(c.id); setGlassColorTier('extra'); } }}
                                                    title={locked ? `MOQ ${getOptionMOQ('glassColor', 'extra')}+` : c.name}
                                                >
                                                    <span className="swatch-label">{c.name} {locked ? '🔒' : ''}</span>
                                                </div>
                                            );
                                        })}
                                        {/* Any color */}
                                        {GLASS_COLORS.any.map(c => {
                                            const locked = !isTierUnlocked('glassColor', 'any');
                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`color-swatch ${selectedGlassColor === c.id ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                                                    style={{ backgroundColor: c.hex }}
                                                    onClick={() => { if (!locked) { setSelectedGlassColor(c.id); setGlassColorTier('any'); } }}
                                                    title={locked ? `MOQ ${getOptionMOQ('glassColor', 'any')}+` : c.name}
                                                >
                                                    <span className="swatch-label">{c.name} {locked ? '🔒' : ''}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!isTierUnlocked('glassColor', 'extra') && (
                                        <p className="locked-msg">🔒 Extra colors require MOQ {getOptionMOQ('glassColor', 'extra')}+ | Custom colors require MOQ {getOptionMOQ('glassColor', 'any')}+</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. FRAGRANCE */}
                    {isScentedCandle && (
                        <div className="option-section">
                            <div className="option-section-header" onClick={() => toggleSection('fragrance')}>
                                <h3><span className="section-icon">🌸</span> Fragrance</h3>
                                <span className={`section-toggle ${expandedSections.fragrance ? 'open' : ''}`}>▼</span>
                            </div>
                            {expandedSections.fragrance && (
                                <div className="option-section-body">
                                    <div className="option-grid">
                                        {/* Standard */}
                                        {FRAGRANCES.standard.map(f => renderOptionChip(
                                            f, selectedFragrance === f.id,
                                            (id) => { setSelectedFragrance(id); setFragranceTier('standard'); },
                                            1, false
                                        ))}
                                        {/* Extended */}
                                        {FRAGRANCES.extended.map(f => {
                                            const moq = getOptionMOQ('fragrance', 'extended');
                                            const locked = !isTierUnlocked('fragrance', 'extended');
                                            return renderOptionChip(
                                                f, selectedFragrance === f.id,
                                                (id) => { setSelectedFragrance(id); setFragranceTier('extended'); },
                                                moq, locked
                                            );
                                        })}
                                        {/* Custom */}
                                        {FRAGRANCES.custom.map(f => {
                                            const moq = getOptionMOQ('fragrance', 'custom');
                                            const locked = !isTierUnlocked('fragrance', 'custom');
                                            return renderOptionChip(
                                                f, selectedFragrance === f.id,
                                                (id) => { setSelectedFragrance(id); setFragranceTier('custom'); },
                                                moq, locked
                                            );
                                        })}
                                    </div>
                                    {!isTierUnlocked('fragrance', 'extended') && (
                                        <p className="locked-msg">🔒 Extended fragrances require MOQ {getOptionMOQ('fragrance', 'extended')}+ | Custom fragrance requires MOQ {getOptionMOQ('fragrance', 'custom')}+</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. WAX COLOR */}
                    {isScentedCandle && (
                        <div className="option-section">
                            <div className="option-section-header" onClick={() => toggleSection('waxColor')}>
                                <h3><span className="section-icon">🕯️</span> Wax Color</h3>
                                <span className={`section-toggle ${expandedSections.waxColor ? 'open' : ''}`}>▼</span>
                            </div>
                            {expandedSections.waxColor && (
                                <div className="option-section-body">
                                    <div className="color-swatch-grid">
                                        {WAX_COLORS.standard.map(c => (
                                            <div
                                                key={c.id}
                                                className={`color-swatch ${selectedWaxColor === c.id ? 'selected' : ''}`}
                                                style={{ backgroundColor: c.hex, border: `2px solid ${selectedWaxColor === c.id ? '#fbbf24' : 'rgba(0,0,0,0.2)'}` }}
                                                onClick={() => { setSelectedWaxColor(c.id); setWaxColorTier('standard'); }}
                                                title={c.name}
                                            >
                                                <span className="swatch-label">{c.name}</span>
                                            </div>
                                        ))}
                                        {WAX_COLORS.extra.map(c => {
                                            const locked = !isTierUnlocked('waxColor', 'extra');
                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`color-swatch ${selectedWaxColor === c.id ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                                                    style={{ backgroundColor: c.hex, border: `2px solid ${selectedWaxColor === c.id ? '#fbbf24' : 'rgba(0,0,0,0.2)'}` }}
                                                    onClick={() => { if (!locked) { setSelectedWaxColor(c.id); setWaxColorTier('extra'); } }}
                                                    title={locked ? `MOQ ${getOptionMOQ('waxColor', 'extra')}+` : c.name}
                                                >
                                                    <span className="swatch-label">{c.name} {locked ? '🔒' : ''}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!isTierUnlocked('waxColor', 'extra') && (
                                        <p className="locked-msg">🔒 Extra wax colors require MOQ {getOptionMOQ('waxColor', 'extra')}+</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 5. DECORATION */}
                    {isScentedCandle && (
                        <div className="option-section">
                            <div className="option-section-header" onClick={() => toggleSection('decoration')}>
                                <h3><span className="section-icon">🖼️</span> Decoration Method</h3>
                                <span className={`section-toggle ${expandedSections.decoration ? 'open' : ''}`}>▼</span>
                            </div>
                            {expandedSections.decoration && (
                                <div className="option-section-body">
                                    <div className="option-grid">
                                        {DECORATIONS.map(d => {
                                            const moq = getOptionMOQ('decoration', d.moqKey);
                                            const locked = quantity < moq;
                                            return renderOptionChip(
                                                d, selectedDecoration === d.id,
                                                (id) => setSelectedDecoration(id),
                                                moq, locked
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 6. PACKAGING */}
                    {isScentedCandle && (
                        <div className="option-section">
                            <div className="option-section-header" onClick={() => toggleSection('packaging')}>
                                <h3><span className="section-icon">📦</span> Packaging</h3>
                                <span className={`section-toggle ${expandedSections.packaging ? 'open' : ''}`}>▼</span>
                            </div>
                            {expandedSections.packaging && (
                                <div className="option-section-body">
                                    <div className="option-grid">
                                        {PACKAGING.map(p => {
                                            const moq = getOptionMOQ('packaging', p.moqKey);
                                            const locked = quantity < moq;
                                            return renderOptionChip(
                                                p, selectedPackaging === p.id,
                                                (id) => setSelectedPackaging(id),
                                                moq, locked
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 7. LABEL TEXT */}
                    <div className="option-section">
                        <div className="option-section-header" onClick={() => toggleSection('labelText')}>
                            <h3><span className="section-icon">✏️</span> Label Text & Styling</h3>
                            <span className={`section-toggle ${expandedSections.labelText ? 'open' : ''}`}>▼</span>
                        </div>
                        {expandedSections.labelText && (
                            <div className="option-section-body">
                                <input
                                    className="label-text-input"
                                    type="text"
                                    placeholder="Enter your custom label text..."
                                    value={labelText}
                                    onChange={(e) => setLabelText(e.target.value)}
                                />
                                <div className="label-controls">
                                    <div className="label-control">
                                        <label>Font</label>
                                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div className="label-control">
                                        <label>Size</label>
                                        <input type="number" min="8" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 16)} />
                                    </div>
                                    <div className="label-control">
                                        <label>Color</label>
                                        <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 8. ARTWORK UPLOAD */}
                    <div className="option-section">
                        <div className="option-section-header" onClick={() => toggleSection('artwork')}>
                            <h3><span className="section-icon">📎</span> Artwork / Branding Upload</h3>
                            <span className={`section-toggle ${expandedSections.artwork ? 'open' : ''}`}>▼</span>
                        </div>
                        {expandedSections.artwork && (
                            <div className="option-section-body">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf,.ai,.eps,.svg"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                                    <span className="upload-icon">☁️</span>
                                    <p>Click to upload artwork or branding files</p>
                                    <p className="upload-hint">Supports: PNG, JPG, SVG, PDF, AI, EPS (max 5MB)</p>
                                </div>
                                {uploadedFile && (
                                    <div className="uploaded-file-info">
                                        <span>📄</span>
                                        <span className="file-name">{uploadedFile}</span>
                                        <button className="remove-file" onClick={removeFile}>✕</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="configurator-bottom-bar">
                <div className="bottom-bar-summary">
                    <div className="summary-item">
                        <span className="label">Qty:</span>
                        <span className="value">{quantity}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Unit Price:</span>
                        <span className="value">${pricing.unitPrice}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">MOQ:</span>
                        <span className="value" style={{ color: moqMet ? '#10b981' : '#ef4444' }}>{currentMOQ} {moqMet ? '✓' : '✗'}</span>
                    </div>
                </div>
                <button className="next-btn" disabled={!moqMet} onClick={handleNext}>
                    Review Order →
                </button>
            </div>
        </div>
    );
}

export default ProductConfigurator;
