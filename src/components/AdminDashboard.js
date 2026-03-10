import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductConfigurator, { CUSTOMIZATION_FIELDS } from './ProductConfigurator';
import './AdminDashboard.css';

const API_URL = 'https://customizer-backend-lxfe.onrender.com/api';

// Group fields by category
const FIELD_CATEGORIES = {
    general: { name: 'General', fields: ['baseImage', 'quantity', 'customizableArea'] },
    scented: { name: 'Scented Candles', fields: ['glassType', 'glassColor', 'fragrance', 'waxColor', 'decoration', 'packaging'] },
    branding: { name: 'Branding', fields: ['labelText', 'artwork'] },
    square: { name: 'Square Candles', fields: ['squareCandle', 'addOns', 'nameOnCandle'] },
    special: { name: 'Special Candles', fields: ['specialCandle', 'addOns', 'nameOnCandle'] },
};

function AdminDashboard() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configuringModel, setConfiguringModel] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);
    const [savingConfig, setSavingConfig] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newModel, setNewModel] = useState({ name: '', description: '', base_price: '' });
    const [newModelImage, setNewModelImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const imageInputRef = React.useRef(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const res = await axios.get(`${API_URL}/models`);
            setModels(res.data);
        } catch (err) {
            console.error('Error fetching models:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const baseUrl = API_URL.replace('/api', '');
            setNewModelImage(`${baseUrl}${res.data.url}`);
        } catch (err) {
            alert('Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateModel = async () => {
        if (!newModel.name || !newModel.base_price) {
            alert('Please fill in name and base price');
            return;
        }
        setCreating(true);
        try {
            const res = await axios.post(`${API_URL}/models`, {
                name: newModel.name,
                description: newModel.description,
                base_price: parseFloat(newModel.base_price),
                image_url: newModelImage || null
            });
            setModels(prev => [...prev, res.data]);
            setShowCreateModal(false);
            setNewModel({ name: '', description: '', base_price: '' });
            setNewModelImage(null);
        } catch (err) {
            alert('Error creating product');
        } finally {
            setCreating(false);
        }
    };

    const handleTogglePublish = async (e, model) => {
        e.stopPropagation();
        try {
            const res = await axios.put(`${API_URL}/models/${model.id}/publish`);
            setModels(prev => prev.map(m => m.id === model.id ? { ...m, is_published: res.data.is_published } : m));
        } catch (err) {
            alert('Error toggling publish status');
        }
    };

    const handleOpenConfig = (e, model) => {
        e.stopPropagation();
        setConfiguringModel(model);
        // Load existing config or default to all fields
        const existingConfig = model.admin_config || [];
        setSelectedFields(existingConfig.length > 0 ? existingConfig : Object.keys(CUSTOMIZATION_FIELDS));
        setShowConfigModal(true);
    };

    const toggleField = (fieldId) => {
        setSelectedFields(prev => 
            prev.includes(fieldId) 
                ? prev.filter(id => id !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleSaveConfig = async () => {
        if (!configuringModel) return;
        setSavingConfig(true);
        try {
            const res = await axios.put(`${API_URL}/models/${configuringModel.id}`, {
                admin_config: selectedFields
            });
            setModels(prev => prev.map(m => m.id === configuringModel.id ? { ...m, admin_config: res.data.admin_config } : m));
            setShowConfigModal(false);
            setConfiguringModel(null);
        } catch (err) {
            alert('Error saving configuration');
        } finally {
            setSavingConfig(false);
        }
    };

    if (selectedModel) {
        return (
            <ProductConfigurator
                product={selectedModel}
                onBack={() => { setSelectedModel(null); fetchModels(); }}
                onNext={() => { setSelectedModel(null); fetchModels(); }}
                isAdmin={true}
            />
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="logo-icon"><i className="fas fa-cog"></i></span>
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage products &amp; customization</p>
                        </div>
                    </div>
                </div>
                <div className="admin-header-right">
                    <a href="/" className="view-store-btn" target="_blank" rel="noreferrer">
                        <i className="fas fa-store"></i> View Store
                    </a>
                    <button className="create-product-btn" onClick={() => setShowCreateModal(true)}>
                        + New Product
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="admin-stats">
                <div className="stat-card">
                    <span className="stat-num">{models.length}</span>
                    <span className="stat-label">Total Products</span>
                </div>
                <div className="stat-card">
                    <span className="stat-num">{models.filter(m => m.is_published).length}</span>
                    <span className="stat-label">Published</span>
                </div>
                <div className="stat-card">
                    <span className="stat-num">{models.filter(m => !m.is_published).length}</span>
                    <span className="stat-label">Drafts</span>
                </div>
            </div>

            {/* Section title */}
            <div className="products-section-title">
                <h2>All Products</h2>
                <span className="product-count">{models.length} products</span>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="admin-loading">
                    <div className="loading-spinner" />
                    <p>Loading products...</p>
                </div>
            ) : models.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><i className="fas fa-box"></i></div>
                    <h3>No products yet</h3>
                    <p>Create your first product to get started</p>
                    <button className="create-product-btn" onClick={() => setShowCreateModal(true)}>
                        + Create Product
                    </button>
                </div>
            ) : (
                <div className="products-grid">
                    {models.map(model => (
                        <div
                            key={model.id}
                            className={`product-card ${model.is_published ? 'published' : 'draft'}`}
                            onClick={() => setSelectedModel(model)}
                        >
                            <div className="product-card-image">
                                {model.image_url ? (
                                    <img src={model.image_url} alt={model.name} />
                                ) : (
                                    <div className="product-image-placeholder">
                                        <span><i className="fas fa-fire"></i></span>
                                    </div>
                                )}
                                <span className={`publish-badge ${model.is_published ? 'published' : 'draft'}`}>
                                    {model.is_published ? '✓ Published' : '○ Draft'}
                                </span>
                            </div>

                            <div className="product-card-body">
                                <h3 className="product-card-name">{model.name}</h3>
                                {model.description && (
                                    <p className="product-card-desc">{model.description}</p>
                                )}
                                <div className="product-card-price">
                                    Rs. {parseFloat(model.base_price || 0).toFixed(2)}
                                </div>
                            </div>

                            <div className="product-card-actions">
                                <button
                                    className="edit-btn"
                                    onClick={(e) => { e.stopPropagation(); setSelectedModel(model); }}
                                >
                                    <i className="fas fa-edit"></i> Configure
                                </button>
                                <button
                                    className="config-btn"
                                    onClick={(e) => handleOpenConfig(e, model)}
                                >
                                    <i className="fas fa-cog"></i> Fields
                                </button>
                                <button
                                    className={`publish-btn ${model.is_published ? 'unpublish' : 'publish'}`}
                                    onClick={(e) => handleTogglePublish(e, model)}
                                >
                                    {model.is_published ? '⬇ Unpublish' : '⬆ Publish'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="create-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Product</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-field">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Classic Pillar Candle"
                                    value={newModel.name}
                                    onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                                />
                            </div>
                            <div className="modal-field">
                                <label>Description</label>
                                <textarea
                                    placeholder="Short description of the product..."
                                    value={newModel.description}
                                    onChange={e => setNewModel({ ...newModel, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="modal-field">
                                <label>Base Price (Rs.) *</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 25.00"
                                    min="0"
                                    step="0.01"
                                    value={newModel.base_price}
                                    onChange={e => setNewModel({ ...newModel, base_price: e.target.value })}
                                />
                            </div>
                            <div className="modal-field">
                                <label>Product Image</label>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                {newModelImage ? (
                                    <div className="uploaded-preview">
                                        <img src={newModelImage} alt="Preview" />
                                        <button onClick={() => setNewModelImage(null)} className="remove-img-btn">✕ Remove</button>
                                    </div>
                                ) : (
                                    <div
                                        className="image-upload-area"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        {uploadingImage ? (
                                            <span>Uploading...</span>
                                        ) : (
                                            <>
                                                <span className="upload-icon-lg">📷</span>
                                                <p>Click to upload product image</p>
                                                <small>PNG, JPG recommended</small>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="confirm-create-btn" onClick={handleCreateModel} disabled={creating}>
                                {creating ? 'Creating...' : '✓ Create Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Config Modal */}
            {showConfigModal && (
                <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
                    <div className="create-modal config-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Customization Fields - {configuringModel?.name}</h2>
                            <button className="modal-close" onClick={() => setShowConfigModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p className="config-instructions">
                                Select which customization fields users can edit. Only selected fields will be shown in the product configurator.
                            </p>
                            
                            {Object.entries(FIELD_CATEGORIES).map(([categoryKey, category]) => (
                                <div key={categoryKey} className="config-category">
                                    <h3 className="config-category-title">{category.name}</h3>
                                    <div className="config-fields-grid">
                                        {category.fields.map(fieldId => {
                                            const field = CUSTOMIZATION_FIELDS[fieldId];
                                            if (!field) return null;
                                            return (
                                                <div
                                                    key={fieldId}
                                                    className={`config-field-option ${selectedFields.includes(fieldId) ? 'selected' : ''}`}
                                                    onClick={() => toggleField(fieldId)}
                                                >
                                                    <span className="field-icon"><i className={`fas ${field.icon}`}></i></span>
                                                    <span className="field-name">{field.name}</span>
                                                    <span className="field-check">{selectedFields.includes(fieldId) ? '✓' : ''}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="config-summary">
                                <strong>Selected:</strong> {selectedFields.length} fields
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowConfigModal(false)}>Cancel</button>
                            <button className="confirm-create-btn" onClick={handleSaveConfig} disabled={savingConfig}>
                                {savingConfig ? 'Saving...' : '✓ Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
