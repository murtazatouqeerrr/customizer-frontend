import React, { useState } from 'react';
import axios from 'axios';
import './Checkout.css';

const API_URL = 'https://cusstomizer-backend-production.up.railway.app/api';

function Checkout({ product, selections, quantity, onBack, onComplete }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    companyName: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail) {
      alert('Please fill in your name and email');
      return;
    }

    // Client-side MOQ validation
    if (selections.moq && quantity < selections.moq) {
      alert(`Minimum order quantity is ${selections.moq}. Please go back and adjust.`);
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        modelId: product.id,
        modelName: product.name || product.id,
        quantity,
        selections: {
          glassColor: selections.glassColor,
          glassColorTier: selections.glassColorTier,
          fragrance: selections.fragrance,
          fragranceTier: selections.fragranceTier,
          waxColor: selections.waxColor,
          waxColorTier: selections.waxColorTier,
          decoration: selections.decoration,
          packaging: selections.packaging,
          labelText: selections.labelText,
          labelConfig: selections.labelConfig,
          artworkFile: selections.artworkFile,
          artworkUrl: selections.artworkUrl,
        },
        totalPrice: parseFloat(selections.pricing?.totalPrice || 0),
        unitPrice: parseFloat(selections.pricing?.unitPrice || 0),
        moq: selections.moq,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        companyName: formData.companyName,
        notes: formData.notes
      };

      const response = await axios.post(`${API_URL}/orders`, orderPayload);

      if (response.data.success) {
        setOrderComplete(true);
        setOrderNumber(response.data.order?.order_number || 'N/A');
      }
    } catch (err) {
      console.error('Order error:', err);
      const errMsg = err.response?.data?.error || 'Error submitting order. Please try again.';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout">
        <div className="checkout-success">
          <span className="success-icon">✅</span>
          <h2>Order Confirmed!</h2>
          <p className="order-number">Order #{orderNumber}</p>
          <p className="success-msg">
            Thank you, {formData.customerName}! Your order has been submitted successfully.
            We'll send a confirmation to <strong>{formData.customerEmail}</strong>.
          </p>
          <div className="success-summary">
            <div className="success-detail">
              <span>Product:</span> <strong>{product.name || product.id}</strong>
            </div>
            <div className="success-detail">
              <span>Quantity:</span> <strong>{quantity} pcs</strong>
            </div>
            <div className="success-detail">
              <span>Total:</span> <strong>${selections.pricing?.totalPrice || '0.00'}</strong>
            </div>
          </div>
          <button className="new-order-btn" onClick={onComplete}>
            Start New Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBack}>← Back to Review</button>
        <h2>Place Your Order</h2>
      </div>

      <div className="checkout-layout">
        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <h3>Order Summary</h3>
          <div className="sidebar-item">
            <span>Product</span>
            <strong>{product.name || product.id}</strong>
          </div>
          <div className="sidebar-item">
            <span>Quantity</span>
            <strong>{quantity} pcs</strong>
          </div>
          <div className="sidebar-item">
            <span>Unit Price</span>
            <strong>${selections.pricing?.unitPrice || '0.00'}</strong>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item total">
            <span>Total</span>
            <strong>${selections.pricing?.totalPrice || '0.00'}</strong>
          </div>
        </div>

        {/* Customer Form */}
        <div className="checkout-form-area">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Customer Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Full Name *</label>
                <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="customerEmail">Email Address *</label>
                <input type="email" id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleChange} required placeholder="john@company.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number</label>
                <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="+44 7700 900123" />
              </div>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="My Candle Brand Ltd" />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Order Notes</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any special instructions or requirements..." rows={3} />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
