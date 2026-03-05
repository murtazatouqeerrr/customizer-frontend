import React, { useState } from 'react';
import MOQValidator from './MOQValidator';
import MOQOptionSelector from './MOQOptionSelector';
import { SCENTED_CANDLES } from '../data/productData';
import './MOQDemo.css';

function MOQDemo() {
  const [selectedProduct, setSelectedProduct] = useState(SCENTED_CANDLES[0]);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({
    glassColor: 'standard',
    fragrance: 'standard',
    waxColor: 'standard',
    decoration: 'sticker',
    packaging: 'noBox'
  });
  const [currentMOQ, setCurrentMOQ] = useState(1);

  const calculateMOQ = (newSelections) => {
    let maxMOQ = 1;
    
    // Glass Color MOQ
    if (newSelections.glassColor === 'standard') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.glassColor.standard.moq);
    } else if (newSelections.glassColor === 'extra') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.glassColor.extra.moq);
    } else if (newSelections.glassColor === 'any') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.glassColor.any.moq);
    }
    
    // Fragrance MOQ
    if (newSelections.fragrance === 'standard') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.fragrance.standard.moq);
    } else if (newSelections.fragrance === 'extended') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.fragrance.extended.moq);
    } else if (newSelections.fragrance === 'custom') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.fragrance.custom.moq);
    }
    
    // Wax Color MOQ
    if (newSelections.waxColor === 'extra') {
      maxMOQ = Math.max(maxMOQ, selectedProduct.moq.waxColor.extra.moq);
    }
    
    // Decoration MOQ
    const decorationMOQ = selectedProduct.moq.decoration[newSelections.decoration]?.moq || 1;
    maxMOQ = Math.max(maxMOQ, decorationMOQ);
    
    // Packaging MOQ
    const packagingMOQ = selectedProduct.moq.packaging[newSelections.packaging]?.moq || 1;
    maxMOQ = Math.max(maxMOQ, packagingMOQ);
    
    return maxMOQ;
  };

  const handleSelectionChange = (category, value, moq) => {
    const newSelections = { ...selections, [category]: value };
    setSelections(newSelections);
    
    const newMOQ = calculateMOQ(newSelections);
    setCurrentMOQ(newMOQ);
    
    if (quantity < newMOQ) {
      setQuantity(newMOQ);
    }
  };

  const glassColorOptions = [
    { label: 'Standard Colors (White/Black Matt)', value: 'standard', moq: selectedProduct.moq.glassColor.standard.moq },
    { label: '2 Extra Colors', value: 'extra', moq: selectedProduct.moq.glassColor.extra.moq },
    { label: 'Any Custom Color', value: 'any', moq: selectedProduct.moq.glassColor.any.moq }
  ];

  const fragranceOptions = [
    { label: '5 Standard Fragrances', value: 'standard', moq: selectedProduct.moq.fragrance.standard.moq },
    { label: '12 Fragrances Selection', value: 'extended', moq: selectedProduct.moq.fragrance.extended.moq },
    { label: 'Own Custom Fragrance', value: 'custom', moq: selectedProduct.moq.fragrance.custom.moq }
  ];

  const waxColorOptions = [
    { label: 'Standard White', value: 'standard', moq: selectedProduct.moq.waxColor.standard.moq },
    { label: '2 Extra Colors', value: 'extra', moq: selectedProduct.moq.waxColor.extra.moq }
  ];

  const decorationOptions = [
    { label: 'Sticker', value: 'sticker', moq: selectedProduct.moq.decoration.sticker.moq },
    { label: 'Gummy', value: 'gummy', moq: selectedProduct.moq.decoration.gummy.moq },
    { label: 'UV Print', value: 'uvPrint', moq: selectedProduct.moq.decoration.uvPrint.moq }
  ];

  const packagingOptions = [
    { label: 'No Box', value: 'noBox', moq: selectedProduct.moq.packaging.noBox.moq },
    { label: 'Standard Box + Sticker', value: 'standardBox', moq: selectedProduct.moq.packaging.standardBox.moq },
    { label: 'Full Printed Box', value: 'printedBox', moq: selectedProduct.moq.packaging.printedBox.moq },
    { label: 'Bottom Lid Box', value: 'bottomLidBox', moq: selectedProduct.moq.packaging.bottomLidBox.moq }
  ];

  return (
    <div className="moq-demo">
      <div className="demo-header">
        <h1>🕯️ MOQ System Demo</h1>
        <p>See how Minimum Order Quantities work based on your selections</p>
      </div>

      <div className="demo-content">
        <div className="demo-left">
          <div className="product-selector">
            <h3>Select Product</h3>
            <select 
              value={selectedProduct.id} 
              onChange={(e) => {
                const product = SCENTED_CANDLES.find(p => p.id === e.target.value);
                setSelectedProduct(product);
                setCurrentMOQ(1);
                setQuantity(1);
                setSelections({
                  glassColor: 'standard',
                  fragrance: 'standard',
                  waxColor: 'standard',
                  decoration: 'sticker',
                  packaging: 'noBox'
                });
              }}
            >
              {SCENTED_CANDLES.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.diameter}
                </option>
              ))}
            </select>
          </div>

          <MOQOptionSelector
            title="Glass Color"
            options={glassColorOptions}
            selectedValue={selections.glassColor}
            onSelect={(value, moq) => handleSelectionChange('glassColor', value, moq)}
            type="radio"
          />

          <MOQOptionSelector
            title="Fragrance"
            options={fragranceOptions}
            selectedValue={selections.fragrance}
            onSelect={(value, moq) => handleSelectionChange('fragrance', value, moq)}
            type="radio"
          />

          <MOQOptionSelector
            title="Wax Color"
            options={waxColorOptions}
            selectedValue={selections.waxColor}
            onSelect={(value, moq) => handleSelectionChange('waxColor', value, moq)}
            type="radio"
          />

          <MOQOptionSelector
            title="Decoration Method"
            options={decorationOptions}
            selectedValue={selections.decoration}
            onSelect={(value, moq) => handleSelectionChange('decoration', value, moq)}
            type="button"
          />

          <MOQOptionSelector
            title="Packaging Options"
            options={packagingOptions}
            selectedValue={selections.packaging}
            onSelect={(value, moq) => handleSelectionChange('packaging', value, moq)}
            type="button"
          />
        </div>

        <div className="demo-right">
          <div className="sticky-panel">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Product:</span>
              <strong>{selectedProduct.name}</strong>
            </div>
            <div className="summary-item">
              <span>Diameter:</span>
              <strong>{selectedProduct.diameter}</strong>
            </div>

            <div className="selections-summary">
              <h4>Your Selections:</h4>
              <ul>
                <li>Glass Color: <strong>{selections.glassColor}</strong></li>
                <li>Fragrance: <strong>{selections.fragrance}</strong></li>
                <li>Wax Color: <strong>{selections.waxColor}</strong></li>
                <li>Decoration: <strong>{selections.decoration}</strong></li>
                <li>Packaging: <strong>{selections.packaging}</strong></li>
              </ul>
            </div>

            <MOQValidator
              currentMOQ={currentMOQ}
              selectedQuantity={quantity}
              onQuantityChange={setQuantity}
              productName={selectedProduct.name}
            />

            <button 
              className="checkout-btn"
              disabled={quantity < currentMOQ}
              style={{ opacity: quantity < currentMOQ ? 0.5 : 1 }}
            >
              {quantity < currentMOQ ? '⚠️ MOQ Not Met' : '✓ Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MOQDemo;
