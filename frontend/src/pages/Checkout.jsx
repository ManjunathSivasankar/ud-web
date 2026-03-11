import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ChevronLeft, ArrowRight } from "lucide-react";
import UpiQrModal from "../components/UpiQrModal";

const Checkout = () => {
  const { Cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [shippingDetails, setShippingDetails] = useState(() => {
    const savedAddress = localStorage.getItem("userAddress");
    const parsedAddress = savedAddress ? JSON.parse(savedAddress) : null;

    return {
      name: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      address: parsedAddress?.street || "",
      city: parsedAddress?.city || "",
      state: parsedAddress?.state || "",
      pinCode: parsedAddress?.zip || "",
    };
  });

  const subtotal = getCartTotal();
  const totalItemsCount = Cart.reduce((acc, item) => acc + item.quantity, 0);

  const getShippingFee = () => {
    if (totalItemsCount >= 7) return 135;
    if (totalItemsCount >= 3) return 100;
    return 60;
  };

  const shipping = getShippingFee();
  const total = subtotal + shipping;

  // UPI payment modal state
  const [paymentData, setPaymentData] = useState(null); // { orderId, upiLink, amount }
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (Cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    // Persist address for next visit
    localStorage.setItem(
      "userAddress",
      JSON.stringify({
        street: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zip: shippingDetails.pinCode,
      }),
    );

    try {
      const token = user ? await user.getIdToken() : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const orderData = {
        customerDetails: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
        },
        shippingAddress: {
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pinCode: shippingDetails.pinCode,
        },
        items: Cart.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
        })),
        subtotal,
        shippingFee: shipping,
        shippingMethod: "Standard",
        totalAmount: total,
      };

      // ── Call the UPI payment initiation endpoint ─────────────────────
      const response = await fetch(`${API_URL}/api/payment/initiate`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const { orderId, upiLink } = await response.json();
        // Show the QR/intent modal
        setPaymentData({ orderId, upiLink, amount: total });
        setShowQrModal(true);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(
          err.message ||
            "There was an issue initiating the payment. Please try again.",
        );
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("There was an issue initiating the payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (Cart.length === 0) {
    return (
      <div className="pt-48 pb-24 min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-6 text-center bg-primary text-white">
        <h1 className="text-4xl font-black tracking-tighter mb-4">
          YOUR GarageT IS EMPTY.
        </h1>
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
    <div className="pt-28 md:pt-32 pb-24 min-h-screen bg-primary text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase">
            Checkout
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Shipping Form */}
          <div className="lg:w-2/3">
            <h2 className="text-lg font-black uppercase tracking-widest mb-8 pb-4 border-b border-white/10">
              Shipping Details
            </h2>

            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={shippingDetails.name}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="WhatsApp number preferred"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={shippingDetails.email}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="For order confirmation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="House number, street name, apartment, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    required
                    value={shippingDetails.pinCode}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:w-1/3">
            <div className="bg-secondary border border-white/10 rounded-xl p-6 md:p-8 lg:sticky lg:top-32">
              <h2 className="text-lg font-black uppercase tracking-widest mb-6 md:mb-8 border-b border-white/10 pb-4">
                Your Order
              </h2>

              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {Cart.map((item) => (
                  <div key={item.CartId} className="flex gap-4">
                    <div className="w-16 h-20 bg-secondary rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase truncate max-w-[150px] text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-white/50 uppercase">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                      <p className="text-xs font-bold mt-1 text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 uppercase tracking-widest font-bold">
                    Product Price
                  </span>
                  <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 uppercase tracking-widest font-bold">
                    Delivery
                  </span>
                  <span className="font-bold text-white">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-4 border-t border-white/10 mt-4">
                  <span className="uppercase tracking-widest text-white">Total</span>
                  <span className="text-white">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-sm mb-6 flex items-start gap-3">
                <ShieldCheck
                  className="text-green-400 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <p className="text-[10px] text-white/60 uppercase tracking-widest leading-relaxed">
                  Secure UPI payment via Google Pay, PhonePe, Paytm, or any
                  UPI-enabled app. No card details required.
                </p>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-4 uppercase tracking-[0.2em] text-xs font-black flex items-center justify-center gap-2 transition-colors rounded-sm"
              >
                {isSubmitting ? (
                  "Processing…"
                ) : (
                  <>
                    Pay with UPI <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Payment Modal – rendered outside the form, no layout impact */}
      {showQrModal && paymentData && (
        <UpiQrModal
          upiLink={paymentData.upiLink}
          orderId={paymentData.orderId}
          amount={paymentData.amount}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
