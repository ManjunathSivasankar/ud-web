import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("L");
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct({
            ...data,
            // Use real gallery array if it has 3 images, else fallback
            images:
              data.images?.length === 3
                ? data.images
                : [data.image, data.image, data.image],
          });
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f6f6] text-primary">
        Loading...
      </div>
    );

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    navigate("/Cart");
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart(product, selectedSize);
    navigate("/checkout");
  };

  return (
    <div className="pt-28 md:pt-32 pb-16 md:pb-24 bg-[#f6f6f6] text-primary min-h-screen overflow-x-hidden">
      <AnimatePresence>
        {isAdded && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-white text-black px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-black/5"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
              Added to Cart
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          {/* Left: Image Gallery */}
          <div className="lg:w-3/5 flex gap-4">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${activeImage === idx ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-grow aspect-[3/4] bg-primary/5 rounded-lg overflow-hidden relative group">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-2/5 flex flex-col pt-4">
            <span className="text-primary/40 uppercase tracking-[0.3em] text-xs font-bold mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-primary uppercase">
              {product.name}
            </h1>
            <p className="text-2xl font-bold mb-8 text-primary">
              ₹{product.price}
            </p>

            <p className="text-primary/60 leading-relaxed mb-6 text-sm max-w-md">
              {product.description}
            </p>

            {(product.fabric || product.color) && (
              <div className="flex flex-col gap-2 mb-8 text-xs uppercase tracking-widest text-primary/50 font-bold border-l-2 border-primary/20 pl-4">
                {product.fabric && (
                  <p>
                    Fabric:{" "}
                    <span className="text-primary/80">{product.fabric}</span>
                  </p>
                )}
                {product.color && (
                  <p>
                    Color:{" "}
                    <span className="text-primary/80">{product.color}</span>
                  </p>
                )}
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-primary/10">
                <span className="text-2xl sm:text-3xl font-sans font-bold text-primary">
                  ₹{product.price}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-heading font-black text-primary/30 mt-1 sm:mt-0">
                  In Stock / Ready to Ship
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center text-sm font-bold border-2 transition-all ${selectedSize === size ? "bg-primary text-white border-primary" : "border-primary/10 text-primary/50 hover:border-primary/40"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white py-5 flex items-center justify-center gap-3 font-heading font-black rounded-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-xl group"
              >
                Add to Cart
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-white border-2 border-primary text-primary py-5 flex items-center justify-center gap-3 font-heading font-black rounded-sm transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-xl"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4 md:space-y-6 pt-8 md:pt-12 border-t border-primary/5">
              <div className="flex items-start gap-4">
                <Truck size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Fast Delivery
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    {product.delivery}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <RotateCcw size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Easy Returns
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    30-day money back guarantee.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Secure Checkout
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    Verified payment processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs */}
        <div className="mt-12 md:mt-32 border-t border-primary/5 pt-10 md:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Product Guidance
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                {product.guidance}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Material Detail
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                100% Organic Cotton. Reinforced seams. Pre-shrunk for consistent
                fit over time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Ethical Sourcing
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                Produced in carbon-neutral facilities with fair-wage workforce
                standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
