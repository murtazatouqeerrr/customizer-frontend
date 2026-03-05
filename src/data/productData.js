// Product catalog with MOQ requirements
export const PRODUCT_CATEGORIES = {
  SCENTED_CANDLES: 'scented-candles',
  SQUARE_CANDLES: 'square-candles',
  SPECIAL_CANDLES: 'special-candles'
};

// Scented Candles in Glass/Jar
export const SCENTED_CANDLES = [
  {
    id: 'GL80',
    name: 'GL80 Round Glass',
    diameter: '80mm',
    category: PRODUCT_CATEGORIES.SCENTED_CANDLES,
    moq: {
      glassColor: {
        standard: { moq: 1, colors: ['White matt', 'Black matt'] },
        extra: { moq: 350, count: 2 },
        any: { moq: 3500 }
      },
      fragrance: {
        standard: { moq: 1, options: ['floral', 'woody', 'fresh', 'spicy', 'sandalwood'] },
        extended: { moq: 350, count: 12 },
        custom: { moq: 1750 }
      },
      waxColor: {
        standard: { moq: 1, color: 'white' },
        extra: { moq: 350, count: 2 }
      },
      decoration: {
        sticker: { moq: 1 },
        gummy: { moq: 30 },
        uvPrint: { moq: 350 }
      },
      packaging: {
        noBox: { moq: 1 },
        standardBox: { moq: 1 },
        printedBox: { moq: 20 },
        bottomLidBox: { moq: 350 }
      }
    }
  },
  {
    id: 'GL84',
    name: 'GL84 Round Glass',
    diameter: '84mm',
    category: PRODUCT_CATEGORIES.SCENTED_CANDLES,
    moq: {
      glassColor: {
        standard: { moq: 1, colors: ['White matt', 'Black matt'] },
        extra: { moq: 288, count: 2 },
        any: { moq: 2880 }
      },
      fragrance: {
        standard: { moq: 1, options: ['floral', 'woody', 'fresh', 'spicy', 'sandalwood'] },
        extended: { moq: 288, count: 12 },
        custom: { moq: 1440 }
      },
      waxColor: {
        standard: { moq: 1, color: 'white' },
        extra: { moq: 288, count: 2 }
      },
      decoration: {
        sticker: { moq: 1 },
        gummy: { moq: 30 },
        uvPrint: { moq: 288 }
      },
      packaging: {
        noBox: { moq: 1 },
        standardBox: { moq: 1 },
        printedBox: { moq: 20 },
        bottomLidBox: { moq: 288 }
      }
    }
  },
  {
    id: 'GL110',
    name: 'GL110 Round Glass',
    diameter: '100mm',
    category: PRODUCT_CATEGORIES.SCENTED_CANDLES,
    moq: {
      glassColor: {
        standard: { moq: 1, colors: ['White matt', 'Black matt'] },
        extra: { moq: 150, count: 2 },
        any: { moq: 1500 }
      },
      fragrance: {
        standard: { moq: 1, options: ['floral', 'woody', 'fresh', 'spicy', 'sandalwood'] },
        extended: { moq: 150, count: 12 },
        custom: { moq: 750 }
      },
      waxColor: {
        standard: { moq: 1, color: 'white' },
        extra: { moq: 150, count: 2 }
      },
      decoration: {
        sticker: { moq: 1 },
        gummy: { moq: 30 },
        uvPrint: { moq: 150 }
      },
      packaging: {
        noBox: { moq: 1 },
        standardBox: { moq: 1 },
        printedBox: { moq: 20 },
        bottomLidBox: { moq: 150 }
      }
    }
  },
  {
    id: 'GL140',
    name: 'GL140 Round Glass',
    diameter: '140mm',
    category: PRODUCT_CATEGORIES.SCENTED_CANDLES,
    moq: {
      glassColor: {
        standard: { moq: 1, colors: ['White matt', 'Black matt'] },
        extra: { moq: 108, count: 2 },
        any: { moq: 1080 }
      },
      fragrance: {
        standard: { moq: 1, options: ['floral', 'woody', 'fresh', 'spicy', 'sandalwood'] },
        extended: { moq: 108, count: 12 },
        custom: { moq: 540 }
      },
      waxColor: {
        standard: { moq: 1, color: 'white' },
        extra: { moq: 108, count: 2 }
      },
      decoration: {
        sticker: { moq: 1 },
        gummy: { moq: 30 },
        uvPrint: { moq: 108 }
      },
      packaging: {
        noBox: { moq: 1 },
        standardBox: { moq: 1 },
        printedBox: { moq: 20 },
        bottomLidBox: { moq: 108 }
      }
    }
  },
  {
    id: 'GL170',
    name: 'GL170 Round Glass',
    diameter: '170mm',
    category: PRODUCT_CATEGORIES.SCENTED_CANDLES,
    moq: {
      glassColor: {
        standard: { moq: 1, colors: ['White matt', 'Black matt'] },
        extra: { moq: 60, count: 2 },
        any: { moq: 600 }
      },
      fragrance: {
        standard: { moq: 1, options: ['floral', 'woody', 'fresh', 'spicy', 'sandalwood'] },
        extended: { moq: 60, count: 12 },
        custom: { moq: 300 }
      },
      waxColor: {
        standard: { moq: 1, color: 'white' },
        extra: { moq: 60, count: 2 }
      },
      decoration: {
        sticker: { moq: 1 },
        gummy: { moq: 30 },
        uvPrint: { moq: 60 }
      },
      packaging: {
        noBox: { moq: 1 },
        standardBox: { moq: 1 },
        printedBox: { moq: 20 },
        bottomLidBox: { moq: 60 }
      }
    }
  }
];

// Square Candles (Bespoke)
export const SQUARE_CANDLES = [
  {
    id: 'SQ70x70x160',
    name: 'Square Candle 70x70x160',
    base: '70x70mm',
    height: '160mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ70x70x220',
    name: 'Square Candle 70x70x220',
    base: '70x70mm',
    height: '220mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ70x70x280',
    name: 'Square Candle 70x70x280',
    base: '70x70mm',
    height: '280mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ105x105x160',
    name: 'Square Candle 105x105x160',
    base: '105x105mm',
    height: '160mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ105x105x220',
    name: 'Square Candle 105x105x220',
    base: '105x105mm',
    height: '220mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ105x105x300',
    name: 'Square Candle 105x105x300',
    base: '105x105mm',
    height: '300mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'SQ125x125x180',
    name: 'Square Candle 125x125x180',
    base: '125x125mm',
    height: '180mm',
    category: PRODUCT_CATEGORIES.SQUARE_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  }
];

// Special Candles
export const SPECIAL_CANDLES = [
  {
    id: 'HU1',
    name: 'HU1 - 2 Candles Connected with Rope',
    description: '2 candles connected with rope (base is 70/70/160)',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU3',
    name: 'HU3 - 1 Candle with Rope',
    description: '1 candle with rope',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU5',
    name: 'HU5 - 1 Candle with 2 Rings',
    description: '1 candle with 2 rings',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU7',
    name: 'HU7 - 2 Candles with 2 Rings and Stick',
    description: '2 candles with 2 rings and stick',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU13',
    name: 'HU13 - 2 Candles Connected with Rope',
    description: '2 candles connected with rope (base is 70/70/220)',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU18',
    name: 'HU18 - 2 Pieces of Puzzle',
    description: '2 pieces of puzzle with ring and rope',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  },
  {
    id: 'HU23',
    name: 'HU23 - 1 Candle with 2 Rings',
    description: '1 candle with 2 rings',
    category: PRODUCT_CATEGORIES.SPECIAL_CANDLES,
    options: {
      addOn: ['hearts', 'feet', 'hands'],
      nameOnCandle: true,
      uploadPicture: true,
      chooseFont: true
    }
  }
];

// Helper function to get MOQ for a specific option
export const getMOQ = (productId, optionType, optionValue) => {
  const product = SCENTED_CANDLES.find(p => p.id === productId);
  if (!product || !product.moq) return 1;

  const moqData = product.moq[optionType];
  if (!moqData) return 1;

  // Return MOQ based on option value
  if (typeof moqData[optionValue] === 'object') {
    return moqData[optionValue].moq;
  }

  return 1;
};

// Calculate total MOQ based on all selections
export const calculateTotalMOQ = (productId, selections) => {
  const product = SCENTED_CANDLES.find(p => p.id === productId);
  if (!product || !product.moq) return 1;

  let maxMOQ = 1;

  // Check each selection and find the highest MOQ
  Object.keys(selections).forEach(key => {
    const selection = selections[key];
    const moqData = product.moq[key];
    
    if (moqData && selection) {
      const moq = moqData[selection]?.moq || 1;
      if (moq > maxMOQ) {
        maxMOQ = moq;
      }
    }
  });

  return maxMOQ;
};

// Get all products
export const getAllProducts = () => {
  return [...SCENTED_CANDLES, ...SQUARE_CANDLES, ...SPECIAL_CANDLES];
};

// Get products by category
export const getProductsByCategory = (category) => {
  switch(category) {
    case PRODUCT_CATEGORIES.SCENTED_CANDLES:
      return SCENTED_CANDLES;
    case PRODUCT_CATEGORIES.SQUARE_CANDLES:
      return SQUARE_CANDLES;
    case PRODUCT_CATEGORIES.SPECIAL_CANDLES:
      return SPECIAL_CANDLES;
    default:
      return [];
  }
};
