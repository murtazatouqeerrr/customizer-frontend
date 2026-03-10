import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

const AreaEditor = ({
    productImage,
    initialArea,
    onAreaChange,
    canvasWidth = 350,
    canvasHeight = 420
}) => {
    const [image] = useImage(productImage || '', 'anonymous');
    const [areas, setAreas] = useState(() => {
        if (initialArea && initialArea.enabled && initialArea.x !== undefined) {
            return [{
                x: initialArea.x,
                y: initialArea.y,
                width: initialArea.width,
                height: initialArea.height
            }];
        }
        return [];
    });
    const [selectedAreaIndex, setSelectedAreaIndex] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newRect, setNewRect] = useState(null);
    const [drawMode, setDrawMode] = useState('free'); // 'free' or 'square'
    const [squareSize, setSquareSize] = useState(100);
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const shapeRefs = useRef({});

    // Update parent when areas change
    useEffect(() => {
        if (areas.length > 0) {
            const area = areas[0];
            onAreaChange({
                enabled: true,
                x: Math.round(area.x),
                y: Math.round(area.y),
                width: Math.round(area.width),
                height: Math.round(area.height)
            });
        } else {
            onAreaChange({ enabled: false, x: 0, y: 0, width: 0, height: 0 });
        }
    }, [areas, onAreaChange]);

    // Attach transformer to selected shape
    useEffect(() => {
        if (selectedAreaIndex !== null && transformerRef.current && shapeRefs.current[selectedAreaIndex]) {
            transformerRef.current.nodes([shapeRefs.current[selectedAreaIndex]]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedAreaIndex]);

    // Handle mouse down - start drawing
    const handleMouseDown = (e) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        
        // If clicking on empty space, start drawing a new rectangle
        // Allow drawing on any click except existing areas
        const clickedOnExistingArea = e.target.getClassName && e.target.getClassName() === 'Rect' && areas.length > 0;
        if (!clickedOnExistingArea) {
            setSelectedAreaIndex(null);
            setIsDrawing(true);
            
            if (drawMode === 'square') {
                // For square mode, create a square centered on click
                const size = squareSize;
                setNewRect({
                    x: pos.x - size / 2,
                    y: pos.y - size / 2,
                    width: size,
                    height: size
                });
            } else {
                setNewRect({
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0
                });
            }
        }
    };

    // Handle mouse move - resize rectangle while drawing
    const handleMouseMove = (e) => {
        if (!isDrawing || !newRect) return;
        
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        
        if (drawMode === 'square') {
            // In square mode, calculate size from center
            const size = squareSize;
            setNewRect({
                x: pos.x - size / 2,
                y: pos.y - size / 2,
                width: size,
                height: size
            });
        } else {
            setNewRect({
                ...newRect,
                width: pos.x - newRect.x,
                height: pos.y - newRect.y
            });
        }
    };

    // Handle mouse up - finish drawing
    const handleMouseUp = () => {
        if (!isDrawing || !newRect) return;
        
        setIsDrawing(false);
        
        // Only add if rectangle has meaningful size
        if (Math.abs(newRect.width) > 10 && Math.abs(newRect.height) > 10) {
            // Normalize rectangle (handle negative width/height from dragging backwards)
            const normalizedRect = {
                x: newRect.width < 0 ? newRect.x + newRect.width : newRect.x,
                y: newRect.height < 0 ? newRect.y + newRect.height : newRect.y,
                width: Math.abs(newRect.width),
                height: Math.abs(newRect.height)
            };
            setAreas([normalizedRect]);
        }
        setNewRect(null);
    };

    // Handle clicking on existing area to select it
    const handleAreaClick = (index) => {
        setSelectedAreaIndex(index);
        setIsDrawing(false);
    };

    // Clear all areas
    const handleClearAll = () => {
        setAreas([]);
        setSelectedAreaIndex(null);
    };

    return (
        <div className="area-editor">
            <div className="area-editor-instructions">
                <p>Click on the image to draw a customizable area. This area will restrict where users can place their customizations.</p>
            </div>
            
            <div className="area-draw-options">
                <div className="draw-mode-toggle">
                    <label className="mode-label">Draw Mode:</label>
                    <button
                        type="button"
                        className={`mode-btn ${drawMode === 'free' ? 'active' : ''}`}
                        onClick={() => setDrawMode('free')}
                    >
                        Free Draw
                    </button>
                    <button
                        type="button"
                        className={`mode-btn ${drawMode === 'square' ? 'active' : ''}`}
                        onClick={() => setDrawMode('square')}
                    >
                        Square
                    </button>
                </div>
                
                {drawMode === 'square' && (
                    <div className="square-size-selector">
                        <label className="size-label">Square Size:</label>
                        <select
                            value={squareSize}
                            onChange={(e) => setSquareSize(parseInt(e.target.value))}
                            className="size-select"
                        >
                            <option value={50}>50 x 50</option>
                            <option value={75}>75 x 75</option>
                            <option value={100}>100 x 100</option>
                            <option value={125}>125 x 125</option>
                            <option value={150}>150 x 150</option>
                            <option value={175}>175 x 175</option>
                            <option value={200}>200 x 200</option>
                            <option value={225}>225 x 225</option>
                            <option value={250}>250 x 250</option>
                        </select>
                    </div>
                )}
            </div>
            
            <div className="area-editor-canvas">
                <Stage
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    ref={stageRef}
                    style={{ border: '2px solid rgba(102, 126, 234, 0.5)', borderRadius: '8px', cursor: 'crosshair' }}
                >
                    <Layer>
                        {/* Product Image */}
                        {image && (
                            <KonvaImage
                                image={image}
                                width={canvasWidth}
                                height={canvasHeight}
                                fit="contain"
                            />
                        )}
                        
                        {/* Background when no image */}
                        {!image && (
                            <Rect
                                x={0}
                                y={0}
                                width={canvasWidth}
                                height={canvasHeight}
                                fill="#1a1a2e"
                            />
                        )}
                        
                        {/* Existing areas */}
                        {areas.map((area, index) => (
                            <Rect
                                key={index}
                                ref={(el) => { shapeRefs.current[index] = el; }}
                                x={area.x}
                                y={area.y}
                                width={area.width}
                                height={area.height}
                                fill="rgba(102, 126, 234, 0.3)"
                                stroke={selectedAreaIndex === index ? '#fbbf24' : '#667eea'}
                                strokeWidth={selectedAreaIndex === index ? 3 : 2}
                                draggable
                                onClick={() => handleAreaClick(index)}
                                onTap={() => handleAreaClick(index)}
                                onDragEnd={(e) => {
                                    const newAreas = [...areas];
                                    newAreas[index] = {
                                        ...area,
                                        x: e.target.x(),
                                        y: e.target.y()
                                    };
                                    setAreas(newAreas);
                                }}
                                onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const scaleY = node.scaleY();
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    const newAreas = [...areas];
                                    newAreas[index] = {
                                        ...area,
                                        x: node.x(),
                                        y: node.y(),
                                        width: Math.max(10, node.width() * scaleX),
                                        height: Math.max(10, node.height() * scaleY)
                                    };
                                    setAreas(newAreas);
                                }}
                            />
                        ))}
                        
                        {/* New rectangle being drawn */}
                        {newRect && (
                            <Rect
                                x={newRect.x}
                                y={newRect.y}
                                width={newRect.width}
                                height={newRect.height}
                                fill="rgba(102, 126, 234, 0.3)"
                                stroke="#667eea"
                                strokeWidth={2}
                                dash={[5, 5]}
                            />
                        )}
                        
                        {/* Transformer for selected area */}
                        {selectedAreaIndex !== null && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 20 || newBox.height < 20) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
            
            <div className="area-editor-controls">
                <div className="area-info">
                    {areas.length > 0 && (
                        <span>
                            Area: x={Math.round(areas[0].x)}, y={Math.round(areas[0].y)}, 
                            w={Math.round(areas[0].width)}, h={Math.round(areas[0].height)}
                        </span>
                    )}
                    {areas.length === 0 && (
                        <span>No area defined - click and drag to draw</span>
                    )}
                </div>
                <div className="area-buttons">
                    <button 
                        type="button" 
                        className="area-btn clear"
                        onClick={handleClearAll}
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AreaEditor;
