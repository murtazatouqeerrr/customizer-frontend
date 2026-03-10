import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserCustomizer from './components/UserCustomizer';
import ProductConfigurator from './components/ProductConfigurator';
import Preview from './components/Preview';
import Checkout from './components/Checkout';
import './App.css';

// --- User flow wrapper ---
function UserApp() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderReview, setOrderReview] = useState(null);
  const [orderCheckout, setOrderCheckout] = useState(null);

  if (orderCheckout) {
    return (
      <Checkout
        product={orderCheckout.product}
        selections={orderCheckout.selections}
        quantity={orderCheckout.quantity}
        onBack={() => setOrderCheckout(null)}
        onComplete={() => {
          setOrderCheckout(null);
          setOrderReview(null);
          setSelectedProduct(null);
        }}
      />
    );
  }

  if (orderReview) {
    return (
      <Preview
        product={orderReview.product}
        selections={orderReview.selections}
        quantity={orderReview.quantity}
        onCheckout={() => setOrderCheckout(orderReview)}
        onBack={() => setOrderReview(null)}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductConfigurator
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNext={(selections, quantity) => setOrderReview({ product: selectedProduct, selections, quantity })}
        isAdmin={false}
      />
    );
  }

  return <UserDashboard onSelectProduct={setSelectedProduct} />;
}

// --- Main App with routing ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin dashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* User-facing storefront */}
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
