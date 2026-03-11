import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Instagram,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useCollection } from "../context/CollectionContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { Cart } = useCart();
  const { collections } = useCollection();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsPastHero(window.scrollY > window.innerHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Lock body scroll while the mobile drawer is open to avoid jank.
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isHome = pathname === "/";

  const isDarkPage = pathname === "/checkout" || pathname === "/admin";
  const isDarkText = (!isHome && !isDarkPage) || (isHome && isPastHero);

  const textColorClass = isDarkText ? "text-primary" : "text-white";
  const hoverColorClass = isDarkText
    ? "hover:text-primary/70"
    : "hover:text-white/70";

  const bgColorClass = isScrolled
    ? isDarkText
      ? "bg-[#f6f6f6]/90 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-primary/5 text-primary"
      : "bg-primary/90 border-b border-white/5 text-white"
    : "bg-transparent " + textColorClass;

  const logoSrc = "/ud_logo.svg";

  return (
    <nav
      className={`fixed w-full transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isOpen
          ? "z-[1000] bg-white"
          : "z-50 backdrop-blur-md " +
            (isScrolled ? "py-4" : "py-6") +
            " " +
            bgColorClass
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center relative">
        {/* Left Menu */}
        <div className="hidden md:flex items-center space-x-8 flex-1">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1 font-sans font-medium transition-colors ${textColorClass} ${hoverColorClass}`}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div
            className="relative group"
            onMouseEnter={() => setActiveDropdown("collections")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`nav-link flex items-center gap-1 py-2 font-sans font-medium transition-colors ${textColorClass} ${hoverColorClass}`}
            >
              Collections
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  activeDropdown === "collections" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "collections" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-[400px] mt-2 p-6 glass-Card grid grid-cols-2 gap-4 bg-primary/95 text-white shadow-2xl rounded-lg border border-white/10"
                >
                  {collections.map((item) => (
                    <Link
                      key={item._id || item.name}
                      to={`/category/${
                        item.collectionId ||
                        item.name.toLowerCase().replace(/\s+/g, "-")
                      }`}
                      className="text-sm text-white/60 hover:text-white hover:translate-x-2 transition-all duration-200 font-sans"
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="col-span-2 pt-4 border-t border-white/10">
                    <a
                      href="/#collections-section"
                      className="text-xs uppercase tracking-widest font-heading font-medium text-white/40 hover:text-white"
                    >
                      View All Collections
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/shop"
            className={`nav-link font-sans font-medium transition-colors ${textColorClass} ${hoverColorClass}`}
          >
            New Arrivals
          </Link>

          <Link
            to="/shop"
            className={`nav-link font-sans font-medium transition-colors ${textColorClass} ${hoverColorClass}`}
          >
            Products
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 flex-1 relative">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className={`absolute left-0 top-1/2 -translate-y-1/2 md:hidden ${textColorClass}`}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center justify-center hover:scale-105 transition-transform"
          >
            <img
              src={logoSrc}
              alt="Urban Dust Logo"
              className={`h-6 w-auto ${isDarkText ? "invert" : ""}`}
            />
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center justify-end space-x-6 flex-1">
          <Link
            to="/profile"
            className={`transition-colors ${textColorClass} ${hoverColorClass}`}
          >
            <User size={20} />
          </Link>

          <Link
            to="/Cart"
            className={`relative transition-colors ${textColorClass} ${hoverColorClass}`}
          >
            <ShoppingBag size={20} />
            <span
              className={`absolute -top-2 -right-2 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${
                !isDarkText
                  ? "bg-[#f6f6f6] text-primary"
                  : "bg-primary text-[#f6f6f6]"
              }`}
            >
              {Cart.reduce((total, item) => total + (item.quantity || 1), 0)}
            </span>
          </Link>

          <button
            className={`md:hidden ${textColorClass}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[400px] z-[999] flex flex-col p-8 md:hidden bg-white text-[#141417] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-16">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex justify-center translate-x-4"
              >
                <img
                  src={logoSrc}
                  alt="Urban Dust Logo"
                  className="h-6 w-auto invert"
                />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#141417]/10 rounded-full transition-colors ml-auto"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-10 text-3xl font-heading font-black uppercase tracking-tighter">
              <Link to="/shop" onClick={() => setIsOpen(false)}>
                Collections
              </Link>

              <Link to="/shop" onClick={() => setIsOpen(false)}>
                New Arrivals
              </Link>

              <Link to="/shop" onClick={() => setIsOpen(false)}>
                Products
              </Link>

              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Account
              </Link>
            </div>

            {/* Social Icons */}
            <div className="mt-auto pt-10 border-t border-primary/10">
              <p className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-primary/30 mb-6">
                Follow the identity
              </p>

              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/urban.dos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10 transition-all border border-primary/5"
                >
                  <Instagram size={20} />
                </a>

                <a
                  href="https://www.youtube.com/@urbandos7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10 transition-all border border-primary/5"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
