import React from 'react';
import { SCENTED_CANDLES, SQUARE_CANDLES, SPECIAL_CANDLES } from '../data/productData';
import './ModelSelection.css';

function ModelSelection({ category, onSelectModel, onBack }) {
  // Get products based on category
  const getProducts = () => {
    switch (category) {
      case 'scented-candles': return SCENTED_CANDLES;
      case 'square-candles': return SQUARE_CANDLES;
      case 'special-candles': return SPECIAL_CANDLES;
      default: return [];
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'scented-candles': return 'Scented Candles in Glass';
      case 'square-candles': return 'Square Candles';
      case 'special-candles': return 'Special Candles';
      default: return 'Products';
    }
  };

  const products = getProducts();

  return (
    <div className="model-selection">
      <div className="model-selection-header">
        <button className="back-btn" onClick={onBack}>← Back to Categories</button>
        <h2>{getCategoryTitle()}</h2>
        <p className="model-selection-subtitle">Select a model to customize</p>
      </div>

      <div className="models-grid">
        {products.map(product => (
          <div key={product.id} className="model-card" onClick={() => onSelectModel(product)}>
            <div className="model-card-badge">{product.id}</div>
            <div className="model-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="placeholder-img">
                  <span className="placeholder-icon">🕯️</span>
                  <span className="placeholder-id">{product.id}</span>
                </div>
              )}
            </div>
            <div className="model-info">
              <h3>{product.name}</h3>
              {product.diameter && <p className="model-spec">⌀ {product.diameter}</p>}
              {product.base && <p className="model-spec">Base: {product.base}</p>}
              {product.height && <p className="model-spec">Height: {product.height}</p>}
              {product.description && <p className="model-desc">{product.description}</p>}
              {product.moq && (
                <p className="model-moq">MOQ from 1 pc</p>
              )}
              {product.options && (
                <div className="model-options-tags">
                  {product.options.nameOnCandle && <span className="option-tag">Name on candle</span>}
                  {product.options.uploadPicture && <span className="option-tag">Upload picture</span>}
                  {product.options.chooseFont && <span className="option-tag">Choose font</span>}
                </div>
              )}
            </div>
            <button className="select-model-btn">Customize →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModelSelection;
