import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Youtube } from "lucide-react";
import { useReducedMotion } from "framer-motion";

// Hardcoded testimonials removed, moving to dynamic fetch

import { useCollection } from "../context/CollectionContext";

const Hero = () => {
  const { collections } = useCollection();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);
    updateMobileState();

    mediaQuery.addEventListener("change", updateMobileState);
    return () => mediaQuery.removeEventListener("change", updateMobileState);
  }, []);

  // Create a looped array of whatever collections we have from backend
  const marqueeItems =
    collections?.length > 0 ? [...collections, ...collections] : [];

  return (
    <div className="relative min-h-screen w-full bg-primary font-sans overflow-hidden flex flex-col justify-center pt-24 pb-12">
      {/* ========== BACKGROUND ANIMATION ========== */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div
          animate={
            !isMobile && !shouldReduceMotion
              ? { backgroundPosition: ["0px 0px", "0px -40px"] }
              : { backgroundPosition: "0px 0px" }
          }
          transition={
            !isMobile && !shouldReduceMotion
              ? { repeat: Infinity, duration: 4, ease: "linear" }
              : { duration: 0 }
          }
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none z-0 hidden md:block"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0 hidden md:block"
      />

      {/* ========== FOREGROUND CONTENT ========== */}

      {/* 1. Left Vertical Social Icons */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6 z-30 hidden md:flex">
        <div className="w-[1px] h-20 bg-white/20 mb-2"></div>
        <a
          href="https://www.instagram.com/urban.dos/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white/10 rounded-full text-white hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] outline-none"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
        <a
          href="https://www.youtube.com/@urbandos7"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white/10 rounded-full text-white hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] outline-none"
          aria-label="Youtube"
        >
          <Youtube size={18} />
        </a>
        <div className="w-[1px] h-20 bg-white/20 mt-2"></div>
      </div>

      {/* 2. Top/Center Hero Text & Marquee (Banners) */}
      <div className="w-full relative z-20 flex flex-col items-center">
        <div className="text-center mb-0 px-6 absolute top-0 md:top-8 z-40 pointer-events-none w-full">
          <motion.h1
            initial={!shouldReduceMotion ? { opacity: 0, y: 20 } : false}
            animate={!shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
            transition={!shouldReduceMotion ? { delay: 0.1 } : undefined}
            className="text-[3.5rem] leading-[0.8] md:text-8xl xl:text-[9rem] font-heading font-black tracking-tighter text-white drop-shadow-2xl"
          >
            OWN THE <br className="md:hidden" /> MOMENT.
          </motion.h1>
        </div>

        {/* Desktop: Infinite Marquee inside overflow-hidden for seamless loop */}
        {collections?.length > 0 && !isMobile ? (
          <div className="w-full overflow-hidden mt-32 md:mt-32 relative group cursor-grab active:cursor-grabbing">
            {/* Gradient Edges */}
            <div className="absolute inset-y-0 left-0 w-8 md:w-32 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 md:w-32 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none"></div>
            <motion.div
              className="flex gap-4 md:gap-6 w-max pl-6"
              drag="x"
              dragConstraints={{
                right: 0,
                left: -((400 + 24) * collections.length),
              }}
              animate={{ x: [0, -((400 + 24) * collections.length)] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 35,
                  ease: "linear",
                },
              }}
              whileTap={{ cursor: "grabbing" }}
            >
              {marqueeItems.map((item, index) => (
                <Link
                  to={`/category/${item.collectionId || item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  key={`${item._id || item.name}-${index}`}
                  className="block outline-none"
                >
                  <div className="relative w-[240px] h-[340px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500 transform hover:-translate-y-2 flex-shrink-0 group/card bg-secondary/20">
                    <img
                      src={item.image || "https://via.placeholder.com/600x800"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-end p-6 pointer-events-none opacity-100 group-hover/card:opacity-0 transition-opacity duration-300">
                      <h3 className="text-white font-heading font-black text-xl uppercase tracking-tighter drop-shadow-lg">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        ) : null}

        {/* Mobile: lightweight auto-marquee */}
        {collections?.length > 0 && isMobile ? (
          <div className="w-full mt-32 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-4 w-max pl-4"
              animate={{ x: [0, -((210 + 16) * collections.length)] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 22,
                  ease: "linear",
                },
              }}
            >
              {marqueeItems.map((item, index) => (
                <Link
                  to={`/category/${item.collectionId || item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  key={`${item._id || item.name}-${index}`}
                  className="block outline-none flex-shrink-0"
                >
                  <div className="relative w-[210px] h-[300px] rounded-2xl overflow-hidden shadow-lg bg-secondary/20">
                    <img
                      src={item.image || "https://via.placeholder.com/600x800"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-end p-5 pointer-events-none">
                      <h3 className="text-white font-heading font-black text-lg uppercase tracking-tighter drop-shadow-lg">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        ) : null}
      </div>

      {/* Absolute CTA button (bottom left next to social) for mobile fallback */}
      <div className="absolute bottom-6 left-6 z-30 md:hidden">
        <Link
          to="/shop"
          className="px-6 py-3 bg-white text-primary rounded-full font-heading font-bold tracking-widest uppercase text-[10px] flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-all outline-none"
        >
          Explore <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default Hero;
