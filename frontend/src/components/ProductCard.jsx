import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, product.sizes?.[0] || "L");
    navigate("/Cart");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    clearCart();
    addToCart(product, product.sizes?.[0] || "L");
    navigate("/checkout");
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-primary/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image || "https://via.placeholder.com/600x800?text=UD"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        {product.isNewArrival && (
          <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-heading font-bold px-3 py-1 uppercase tracking-widest z-10 rounded-sm">
            New
          </span>
        )}

        {/* Actions - Always Visible */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 flex gap-2 z-20">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white hover:bg-black py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 text-[9px] sm:text-[11px] font-heading font-bold tracking-[0.14em] uppercase rounded-md transition-colors shadow-lg whitespace-nowrap"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 px-2 sm:px-4 bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 rounded-md shadow-lg flex items-center justify-center font-heading font-bold text-[9px] sm:text-[11px] uppercase tracking-[0.14em] whitespace-nowrap"
          >
            Buy Now
          </button>
        </div>

        {/* Subtle Bottom Gradient for Action Visibility - always visible */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 bg-white">
        <div className="flex justify-between items-start gap-4">
          <Link
            to={`/product/${product._id}`}
            className="text-sm font-heading font-bold text-primary hover:text-primary/70 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <span className="text-sm font-sans font-bold text-primary shrink-0">
            ₹{product.price}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-primary/50 font-sans font-medium">
          {product.category}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
