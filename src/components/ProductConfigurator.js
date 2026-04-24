import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import AreaEditor from "./AreaEditor";
import { loadMOQFromCSV, FALLBACK_MOQ_RULES } from "../utils/moqLoader";
import "./ProductConfigurator.css";

const API_URL = "https://customizer-backend-lxfe.onrender.com/api";

// Default customizable area bounds (used if not configured)
const DEFAULT_BOUNDS = { x: 75, y: 32, w: 200, h: 298 };

// --- Konva Draggable/Resizable Components ---

const TransformableRect = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  fill,
  bounds = DEFAULT_BOUNDS,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        fill={fill}
        opacity={0.25}
        cornerRadius={10}
        draggable
        dragBoundFunc={(pos) => {
          // Restrict movement to customizable area
          const node = shapeRef.current;
          if (!node) return pos;
          const scaleX = node.scaleX() || 1;
          const scaleY = node.scaleY() || 1;
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;

          return {
            x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
            y: Math.max(
              bounds.y,
              Math.min(bounds.y + bounds.h - height, pos.y),
            ),
          };
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const TransformableText = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  text,
  fontSize,
  fontFamily,
  fontColor,
  bounds = DEFAULT_BOUNDS,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        text={text}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={fontColor}
        align="center"
        verticalAlign="middle"
        draggable
        dragBoundFunc={(pos) => {
          const node = shapeRef.current;
          if (!node) return pos;
          const scaleX = node.scaleX() || 1;
          const scaleY = node.scaleY() || 1;
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;

          return {
            x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
            y: Math.max(
              bounds.y,
              Math.min(bounds.y + bounds.h - height, pos.y),
            ),
          };
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const TransformableImage = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  src,
  bounds = DEFAULT_BOUNDS,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const [image] = useImage(src, "anonymous");

  React.useEffect(() => {
    if (isSelected && image && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, image]);

  if (!image) return null;

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        image={image}
        draggable
        dragBoundFunc={(pos) => {
          const node = shapeRef.current;
          if (!node) return pos;
          const scaleX = node.scaleX() || 1;
          const scaleY = node.scaleY() || 1;
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;

          return {
            x: Math.max(bounds.x, Math.min(bounds.x + bounds.w - width, pos.x)),
            y: Math.max(
              bounds.y,
              Math.min(bounds.y + bounds.h - height, pos.y),
            ),
          };
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// Canvas background Helper
const CanvasBackground = ({ src }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={350}
      height={420}
      name="background"
    />
  ) : null;
};

// ---- Data Definitions ----

// Available customization fields for admin configuration
export const CUSTOMIZATION_FIELDS = {
  baseImage: {
    id: "baseImage",
    name: "Base Product Image",
    icon: "fa-image",
    category: "general",
  },
  quantity: {
    id: "quantity",
    name: "Order Quantity",
    icon: "fa-chart-bar",
    category: "general",
  },
  glassType: {
    id: "glassType",
    name: "Glass Type & Size",
    icon: "fa-wine-glass",
    category: "scented",
  },
  glassColor: {
    id: "glassColor",
    name: "Glass Color",
    icon: "fa-palette",
    category: "scented",
  },
  fragrance: {
    id: "fragrance",
    name: "Fragrance",
    icon: "fa-spray-can",
    category: "scented",
  },
  waxColor: {
    id: "waxColor",
    name: "Wax Color",
    icon: "fa-fire",
    category: "scented",
  },
  decoration: {
    id: "decoration",
    name: "Decoration Method",
    icon: "fa-image",
    category: "scented",
  },
  packaging: {
    id: "packaging",
    name: "Packaging",
    icon: "fa-box",
    category: "scented",
  },
  labelText: {
    id: "labelText",
    name: "Label Text & Styling",
    icon: "fa-pen",
    category: "branding",
  },
  artwork: {
    id: "artwork",
    name: "Artwork / Branding Upload",
    icon: "fa-file-upload",
    category: "branding",
  },
  squareCandle: {
    id: "squareCandle",
    name: "Square Candle Size",
    icon: "fa-square",
    category: "square",
  },
  specialCandle: {
    id: "specialCandle",
    name: "Special Candle Type",
    icon: "fa-star",
    category: "special",
  },
  addOns: {
    id: "addOns",
    name: "Add-on Decorations",
    icon: "fa-plus",
    category: "square-special",
  },
  nameOnCandle: {
    id: "nameOnCandle",
    name: "Name on Candle",
    icon: "fa-pen",
    category: "square-special",
  },
  customizableArea: {
    id: "customizableArea",
    name: "Customizable Area",
    icon: "fa-crop",
    category: "general",
  },
};

export const CUSTOMIZATION_FIELD_IDS = Object.keys(CUSTOMIZATION_FIELDS);

// --- Konva Draggable/Resizable Components ---

// Get fields by category
export const getFieldsByCategory = (category) => {
  return Object.values(CUSTOMIZATION_FIELDS).filter(
    (f) => f.category === category,
  );
};

// Glass Types with dimensions
const GLASS_TYPES = [
  {
    id: "GL80",
    name: "GL80",
    diameter: "80mm",
    dimensions: "80mm diameter (round)",
    height: "Standard",
  },
  {
    id: "GL84",
    name: "GL84",
    diameter: "84mm",
    dimensions: "84mm diameter (round)",
    height: "Standard",
  },
  {
    id: "GL110",
    name: "GL110",
    diameter: "100mm",
    dimensions: "100mm diameter (round)",
    height: "Standard",
  },
  {
    id: "GL140",
    name: "GL140",
    diameter: "140mm",
    dimensions: "140mm diameter (round)",
    height: "Standard",
  },
  {
    id: "GL170",
    name: "GL170",
    diameter: "170mm",
    dimensions: "170mm diameter (round)",
    height: "Standard",
  },
];

// Square Candle Sizes
const SQUARE_CANDLE_SIZES = [
  { id: "SQ70x70x160", name: "70x70x160mm", base: "70x70mm", height: "160mm" },
  { id: "SQ70x70x220", name: "70x70x220mm", base: "70x70mm", height: "220mm" },
  { id: "SQ70x70x280", name: "70x70x280mm", base: "70x70mm", height: "280mm" },
  {
    id: "SQ105x105x160",
    name: "105x105x160mm",
    base: "105x105mm",
    height: "160mm",
  },
  {
    id: "SQ105x105x220",
    name: "105x105x220mm",
    base: "105x105mm",
    height: "220mm",
  },
  {
    id: "SQ105x105x300",
    name: "105x105x300mm",
    base: "105x105mm",
    height: "300mm",
  },
  {
    id: "SQ125x125x180",
    name: "125x125x180mm",
    base: "125x125mm",
    height: "180mm",
  },
];

// Special Candle Configurations
const SPECIAL_CANDLES = [
  {
    id: "HU1",
    name: "HU1",
    description: "2 Candles Connected with Rope",
    icon: "🪢",
  },
  { id: "HU3", name: "HU3", description: "1 Candle with Rope", icon: "🪢" },
  { id: "HU5", name: "HU5", description: "1 Candle with 2 Rings", icon: "💍" },
  {
    id: "HU7",
    name: "HU7",
    description: "2 Candles with 2 Rings and Stick",
    icon: "🎋",
  },
  {
    id: "HU13",
    name: "HU13",
    description: "2 Candles Connected with Rope",
    icon: "🪢",
  },
  { id: "HU18", name: "HU18", description: "2 Pieces of Puzzle", icon: "🧩" },
  {
    id: "HU23",
    name: "HU23",
    description: "1 Candle with 2 Rings",
    icon: "💍",
  },
];

// Add-ons for Square and Special candles
const ADD_ONS = [
  { id: "hearts", name: "Hearts", icon: "❤️" },
  { id: "feet", name: "Feet", icon: "🦶" },
  { id: "hands", name: "Hands", icon: "🖐️" },
];

const GLASS_COLORS = {
  standard: [
    { id: "ivory", name: "Ivory", hex: "#fffff0" },
    { id: "black-matt", name: "Black Matt", hex: "#2a2a2a" },
  ],
  extra: [
    { id: "amber", name: "Amber", hex: "#d4900a" },
    { id: "green", name: "Green", hex: "#4a7c59" },
    { id: "pink", name: "Pink", hex: "#e8a0bf" },
    { id: "navy", name: "Navy", hex: "#1e3a5f" },
    { id: "burgundy", name: "Burgundy", hex: "#722f37" },
    { id: "teal", name: "Teal", hex: "#2c7873" },
    { id: "coral", name: "Coral", hex: "#ff7f50" },
    { id: "lavender", name: "Lavender", hex: "#e6e6fa" },
    { id: "sage", name: "Sage", hex: "#9dc183" },
    { id: "rust", name: "Rust", hex: "#b7410e" },
  ],
};

const FRAGRANCES = {
  standard: [
    { id: "floral", name: "Floral", icon: "fa-spray-can" },
    { id: "woody", name: "Woody", icon: "fa-tree" },
    { id: "fresh", name: "Fresh", icon: "fa-leaf" },
    { id: "spicy", name: "Spicy", icon: "fa-pepper-hot" },
    { id: "sandalwood", name: "Sandalwood", icon: "fa-tree" },
  ],
  extended: [
    { id: "test", name: "Test", icon: "fa-flask" },
    { id: "vanilla", name: "Vanilla", icon: "fa-ice-cream" },
    { id: "lavender", name: "Lavender", icon: "fa-heart" },
    { id: "citrus", name: "Citrus", icon: "fa-lemon" },
    { id: "ocean", name: "Ocean Breeze", icon: "fa-water" },
    { id: "rose", name: "Rose", icon: "fa-rose" },
    { id: "cinnamon", name: "Cinnamon", icon: "fa-seedling" },
    { id: "jasmine", name: "Jasmine", icon: "fa-flower" },
    { id: "honey", name: "Honey", icon: "fa-honey-pot" },
    { id: "peppermint", name: "Peppermint", icon: "fa-candy-cane" },
    { id: "eucalyptus", name: "Eucalyptus", icon: "fa-spa" },
    { id: "bergamot", name: "Bergamot", icon: "fa-citrus" },
    { id: "patchouli", name: "Patchouli", icon: "fa-leaf" },
  ],
  custom: [
    { id: "custom-fragrance", name: "Own Custom Fragrance", icon: "fa-star" },
  ],
};

const WAX_COLORS = {
  standard: [{ id: "white", name: "White", hex: "#fefefe" }],
  extra: [
    { id: "ivory", name: "Ivory", hex: "#fffff0" },
    { id: "cream", name: "Cream", hex: "#fffdd0" },
  ],
};

const DECORATIONS = [
  { id: "sticker", name: "Sticker", icon: "fa-tag", moqKey: "sticker" },
  { id: "gummy", name: "Gummy Sticker", icon: "fa-bookmark", moqKey: "gummy" },
  { id: "uvPrint", name: "UV Print", icon: "fa-print", moqKey: "uvPrint" },
];

const PACKAGING = [
  { id: "noBox", name: "No Box", icon: "fa-box", moqKey: "noBox" },
  {
    id: "standardBox",
    name: "Standard Box + Sticker",
    icon: "fa-gift",
    moqKey: "standardBox",
  },
  {
    id: "printedBox",
    name: "Full Printed Box",
    icon: "fa-image",
    moqKey: "printedBox",
  },
  {
    id: "bottomLidBox",
    name: "Bottom Lid Box",
    icon: "fa-inbox",
    moqKey: "bottomLidBox",
  },
];

const FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

function ProductConfigurator({ product, onNext, onBack, isAdmin }) {
  // Debug: Log admin_config for debugging
  console.log("Product admin_config:", product.admin_config);
  console.log("Product category:", product.category);

  // Get admin config - array of enabled field IDs
  // Handle both array and string (JSON) formats from database
  let adminConfig = product.admin_config || [];
  if (typeof adminConfig === "string") {
    try {
      adminConfig = JSON.parse(adminConfig);
    } catch (e) {
      adminConfig = [];
    }
  }
  console.log("Parsed adminConfig:", adminConfig);

  const isConfigEnabled = (fieldId) => {
    // If admin config is empty, show all fields by default
    if (!adminConfig || adminConfig.length === 0) return true;
    const result = adminConfig.includes(fieldId);
    console.log(`isConfigEnabled(${fieldId}):`, result);
    return result;
  };

  // State
  const [quantity, setQuantity] = useState(1);
  const [moqData, setMoqData] = useState(null);
  const [availableOptions, setAvailableOptions] = useState(null);
  const [csvMoqRules, setCsvMoqRules] = useState(FALLBACK_MOQ_RULES);
  const [productCategory, setProductCategory] = useState(
    product.category || "scented-candles",
  );
  const [expandedSections, setExpandedSections] = useState({
    quantity: true,
    glassType: true,
    glassColor: true,
    fragrance: true,
    waxColor: true,
    decoration: true,
    packaging: true,
    labelText: true,
    artwork: true,
    baseImage: true,
    squareCandle: true,
    specialCandle: true,
    addOns: true,
    nameOnCandle: true,
    customizableArea: true,
  });

  // Selections - Scented Candles
  const [selectedGlassType, setSelectedGlassType] = useState("GL80");
  const [selectedGlassColor, setSelectedGlassColor] = useState(null);
  const [glassColorTier, setGlassColorTier] = useState("standard");
  const [selectedFragrance, setSelectedFragrance] = useState(null);
  const [fragranceTier, setFragranceTier] = useState("standard");
  const [selectedWaxColor, setSelectedWaxColor] = useState("white");
  const [waxColorTier, setWaxColorTier] = useState("standard");
  const [selectedDecoration, setSelectedDecoration] = useState("sticker");
  const [selectedPackaging, setSelectedPackaging] = useState("noBox");

  // Selections - Square Candles & Specials
  const [selectedSquareSize, setSelectedSquareSize] = useState("SQ70x70x160");
  const [selectedSpecial, setSelectedSpecial] = useState("HU1");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [nameOnCandle, setNameOnCandle] = useState("");

  // Text & Artwork
  const [labelText, setLabelText] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontColor, setFontColor] = useState("#000000");

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [baseImage, setBaseImage] = useState(null);
  const [baseImageUrl, setBaseImageUrl] = useState(null);

  const [isPublished, setIsPublished] = useState(product.is_published || false);
  const [publishLoading, setPublishLoading] = useState(false);

  const fileInputRef = useRef(null);
  const baseImageInputRef = useRef(null);

  // Draggable Transforms State
  const [selectedShape, setSelectedShape] = useState(null);
  const [glassColorProps, setGlassColorProps] = useState({
    x: 75,
    y: 50,
    width: 200,
    height: 280,
    rotation: 0,
  });
  const [textProps, setTextProps] = useState({
    x: 50,
    y: 160,
    width: 250,
    height: 50,
    rotation: 0,
  });
  const [artworkProps, setArtworkProps] = useState({
    x: 125,
    y: 150,
    width: 100,
    height: 100,
    rotation: 0,
  });

  // Get customizable area from admin config
  const customizableAreaConfig = product.customizable_area || null;
  const isAreaEnabled =
    customizableAreaConfig && customizableAreaConfig.enabled;
  const areaBounds = customizableAreaConfig
    ? {
        x: customizableAreaConfig.x || 75,
        y: customizableAreaConfig.y || 32,
        w: customizableAreaConfig.width || 200,
        h: customizableAreaConfig.height || 298,
      }
    : DEFAULT_BOUNDS;

  // Admin area editor state
  const [areaEditorOpen, setAreaEditorOpen] = useState(false);
  const [areaSettings, setAreaSettings] = useState(
    () =>
      customizableAreaConfig || {
        enabled: false,
        x: 75,
        y: 32,
        width: 200,
        height: 298,
      },
  );

  const [visibleSections, setVisibleSections] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `product_configs_visible_${product.id}`,
      );
      const parsed = saved ? JSON.parse(saved) : null;

      // If localStorage exists, check if it matches admin config - if not, reset
      if (parsed && adminConfig.length > 0) {
        const hasAllFields = adminConfig.every(
          (field) => parsed[field] !== false,
        );
        if (!hasAllFields) {
          // Admin config has changed, reset visible sections
          console.log("Resetting visibleSections due to admin config change");
          localStorage.removeItem(`product_configs_visible_${product.id}`);
          return null;
        }
      }

      return parsed
        ? JSON.parse(saved)
        : {
            baseImage: isConfigEnabled("baseImage"),
            quantity: isConfigEnabled("quantity"),
            glassType: isConfigEnabled("glassType"),
            glassColor: isConfigEnabled("glassColor"),
            fragrance: isConfigEnabled("fragrance"),
            waxColor: isConfigEnabled("waxColor"),
            decoration: isConfigEnabled("decoration"),
            packaging: isConfigEnabled("packaging"),
            labelText: isConfigEnabled("labelText"),
            artwork: isConfigEnabled("artwork"),
            squareCandle: isConfigEnabled("squareCandle"),
            specialCandle: isConfigEnabled("specialCandle"),
            addOns: isConfigEnabled("addOns"),
            nameOnCandle: isConfigEnabled("nameOnCandle"),
            customizableArea: isConfigEnabled("customizableArea"),
          };
    } catch {
      return {
        baseImage: isConfigEnabled("baseImage"),
        quantity: isConfigEnabled("quantity"),
        glassType: isConfigEnabled("glassType"),
        glassColor: isConfigEnabled("glassColor"),
        fragrance: isConfigEnabled("fragrance"),
        waxColor: isConfigEnabled("waxColor"),
        decoration: isConfigEnabled("decoration"),
        packaging: isConfigEnabled("packaging"),
        labelText: isConfigEnabled("labelText"),
        artwork: isConfigEnabled("artwork"),
        squareCandle: isConfigEnabled("squareCandle"),
        specialCandle: isConfigEnabled("specialCandle"),
        addOns: isConfigEnabled("addOns"),
        nameOnCandle: isConfigEnabled("nameOnCandle"),
        customizableArea: isConfigEnabled("customizableArea"),
      };
    }
  });

  const toggleVisibleSection = (e, key) => {
    e.stopPropagation();
    const nextVis = { ...visibleSections, [key]: !visibleSections[key] };
    setVisibleSections(nextVis);
    localStorage.setItem(
      `product_configs_visible_${product.id}`,
      JSON.stringify(nextVis),
    );
  };

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId],
    );
  };

  // Save customizable area settings
  const [savingArea, setSavingArea] = useState(false);
  const handleSaveArea = async () => {
    setSavingArea(true);
    try {
      await axios.put(`${API_URL}/models/${product.id}`, {
        customizable_area: areaSettings,
      });
      alert("Customizable area saved!");
    } catch (err) {
      console.error("Error saving area:", err);
      alert("Error saving area settings");
    } finally {
      setSavingArea(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishLoading(true);
    try {
      const res = await axios.put(`${API_URL}/models/${product.id}/publish`);
      setIsPublished(res.data.is_published);
    } catch (err) {
      console.error("Error toggling publish:", err);
      alert("Error updating publish status");
    } finally {
      setPublishLoading(false);
    }
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.name() === "background";
    if (clickedOnEmpty) {
      setSelectedShape(null);
    }
  };

  // Debug product category
  console.log("productCategory:", productCategory);
  console.log("product.moq:", product.moq);

  // Is this a scented candle with MOQ rules?
  const isScentedCandle = productCategory === "scented-candles" || product.moq;
  const isSquareCandle = productCategory === "square-candles";
  const isSpecialCandle = productCategory === "special-candles";

  console.log("isScentedCandle:", isScentedCandle);
  console.log("isSquareCandle:", isSquareCandle);
  console.log("isSpecialCandle:", isSpecialCandle);

  // Load MOQ rules from CSV on component mount
  useEffect(() => {
    const loadCSV = async () => {
      const rules = await loadMOQFromCSV(`${API_URL}/csv/moq`);
      setCsvMoqRules(rules);
    };
    loadCSV();
  }, []);

  // Fetch MOQ data when glass type or quantity changes
  useEffect(() => {
    if (isScentedCandle && selectedGlassType) {
      const fetchMOQ = async () => {
        try {
          const response = await axios.post(`${API_URL}/moq/check`, {
            glassType: selectedGlassType,
            quantity,
            selections: {
              glassColorTier,
              fragranceTier,
              waxColorTier,
              decoration: selectedDecoration,
              packaging: selectedPackaging,
            },
          });
          setMoqData(response.data);
          setAvailableOptions(response.data.availableOptions);
        } catch (error) {
          console.error("Error fetching MOQ:", error);
        }
      };
      fetchMOQ();
    }
  }, [
    selectedGlassType,
    quantity,
    glassColorTier,
    fragranceTier,
    waxColorTier,
    selectedDecoration,
    selectedPackaging,
    isScentedCandle,
  ]);

  // Calculate current MOQ requirement
  const getCurrentMOQ = () => {
    if (moqData && moqData.minimumMOQ) {
      return moqData.minimumMOQ;
    }
    return 1;
  };

  const currentMOQ = getCurrentMOQ();
  const moqMet = moqData ? moqData.moqMet : quantity >= currentMOQ;

  // Check if an option tier is unlocked
  const isTierUnlocked = (category, tierKey) => {
    if (!availableOptions) {
      console.log("No availableOptions yet");
      return false; // Default to locked until data loads
    }

    // Map frontend category names to backend response
    const categoryMap = {
      fragrance: "fragrances",
      glassColor: "glassColors",
      waxColor: "waxColors",
      decoration: "decorations",
      packaging: "packaging",
    };

    const backendCategory = categoryMap[category] || category;

    if (!availableOptions[backendCategory]) {
      console.log(`Category ${backendCategory} not found in availableOptions`);
      return false;
    }

    const isUnlocked = availableOptions[backendCategory][tierKey] === true;
    console.log(`isTierUnlocked(${category}, ${tierKey}):`, isUnlocked);
    return isUnlocked;
  };

  const getOptionMOQ = (category, key) => {
    const rules = csvMoqRules[selectedGlassType];
    if (!rules) return 1;

    const mapping = {
      glassColor: { extra: "extraColors", any: "anyColor" },
      fragrance: { extended: "extraFragrances", custom: "ownFragrance" },
      waxColor: { extra: "extraWaxColors" },
      decorations: { gummy: "gummy", uvPrint: "uvPrint" },
      packaging: { printedBox: "printedBox", bottomLidBox: "bottomLidBox" },
    };

    if (mapping[category] && mapping[category][key]) {
      return rules[mapping[category][key]] || 1;
    }
    return 1;
  };

  const getMoqBadgeClass = (moq) => {
    if (moq <= 1) return "moq-low";
    if (moq < 500) return "moq-med";
    return "moq-high";
  };

  // Dynamic pricing
  const calculatePrice = () => {
    let basePrice = 5.0;
    let unitPrice = basePrice;

    // Scented Candle pricing
    if (isScentedCandle) {
      if (glassColorTier === "extra") unitPrice += 0.5;
      if (fragranceTier === "extended") unitPrice += 0.75;
      if (fragranceTier === "custom") unitPrice += 2.0;
      if (waxColorTier === "extra") unitPrice += 0.3;
      if (selectedDecoration === "gummy") unitPrice += 0.4;
      if (selectedDecoration === "uvPrint") unitPrice += 1.0;
      if (selectedPackaging === "standardBox") unitPrice += 0.5;
      if (selectedPackaging === "printedBox") unitPrice += 1.5;
      if (selectedPackaging === "bottomLidBox") unitPrice += 2.0;
    }

    // Square Candle pricing
    if (isSquareCandle) {
      // Different base prices for different sizes
      const sizePrices = {
        SQ70x70x160: 8.0,
        SQ70x70x220: 10.0,
        SQ70x70x280: 12.0,
        SQ105x105x160: 12.0,
        SQ105x105x220: 15.0,
        SQ105x105x300: 18.0,
        SQ125x125x180: 15.0,
      };
      basePrice = sizePrices[selectedSquareSize] || 10.0;
      unitPrice = basePrice;
      // Add-on pricing
      if (selectedAddOns.length > 0) unitPrice += selectedAddOns.length * 1.5;
      if (nameOnCandle) unitPrice += 2.0;
    }

    // Special Candle pricing
    if (isSpecialCandle) {
      basePrice = 15.0;
      unitPrice = basePrice;
      // Add-on pricing
      if (selectedAddOns.length > 0) unitPrice += selectedAddOns.length * 1.5;
      if (nameOnCandle) unitPrice += 2.0;
    }

    let discount = 1;
    if (quantity >= 1000) discount = 0.85;
    else if (quantity >= 500) discount = 0.9;
    else if (quantity >= 100) discount = 0.95;

    unitPrice = unitPrice * discount;
    return {
      unitPrice: unitPrice.toFixed(2),
      totalPrice: (unitPrice * quantity).toFixed(2),
    };
  };

  const pricing = calculatePrice();

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // File uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", response.data);
      setUploadedFile(file.name);
      // Use localhost URL for the uploaded image
      const baseUrl = API_URL.replace("/api", "");
      const fullUrl = `${baseUrl}${response.data.url}`;
      console.log("Full image URL:", fullUrl);
      setUploadedFileUrl(fullUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
  };

  const handleBaseImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBaseImage(file.name);
      const baseUrl = API_URL.replace("/api", "");
      const imageUrl = `${baseUrl}${response.data.url}`;
      setBaseImageUrl(imageUrl);

      if (isAdmin && product.id) {
        await axios.put(`${API_URL}/models/${product.id}`, {
          image_url: imageUrl,
        });
        alert("Base image saved!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading base image");
    }
  };

  const removeBaseImage = async () => {
    setBaseImage(null);
    setBaseImageUrl(null);
    if (isAdmin && product.id) {
      try {
        await axios.put(`${API_URL}/models/${product.id}`, { image_url: null });
      } catch (err) {
        console.error(err);
      }
    }
  };
  const handleNext = () => {
    if (!moqMet) {
      alert(
        `Minimum order quantity is ${currentMOQ}. Please adjust your quantity.`,
      );
      return;
    }

    const glassColorHex =
      [...GLASS_COLORS.standard, ...GLASS_COLORS.extra].find(
        (c) => c.id === selectedGlassColor,
      )?.hex || "transparent";

    const selections = {
      // Product Category
      productCategory,
      // Glass Type
      glassType: selectedGlassType,
      // Glass Color
      glassColor: selectedGlassColor,
      glassColorHex,
      glassColorProps,
      glassColorTier,
      // Fragrance
      fragrance: selectedFragrance,
      fragranceTier,
      // Wax Color
      waxColor: selectedWaxColor,
      waxColorTier,
      // Decoration & Packaging
      decoration: selectedDecoration,
      packaging: selectedPackaging,
      // Text & Artwork
      labelText,
      textProps,
      labelConfig: { fontSize, fontFamily, fontColor },
      artworkFile: uploadedFile,
      artworkUrl: uploadedFileUrl,
      artworkProps,
      baseImageUrl,
      // Square Candle Options
      squareSize: selectedSquareSize,
      addOns: selectedAddOns,
      candleName: nameOnCandle,
      // Special Candle Options
      specialType: selectedSpecial,
      // Pricing
      pricing: { unitPrice: pricing.unitPrice, totalPrice: pricing.totalPrice },
      moq: currentMOQ,
    };

    onNext(selections, quantity);
  };

  const renderOptionChip = (opt, isSelected, onSelect, moq, locked) => (
    <div
      key={opt.id}
      className={`option-chip ${isSelected ? "selected" : ""} ${locked ? "locked" : ""}`}
      onClick={() => !locked && onSelect(opt.id)}
      title={locked ? `Requires MOQ ${moq}+` : ""}
    >
      {opt.icon && <i className={`fas ${opt.icon}`}></i>}
      <span>{opt.name}</span>
      {moq > 1 && (
        <span className={`moq-badge ${getMoqBadgeClass(moq)}`}>MOQ {moq}</span>
      )}
      {locked && <i className="fas fa-lock"></i>}
    </div>
  );

  return (
    <div className="configurator-container">
      {/* Top Bar */}
      <div
        className="configurator-top-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>{product.name || product.id}</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: isPublished ? "#4CAF50" : "#f44336",
                }}
              >
                {isPublished ? "● Published" : "○ Draft"}
              </span>
              <button
                onClick={handleTogglePublish}
                disabled={publishLoading}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  background: isPublished ? "#333" : "#FF9800",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {publishLoading
                  ? "..."
                  : isPublished
                    ? "Unpublish"
                    : "Publish to Store"}
              </button>
            </div>
          )}
          <div className="price-display">
            <span className="price-label">Total</span>
            <span className="price-value">${pricing.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="configurator-body">
        {/* Left: Preview */}
        <div className="configurator-preview">
          <p
            className="preview-instructions"
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            Click elements in the preview to move and resize them.
          </p>
          <div className="preview-canvas-container">
            <Stage
              width={350}
              height={420}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
            >
              <Layer>
                {/* Base Image */}
                {(baseImageUrl || product.image_url) && (
                  <CanvasBackground src={baseImageUrl || product.image_url} />
                )}

                {/* Customizable Area Indicator (shown to users when enabled) */}
                {isAreaEnabled && !isAdmin && (
                  <Rect
                    x={areaBounds.x}
                    y={areaBounds.y}
                    width={areaBounds.w}
                    height={areaBounds.h}
                    fill="rgba(102, 126, 234, 0.1)"
                    stroke="#667eea"
                    strokeWidth={1}
                    dash={[5, 5]}
                    cornerRadius={4}
                  />
                )}

                {/* Glass color overlay */}
                {selectedGlassColor && (
                  <TransformableRect
                    shapeProps={glassColorProps}
                    isSelected={selectedShape === "glassColor"}
                    onSelect={() => setSelectedShape("glassColor")}
                    onChange={setGlassColorProps}
                    fill={
                      [...GLASS_COLORS.standard, ...GLASS_COLORS.extra].find(
                        (c) => c.id === selectedGlassColor,
                      )?.hex || "transparent"
                    }
                    bounds={isAreaEnabled ? areaBounds : DEFAULT_BOUNDS}
                  />
                )}

                {/* Label text preview */}
                {labelText && (
                  <TransformableText
                    shapeProps={textProps}
                    isSelected={selectedShape === "text"}
                    onSelect={() => setSelectedShape("text")}
                    onChange={setTextProps}
                    text={labelText}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontColor={fontColor}
                    bounds={isAreaEnabled ? areaBounds : DEFAULT_BOUNDS}
                  />
                )}

                {/* Artwork upload preview */}
                {uploadedFileUrl && (
                  <TransformableImage
                    shapeProps={artworkProps}
                    isSelected={selectedShape === "artwork"}
                    onSelect={() => setSelectedShape("artwork")}
                    onChange={setArtworkProps}
                    src={uploadedFileUrl}
                    bounds={isAreaEnabled ? areaBounds : DEFAULT_BOUNDS}
                  />
                )}

                {/* Product name */}
                <Text
                  x={0}
                  y={390}
                  width={350}
                  text={product.name || product.id}
                  fontSize={14}
                  fontFamily="Arial"
                  align="center"
                  fill="#999"
                  name="background"
                />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Right: Options */}
        <div className="configurator-options">
          {/* Category Tabs */}
          {isAdmin && (
            <div className="option-section">
              <div className="category-tabs">
                <button
                  className={`category-tab ${productCategory === "scented-candles" ? "active" : ""}`}
                  onClick={() => setProductCategory("scented-candles")}
                >
                  🕯️ Scented Candles
                </button>
                <button
                  className={`category-tab ${productCategory === "square-candles" ? "active" : ""}`}
                  onClick={() => setProductCategory("square-candles")}
                >
                  🟥 Square Candles
                </button>
                <button
                  className={`category-tab ${productCategory === "special-candles" ? "active" : ""}`}
                  onClick={() => setProductCategory("special-candles")}
                >
                  ✨ Specials
                </button>
              </div>
            </div>
          )}

          {/* Customizable Area Configuration (Admin only) */}
          {isAdmin && (
            <div className="option-section">
              <div
                className="option-section-header"
                onClick={() => toggleSection("customizableArea")}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <h3>
                    <i className="fas fa-crop section-icon"></i> Customizable
                    Area
                  </h3>
                  <div
                    onClick={(e) => toggleVisibleSection(e, "customizableArea")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginLeft: "12px",
                    }}
                  ></div>
                </div>
                <span
                  className={`section-toggle ${expandedSections.customizableArea ? "open" : ""}`}
                >
                  ▼
                </span>
              </div>
              {expandedSections.customizableArea && (
                <div className="option-section-body">
                  <div className="area-config-toggle">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={areaSettings.enabled}
                        onChange={(e) =>
                          setAreaSettings({
                            ...areaSettings,
                            enabled: e.target.checked,
                          })
                        }
                      />
                      <span>Enable customizable area for users</span>
                    </label>
                  </div>

                  {areaSettings.enabled && (
                    <AreaEditor
                      productImage={baseImageUrl || product.image_url}
                      initialArea={areaSettings}
                      onAreaChange={(newArea) =>
                        setAreaSettings({ ...areaSettings, ...newArea })
                      }
                    />
                  )}

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "0.75rem",
                    }}
                  >
                    Users can only place and move text/artwork within this area.
                    Canvas size: 350x420
                  </p>

                  <button
                    className="save-area-btn"
                    onClick={handleSaveArea}
                    disabled={savingArea}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: savingArea ? "not-allowed" : "pointer",
                    }}
                  >
                    {savingArea ? "Saving..." : "💾 Save Area Settings"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 0. BASE IMAGE UPLOAD */}
          {(isAdmin || isConfigEnabled("baseImage")) &&
            (isAdmin || visibleSections.baseImage) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("baseImage")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-image section-icon"></i> Base Product
                      Image
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "baseImage")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      ></div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.baseImage !== false ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.baseImage !== false && (
                  <div className="option-section-body">
                    <input
                      ref={baseImageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBaseImageUpload}
                    />
                    <div
                      className="upload-area"
                      onClick={() => baseImageInputRef.current?.click()}
                    >
                      <i className="fas fa-camera upload-icon"></i>
                      <p>Click to upload a base image of the product</p>
                      <p className="upload-hint">
                        Supports: PNG, JPG (Transparent PNG recommended)
                      </p>
                    </div>
                    {baseImage && (
                      <div className="uploaded-file-info">
                        <span>📄</span>
                        <span className="file-name">{baseImage}</span>
                        <button
                          className="remove-file"
                          onClick={removeBaseImage}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 1. QUANTITY */}
          {(isAdmin || isConfigEnabled("quantity")) &&
            (isAdmin || visibleSections.quantity !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("quantity")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-chart-bar section-icon"></i> Order
                      Quantity
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "quantity")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.quantity !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.quantity ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.quantity && (
                  <div className="option-section-body">
                    <div className="quantity-row">
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </button>
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                      />
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(quantity + 10)}
                        style={{
                          width: "auto",
                          padding: "0 12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        +10
                      </button>
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(quantity + 100)}
                        style={{
                          width: "auto",
                          padding: "0 12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        +100
                      </button>
                    </div>
                    <div
                      className={`moq-info ${moqMet ? "moq-ok" : "moq-error"}`}
                    >
                      {moqMet
                        ? `✓ MOQ satisfied (minimum: ${currentMOQ} pcs)`
                        : `✗ Current MOQ: ${currentMOQ} pcs — need ${currentMOQ - quantity} more`}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 1B. GLASS TYPE - Only for Scented Candles */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("glassType")) &&
            (isAdmin || visibleSections.glassType !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("glassType")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-wine-glass section-icon"></i> Glass
                      Type & Size
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "glassType")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.glassType !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.glassType ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.glassType && (
                  <div className="option-section-body">
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.4)",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Select the glass jar size
                    </p>
                    <div className="glass-type-grid">
                      {GLASS_TYPES.map((gt) => (
                        <div
                          key={gt.id}
                          className={`glass-type-card ${selectedGlassType === gt.id ? "selected" : ""}`}
                          onClick={() => setSelectedGlassType(gt.id)}
                        >
                          <div className="glass-type-name">{gt.name}</div>
                          <div className="glass-type-diameter">
                            {gt.diameter}
                          </div>
                          <div className="glass-type-dims">{gt.dimensions}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 1C. SQUARE CANDLE SIZE - Only for Square Candles */}
          {isSquareCandle &&
            (isAdmin || isConfigEnabled("squareCandle")) &&
            (isAdmin || visibleSections.squareCandle !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("squareCandle")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-square section-icon"></i> Square
                      Candle Size
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "squareCandle")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.squareCandle !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.squareCandle ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.squareCandle && (
                  <div className="option-section-body">
                    <div className="glass-type-grid">
                      {SQUARE_CANDLE_SIZES.map((sq) => (
                        <div
                          key={sq.id}
                          className={`glass-type-card ${selectedSquareSize === sq.id ? "selected" : ""}`}
                          onClick={() => setSelectedSquareSize(sq.id)}
                        >
                          <div className="glass-type-name">{sq.name}</div>
                          <div className="glass-type-diameter">
                            Base: {sq.base}
                          </div>
                          <div className="glass-type-dims">
                            Height: {sq.height}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 1D. SPECIAL CANDLE TYPE - Only for Special Candles */}
          {isSpecialCandle &&
            (isAdmin || isConfigEnabled("specialCandle")) &&
            (isAdmin || visibleSections.specialCandle !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("specialCandle")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-star section-icon"></i> Special
                      Candle Type
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) =>
                          toggleVisibleSection(e, "specialCandle")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.specialCandle !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.specialCandle ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.specialCandle && (
                  <div className="option-section-body">
                    <div className="glass-type-grid">
                      {SPECIAL_CANDLES.map((sp) => (
                        <div
                          key={sp.id}
                          className={`glass-type-card ${selectedSpecial === sp.id ? "selected" : ""}`}
                          onClick={() => setSelectedSpecial(sp.id)}
                        >
                          <div className="glass-type-name">
                            {sp.icon} {sp.name}
                          </div>
                          <div className="glass-type-dims">
                            {sp.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 2. GLASS COLOR */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("glassColor")) &&
            (isAdmin || visibleSections.glassColor !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("glassColor")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-palette section-icon"></i> Glass
                      Color
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "glassColor")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.glassColor !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.glassColor ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.glassColor && (
                  <div className="option-section-body">
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.4)",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Standard colors are available at any quantity
                    </p>
                    <div className="color-swatch-grid">
                      {/* Standard colors */}
                      {GLASS_COLORS.standard.map((c) => (
                        <div
                          key={c.id}
                          className={`color-swatch ${selectedGlassColor === c.id ? "selected" : ""}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => {
                            setSelectedGlassColor(c.id);
                            setGlassColorTier("standard");
                          }}
                          title={c.name}
                        >
                          <span className="swatch-label">{c.name}</span>
                        </div>
                      ))}
                      {/* Extra colors */}
                      {GLASS_COLORS.extra.map((c) => {
                        const locked = !isTierUnlocked("glassColor", "extra");
                        return (
                          <div
                            key={c.id}
                            className={`color-swatch ${selectedGlassColor === c.id ? "selected" : ""} ${locked ? "locked" : ""}`}
                            style={{ backgroundColor: c.hex }}
                            onClick={() => {
                              if (!locked) {
                                setSelectedGlassColor(c.id);
                                setGlassColorTier("extra");
                              }
                            }}
                            title={
                              locked
                                ? `MOQ ${getOptionMOQ("glassColor", "extra")}+`
                                : c.name
                            }
                          >
                            <span className="swatch-label">
                              {c.name} {locked ? "🔒" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {!isTierUnlocked("glassColor", "extra") && (
                      <p className="locked-msg">
                        🔒 Extra colors require MOQ{" "}
                        {getOptionMOQ("glassColor", "extra")}+
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 3. FRAGRANCE */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("fragrance")) &&
            (isAdmin || visibleSections.fragrance !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("fragrance")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-spray-can section-icon"></i>{" "}
                      Fragrance
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "fragrance")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.fragrance !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.fragrance ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.fragrance && (
                  <div className="option-section-body">
                    <div className="option-grid">
                      {/* Standard */}
                      {FRAGRANCES.standard.map((f) =>
                        renderOptionChip(
                          f,
                          selectedFragrance === f.id,
                          (id) => {
                            setSelectedFragrance(id);
                            setFragranceTier("standard");
                          },
                          1,
                          false,
                        ),
                      )}
                      {/* Extended */}
                      {FRAGRANCES.extended.map((f) => {
                        const moq = getOptionMOQ("fragrance", "extended");
                        const locked = !isTierUnlocked("fragrance", "extended");
                        return renderOptionChip(
                          f,
                          selectedFragrance === f.id,
                          (id) => {
                            if (!locked) {
                              setSelectedFragrance(id);
                              setFragranceTier("extended");
                            }
                          },
                          moq,
                          locked,
                        );
                      })}
                      {/* Custom */}
                      {FRAGRANCES.custom.map((f) => {
                        const moq = getOptionMOQ("fragrance", "custom");
                        const locked = !isTierUnlocked("fragrance", "custom");
                        return renderOptionChip(
                          f,
                          selectedFragrance === f.id,
                          (id) => {
                            if (!locked) {
                              setSelectedFragrance(id);
                              setFragranceTier("custom");
                            }
                          },
                          moq,
                          locked,
                        );
                      })}
                    </div>
                    {!isTierUnlocked("fragrance", "extended") && (
                      <p className="locked-msg">
                        🔒 Extended fragrances require MOQ{" "}
                        {getOptionMOQ("fragrance", "extended")}+ | Custom
                        fragrance requires MOQ{" "}
                        {getOptionMOQ("fragrance", "custom")}+
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 4. WAX COLOR */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("waxColor")) &&
            (isAdmin || visibleSections.waxColor !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("waxColor")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-fire section-icon"></i> Wax Color
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "waxColor")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.waxColor !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.waxColor ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.waxColor && (
                  <div className="option-section-body">
                    <div className="color-swatch-grid">
                      {WAX_COLORS.standard.map((c) => (
                        <div
                          key={c.id}
                          className={`color-swatch ${selectedWaxColor === c.id ? "selected" : ""}`}
                          style={{
                            backgroundColor: c.hex,
                            border: `2px solid ${selectedWaxColor === c.id ? "#fbbf24" : "rgba(0,0,0,0.2)"}`,
                          }}
                          onClick={() => {
                            setSelectedWaxColor(c.id);
                            setWaxColorTier("standard");
                          }}
                          title={c.name}
                        >
                          <span className="swatch-label">{c.name}</span>
                        </div>
                      ))}
                      {WAX_COLORS.extra.map((c) => {
                        const locked = !isTierUnlocked("waxColor", "extra");
                        return (
                          <div
                            key={c.id}
                            className={`color-swatch ${selectedWaxColor === c.id ? "selected" : ""} ${locked ? "locked" : ""}`}
                            style={{
                              backgroundColor: c.hex,
                              border: `2px solid ${selectedWaxColor === c.id ? "#fbbf24" : "rgba(0,0,0,0.2)"}`,
                            }}
                            onClick={() => {
                              if (!locked) {
                                setSelectedWaxColor(c.id);
                                setWaxColorTier("extra");
                              }
                            }}
                            title={
                              locked
                                ? `MOQ ${getOptionMOQ("waxColor", "extra")}+`
                                : c.name
                            }
                          >
                            <span className="swatch-label">
                              {c.name} {locked ? "🔒" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {!isTierUnlocked("waxColor", "extra") && (
                      <p className="locked-msg">
                        🔒 Extra wax colors require MOQ{" "}
                        {getOptionMOQ("waxColor", "extra")}+
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 5. DECORATION */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("decoration")) &&
            (isAdmin || visibleSections.decoration !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("decoration")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-image section-icon"></i> Decoration
                      Method
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "decoration")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.decoration !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.decoration ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.decoration && (
                  <div className="option-section-body">
                    <div className="option-grid">
                      {DECORATIONS.map((d) => {
                        const moq = getOptionMOQ("decoration", d.moqKey);
                        const locked = quantity < moq;
                        return renderOptionChip(
                          d,
                          selectedDecoration === d.id,
                          (id) => setSelectedDecoration(id),
                          moq,
                          locked,
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 6. PACKAGING */}
          {isScentedCandle &&
            (isAdmin || isConfigEnabled("packaging")) &&
            (isAdmin || visibleSections.packaging !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("packaging")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-box section-icon"></i> Packaging
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "packaging")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.packaging !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.packaging ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.packaging && (
                  <div className="option-section-body">
                    <div className="option-grid">
                      {PACKAGING.map((p) => {
                        const moq = getOptionMOQ("packaging", p.moqKey);
                        const locked = quantity < moq;
                        return renderOptionChip(
                          p,
                          selectedPackaging === p.id,
                          (id) => setSelectedPackaging(id),
                          moq,
                          locked,
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 6B. ADD-ONS - For Square and Special Candles */}
          {(isSquareCandle || isSpecialCandle) &&
            (isAdmin || isConfigEnabled("addOns")) &&
            (isAdmin || visibleSections.addOns !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("addOns")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <span className="section-icon">➕</span> Add-on
                      Decorations
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "addOns")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.addOns !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.addOns ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.addOns && (
                  <div className="option-section-body">
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.4)",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Select additional decorations (optional)
                    </p>
                    <div className="option-grid">
                      {ADD_ONS.map((addon) => (
                        <div
                          key={addon.id}
                          className={`option-chip ${selectedAddOns.includes(addon.id) ? "selected" : ""}`}
                          onClick={() => toggleAddOn(addon.id)}
                        >
                          <span>{addon.icon}</span>
                          <span>{addon.name}</span>
                        </div>
                      ))}
                    </div>
                    {selectedAddOns.length > 0 && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#10b981",
                          marginTop: "0.5rem",
                        }}
                      >
                        ✓ {selectedAddOns.length} add-on(s) selected
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 6C. NAME ON CANDLE - For Square and Special Candles */}
          {(isSquareCandle || isSpecialCandle) &&
            (isAdmin || isConfigEnabled("nameOnCandle")) &&
            (isAdmin || visibleSections.nameOnCandle !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("nameOnCandle")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-pen section-icon"></i> Name on Candle
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "nameOnCandle")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.nameOnCandle !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.nameOnCandle ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.nameOnCandle && (
                  <div className="option-section-body">
                    <input
                      className="label-text-input"
                      type="text"
                      placeholder="Enter name to print on candle..."
                      value={nameOnCandle}
                      onChange={(e) => setNameOnCandle(e.target.value)}
                      maxLength={30}
                    />
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "0.5rem",
                      }}
                    >
                      Max 30 characters. Name will be printed on the candle.
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* 7. LABEL TEXT */}
          {(isAdmin || isConfigEnabled("labelText")) &&
            (isAdmin || visibleSections.labelText !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("labelText")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-pen section-icon"></i> Label Text &
                      Styling
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "labelText")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.labelText !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.labelText ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.labelText && (
                  <div className="option-section-body">
                    <input
                      className="label-text-input"
                      type="text"
                      placeholder="Enter your custom label text..."
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value)}
                    />
                    <div className="label-controls">
                      <div className="label-control">
                        <label>Font</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                        >
                          {FONTS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="label-control">
                        <label>Size</label>
                        <input
                          type="number"
                          min="8"
                          max="48"
                          value={fontSize}
                          onChange={(e) =>
                            setFontSize(parseInt(e.target.value) || 16)
                          }
                        />
                      </div>
                      <div className="label-control">
                        <label>Color</label>
                        <input
                          type="color"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* 8. ARTWORK UPLOAD */}
          {(isAdmin || isConfigEnabled("artwork")) &&
            (isAdmin || visibleSections.artwork !== false) && (
              <div className="option-section">
                <div
                  className="option-section-header"
                  onClick={() => toggleSection("artwork")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3>
                      <i className="fas fa-file-upload section-icon"></i>{" "}
                      Artwork / Branding Upload
                    </h3>
                    {isAdmin && (
                      <div
                        onClick={(e) => toggleVisibleSection(e, "artwork")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Visible:{" "}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleSections.artwork !== false}
                          readOnly
                          style={{ transform: "scale(0.8)", cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`section-toggle ${expandedSections.artwork ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.artwork && (
                  <div className="option-section-body">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.ai,.eps,.svg"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                    <div
                      className="upload-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="upload-icon">☁️</span>
                      <p>Click to upload artwork or branding files</p>
                      <p className="upload-hint">
                        Supports: PNG, JPG, SVG, PDF, AI, EPS (max 5MB)
                      </p>
                    </div>
                    {uploadedFile && (
                      <div className="uploaded-file-info">
                        <span>📄</span>
                        <span className="file-name">{uploadedFile}</span>
                        <button className="remove-file" onClick={removeFile}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="configurator-bottom-bar">
        <div className="bottom-bar-summary">
          <div className="summary-item">
            <span className="label">Qty:</span>
            <span className="value">{quantity}</span>
          </div>
          {isScentedCandle && (
            <>
              <div className="summary-item">
                <span className="label">Glass:</span>
                <span className="value">{selectedGlassType}</span>
              </div>
              <div className="summary-item">
                <span className="label">Fragrance:</span>
                <span className="value">{selectedFragrance || "None"}</span>
              </div>
            </>
          )}
          {isSquareCandle && (
            <>
              <div className="summary-item">
                <span className="label">Size:</span>
                <span className="value">{selectedSquareSize}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="summary-item">
                  <span className="label">Add-ons:</span>
                  <span className="value">{selectedAddOns.length}</span>
                </div>
              )}
              {nameOnCandle && (
                <div className="summary-item">
                  <span className="label">Name:</span>
                  <span className="value">{nameOnCandle.substring(0, 10)}</span>
                </div>
              )}
            </>
          )}
          {isSpecialCandle && (
            <>
              <div className="summary-item">
                <span className="label">Type:</span>
                <span className="value">{selectedSpecial}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="summary-item">
                  <span className="label">Add-ons:</span>
                  <span className="value">{selectedAddOns.length}</span>
                </div>
              )}
            </>
          )}
          <div className="summary-item">
            <span className="label">Unit:</span>
            <span className="value">${pricing.unitPrice}</span>
          </div>
          {isScentedCandle && (
            <div className="summary-item">
              <span className="label">MOQ:</span>
              <span
                className="value"
                style={{ color: moqMet ? "#10b981" : "#ef4444" }}
              >
                {currentMOQ} {moqMet ? "✓" : "✗"}
              </span>
            </div>
          )}
        </div>
        <button
          className="next-btn"
          disabled={!moqMet && isScentedCandle}
          onClick={handleNext}
        >
          {isAdmin ? "Done" : "Review Order →"}
        </button>
      </div>
    </div>
  );
}

export default ProductConfigurator;
