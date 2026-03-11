import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-24 pb-12 font-sans border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="mb-6 block">
              <img
                src="/urbandos_logo.svg"
                alt="UrbanDos"
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <p className="text-white/50 max-w-sm mb-8 leading-relaxed font-sans font-medium">
              Premium streetwear for the modern era. Minimal design, bold
              identity, and absolute perfection. Built different OS.
            </p>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a
                href="https://www.instagram.com/urban.dos/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-all duration-300 text-white/60"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://www.youtube.com/@urbandos7"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-all duration-300 text-white/60"
                aria-label="Youtube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-heading font-bold uppercase tracking-widest text-white/90 mb-6">
              Explore
            </h4>

            <ul className="space-y-4 text-white/50 text-sm font-sans font-medium">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  to="/shop"
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-heading font-bold uppercase tracking-widest text-white/90 mb-6">
              Support
            </h4>

            <ul className="space-y-4 text-white/50 text-sm font-sans font-medium">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Order Tracking
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping Policy
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Help Center <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs font-sans font-medium">
            © 2026 UD STUDIO. ALL RIGHTS RESERVED.
          </p>

          <div className="flex space-x-8 text-white/40 text-xs font-sans font-medium">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
