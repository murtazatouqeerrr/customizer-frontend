import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CategorySelection from './components/CategorySelection';
import ModelSelection from './components/ModelSelection';
import ProductConfigurator from './components/ProductConfigurator';
import Preview from './components/Preview';
import Checkout from './components/Checkout';
import './App.css';

function App() {
  // Flow: landing → category → models → configurator → preview → checkout
  const [step, setStep] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleStartCustomizing = () => {
    setStep('category');
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setStep('models');
  };

  const handleSelectModel = (product) => {
    setSelectedProduct(product);
    setStep('configurator');
  };

  const handleConfiguratorNext = (sel, qty) => {
    setSelections(sel);
    setQuantity(qty);
    setStep('preview');
  };

  const handleCheckout = () => {
    setStep('checkout');
  };

  const handleOrderComplete = () => {
    // Reset everything
    setStep('landing');
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSelections({});
    setQuantity(1);
  };

  return (
    <div className="app">
      {step === 'landing' && (
        <LandingPage onStart={handleStartCustomizing} />
      )}

      {step === 'category' && (
        <CategorySelection
          onSelectCategory={handleSelectCategory}
          onBack={() => setStep('landing')}
        />
      )}

      {step === 'models' && (
        <ModelSelection
          category={selectedCategory}
          onSelectModel={handleSelectModel}
          onBack={() => setStep('category')}
        />
      )}

      {step === 'configurator' && selectedProduct && (
        <ProductConfigurator
          product={selectedProduct}
          onNext={handleConfiguratorNext}
          onBack={() => setStep('models')}
        />
      )}

      {step === 'preview' && selectedProduct && (
        <Preview
          product={selectedProduct}
          selections={selections}
          quantity={quantity}
          onCheckout={handleCheckout}
          onBack={() => setStep('configurator')}
        />
      )}

      {step === 'checkout' && (
        <Checkout
          product={selectedProduct}
          selections={selections}
          quantity={quantity}
          onBack={() => setStep('preview')}
          onComplete={handleOrderComplete}
        />
      )}
    </div>
  );
}

export default App;
