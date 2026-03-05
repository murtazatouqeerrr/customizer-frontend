import React from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import './Preview.css';

function CanvasImage({ src, x = 0, y = 0, width = 350, height = 420, rotation = 0 }) {
  const [image] = useImage(src, 'anonymous');
  return image ? <KonvaImage image={image} x={x} y={y} width={width} height={height} rotation={rotation} /> : null;
}

// Helper to get display name
const getDisplayName = (id) => {
  if (!id) return '—';
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

function Preview({ product, selections, quantity, onCheckout, onBack }) {
  return (
    <div className="preview">
      <div className="preview-header">
        <button className="back-btn" onClick={onBack}>← Back to Configurator</button>
        <h2>Order Review</h2>
      </div>

      <div className="preview-content">
        {/* Left: Visual */}
        <div className="preview-visual">
          <div className="preview-canvas-wrap">
            <Stage width={350} height={420}>
              <Layer>
                {(selections.baseImageUrl || product.image_url) && <CanvasImage src={selections.baseImageUrl || product.image_url} />}

                {/* Glass color overlay */}
                {selections.glassColorHex && (
                  <Rect
                    {...(selections.glassColorProps || { x: 75, y: 50, width: 200, height: 280, rotation: 0 })}
                    fill={selections.glassColorHex} opacity={0.25} cornerRadius={10}
                  />
                )}

                {/* Label text */}
                {selections.labelText && (
                  <Text
                    {...(selections.textProps || { x: 50, y: 160, width: 250, rotation: 0 })}
                    text={selections.labelText}
                    fontSize={selections.labelConfig?.fontSize || 16}
                    fontFamily={selections.labelConfig?.fontFamily || 'Arial'}
                    fill={selections.labelConfig?.fontColor || '#000'}
                    align="center"
                    verticalAlign="middle"
                  />
                )}

                {/* Artwork upload preview */}
                {selections.artworkUrl && (
                  <CanvasImage
                    src={selections.artworkUrl}
                    {...(selections.artworkProps || { x: 125, y: 150, width: 100, height: 100, rotation: 0 })}
                  />
                )}

                <Text x={0} y={390} width={350} text={product.name || product.id} fontSize={14} fontFamily="Arial" align="center" fill="#999" />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Right: Details */}
        <div className="preview-details">
          <div className="preview-product-title">
            <h3>{product.name || product.id}</h3>
            {product.diameter && <span className="spec-badge">⌀ {product.diameter}</span>}
          </div>

          <div className="summary-section">
            <h4>Configuration Summary</h4>

            <div className="summary-item">
              <span className="summary-label">Quantity</span>
              <span className="summary-value">{quantity} pcs</span>
            </div>

            {selections.glassColor && (
              <div className="summary-item">
                <span className="summary-label">Glass Color</span>
                <span className="summary-value">
                  {getDisplayName(selections.glassColor)}
                  <span className="tier-badge">{selections.glassColorTier}</span>
                </span>
              </div>
            )}

            {selections.fragrance && (
              <div className="summary-item">
                <span className="summary-label">Fragrance</span>
                <span className="summary-value">
                  {getDisplayName(selections.fragrance)}
                  <span className="tier-badge">{selections.fragranceTier}</span>
                </span>
              </div>
            )}

            {selections.waxColor && (
              <div className="summary-item">
                <span className="summary-label">Wax Color</span>
                <span className="summary-value">
                  {getDisplayName(selections.waxColor)}
                  <span className="tier-badge">{selections.waxColorTier}</span>
                </span>
              </div>
            )}

            {selections.decoration && (
              <div className="summary-item">
                <span className="summary-label">Decoration</span>
                <span className="summary-value">{getDisplayName(selections.decoration)}</span>
              </div>
            )}

            {selections.packaging && (
              <div className="summary-item">
                <span className="summary-label">Packaging</span>
                <span className="summary-value">{getDisplayName(selections.packaging)}</span>
              </div>
            )}

            {selections.labelText && (
              <div className="summary-item">
                <span className="summary-label">Label Text</span>
                <span className="summary-value">"{selections.labelText}"</span>
              </div>
            )}

            {selections.labelConfig && (
              <div className="summary-item">
                <span className="summary-label">Font</span>
                <span className="summary-value">{selections.labelConfig.fontFamily}, {selections.labelConfig.fontSize}px</span>
              </div>
            )}

            {selections.artworkFile && (
              <div className="summary-item">
                <span className="summary-label">Artwork</span>
                <span className="summary-value">📎 {selections.artworkFile}</span>
              </div>
            )}
          </div>

          <div className="pricing-section">
            <h4>Pricing</h4>
            <div className="summary-item">
              <span className="summary-label">Unit Price</span>
              <span className="summary-value">${selections.pricing?.unitPrice || '0.00'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">MOQ Met</span>
              <span className="summary-value" style={{ color: '#10b981' }}>✓ {selections.moq} pcs</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total Price</span>
              <span className="summary-value">${selections.pricing?.totalPrice || '0.00'}</span>
            </div>
          </div>

          <button className="checkout-btn" onClick={onCheckout}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Preview;
