import React from 'react';
import { SCENTED_CANDLES, SQUARE_CANDLES, SPECIAL_CANDLES } from '../data/productData';
import './CategorySelection.css';

const categories = [
    {
        id: 'scented-candles',
        name: 'Scented Candles in Glass',
        description: 'Premium scented candles in round glass containers. Choose from GL80 to GL170 with full MOQ customization.',
        icon: '🕯️',
        count: SCENTED_CANDLES.length
    },
    {
        id: 'square-candles',
        name: 'Square Candles',
        description: 'Bespoke square candles with add-ons like hearts, feet, and hands. Perfect for personalized gifts.',
        icon: '🔲',
        count: SQUARE_CANDLES.length
    },
    {
        id: 'special-candles',
        name: 'Special Candles',
        description: 'Unique designs — connected candles, puzzle pieces, ring candles. One-of-a-kind statement pieces.',
        icon: '✨',
        count: SPECIAL_CANDLES.length
    }
];

function CategorySelection({ onSelectCategory, onBack }) {
    return (
        <div className="category-selection">
            <button className="category-back-btn" onClick={onBack}>← Back</button>
            <div className="category-header">
                <h2>Choose a Category</h2>
                <p>Select the type of candle you would like to customize</p>
            </div>

            <div className="category-grid">
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className="category-card"
                        onClick={() => onSelectCategory(cat.id)}
                    >
                        <span className="category-card-icon">{cat.icon}</span>
                        <h3>{cat.name}</h3>
                        <p>{cat.description}</p>
                        <span className="product-count">{cat.count} models available</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategorySelection;
