import React from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { Cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const subtotal = getCartTotal();
  const totalItemsCount = Cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  let shipping = 60;
  if (totalItemsCount >= 7) {
    shipping = 135;
  } else if (totalItemsCount >= 3) {
    shipping = 100;
  }

  const total = subtotal + shipping;

  if (Cart.length === 0) {
    return (
      <div className="pt-48 pb-24 min-h-[70vh] flex flex-col items-center justify-center bg-[#f6f6f6] text-primary container mx-auto px-6 text-center">
        <div className="w-24 h-24 bg-secondary flex items-center justify-center rounded-full mb-8">
          <ShoppingBag size={40} className="text-accent/20" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4">
          YOUR GarageT IS EMPTY.
        </h1>
        <p className="text-accent/40 mb-12 max-w-sm uppercase tracking-widest text-xs font-bold font-sans">
          "Identity is chosen, and yours is currently a blank slate."
        </p>
        <Link
          to="/shop"
          className="btn-primary px-12 uppercase tracking-[0.3em] text-[10px]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#f6f6f6] text-primary">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
            Shopping Bag
          </h1>
          {Cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 transition-colors px-4 py-2 rounded"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="space-y-8">
              <AnimatePresence>
                {Cart.map((item) => (
                  <motion.div
                    key={item.CartId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-white/5 items-start sm:items-center"
                  >
                    {/* Item Image */}
                    <div className="w-24 sm:w-32 aspect-[3/4] bg-secondary rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.image || "https://via.placeholder.com/300x400"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-grow flex flex-col gap-1">
                      <h3 className="text-sm font-black uppercase tracking-tight text-primary">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-primary/50 uppercase tracking-widest font-black mb-2">
                        {item.category} / Size: {item.size}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center border border-white/10 rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.CartId, -1)}
                            className="p-2 hover:bg-white/5 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.CartId, 1)}
                            className="p-2 hover:bg-white/5 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.CartId)}
                          className="text-accent/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Price */}
                    <div className="sm:text-right">
                      <p className="text-sm font-black">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-accent/30 font-bold">
                        ₹{item.price} each
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8">
              <Link
                to="/shop"
                className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-accent/40 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="glass-Card p-8 sticky top-32">
              <h2 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-accent/40 uppercase tracking-widest font-bold">
                    Product Price
                  </span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-accent/40 uppercase tracking-widest font-bold">
                    Delivery / Shipping Charges
                  </span>
                  <span className="font-bold">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="py-2 px-3 bg-accent/5 rounded-sm">
                  <p className="text-[10px] text-accent/60 uppercase tracking-widest leading-relaxed">
                    Delivery charges:{" "}
                    <span className="text-white font-bold">₹60</span> ({"<3"}{" "}
                    items) / <span className="text-white font-bold">₹100</span>{" "}
                    (3-6 items) /{" "}
                    <span className="text-white font-bold">₹135</span> (7+
                    items)
                  </p>
                </div>
                <div className="flex justify-between text-lg font-black pt-4 border-t border-white/10 mt-4">
                  <span className="uppercase tracking-widest">Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs font-black flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <div className="flex items-center justify-center gap-6 pt-4 opacity-30">
                {/* Payment Icons Placeholder */}
                <div className="h-6 w-10 bg-accent/50 rounded-sm" />
                <div className="h-6 w-10 bg-accent/50 rounded-sm" />
                <div className="h-6 w-10 bg-accent/50 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
