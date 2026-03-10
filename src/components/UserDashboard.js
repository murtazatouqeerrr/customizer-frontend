import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

function UserDashboard({ onSelectProduct }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/models/published`)
            .then(res => setProducts(res.data))
            .catch(err => console.error('Error fetching published products:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="user-dashboard">
            {/* Hero */}
            <div className="user-hero">
                <div className="user-hero-content">
                    <div className="hero-badge"><i className="fas fa-sparkles"></i> Custom Made For You</div>
                    <h1>Design Your Perfect Product</h1>
                    <p>Choose a product below and customize it exactly the way you want — colors, text, artwork and more.</p>
                </div>
                <div className="hero-decoration">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-orb orb-3" />
                </div>
            </div>

            {/* Products */}
            <div className="user-products-section">
                <div className="section-header">
                    <h2>Available Products</h2>
                    <p>Select a product to start customizing</p>
                </div>

                {loading ? (
                    <div className="user-loading">
                        <div className="loading-dots">
                            <span /><span /><span />
                        </div>
                        <p>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="user-empty">
                        <div className="empty-emoji"><i className="fas fa-store"></i></div>
                        <h3>No products available yet</h3>
                        <p>Check back soon — new products are coming!</p>
                    </div>
                ) : (
                    <div className="user-products-grid">
                        {products.map(product => (
                            <div
                                key={product.id}
                                className="user-product-card"
                                onClick={() => onSelectProduct(product)}
                            >
                                <div className="user-card-img-wrap">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} />
                                    ) : (
                                        <div className="user-img-placeholder">
                                            <span><i className="fas fa-fire"></i></span>
                                        </div>
                                    )}
                                    <div className="card-hover-overlay">
                                        <span>Customize →</span>
                                    </div>
                                </div>
                                <div className="user-card-body">
                                    <h3>{product.name}</h3>
                                    {product.description && <p className="user-card-desc">{product.description}</p>}
                                    <div className="user-card-footer">
                                        <span className="user-card-price">
                                            Rs. {parseFloat(product.base_price || 0).toFixed(2)}
                                        </span>
                                        <button className="customize-btn" onClick={() => onSelectProduct(product)}>
                                            Customize
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="user-footer">
                <p><i className="fas fa-sparkles"></i> Every product is handcrafted to your specifications</p>
            </div>
        </div>
    );
}

export default UserDashboard;
