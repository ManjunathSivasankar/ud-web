import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const { collections, loading: collectionsLoading } = useCollection();
  const [loading, setLoading] = useState(true);

  // API Base URL from Environment Variables
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch new arrivals - fetching 5 to allow varied layout (2 columns for first, 1 for rest in a 4 col grid = 5 items)
        const productsResponse = await fetch(`${API_URL}/api/products`);
        const productsData = await productsResponse.json();
        if (Array.isArray(productsData)) {
          setNewArrivals(productsData.slice(0, 5));
        } else {
          console.error("products API error:", productsData);
          setNewArrivals([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      <Hero />

      {/* New Arrivals Section (Light Theme) */}
      <section className="theme-light py-20 md:py-32 z-10 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10 md:mb-16">
            <div>
              <span className="text-muted uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-2">
                Recently Dropped
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter uppercase relative inline-block">
                New Arrivals
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary"></span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-2 text-sm font-sans font-bold text-primary/60 hover:text-primary transition-colors pb-2"
            >
              View All{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
            {loading
              ? [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="aspect-[4/5] bg-primary/5 rounded-xl animate-pulse"
                  />
                ))
              : newArrivals.map((product, index) => (
                  <div
                    key={product._id || product.id}
                    className={
                      index === 0
                        ? "col-span-1 md:col-span-2"
                        : "col-span-1 border border-primary/5 rounded-xl block"
                    }
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section
        id="collections-section"
        className="py-20 md:py-32 container mx-auto px-6"
      >
        <div className="mb-10 md:mb-16 text-center">
          <span className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-2">
            Curated Drops
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">
            The Collections
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {collections.map((col, index) => (
            <motion.div
              key={col._id || col.collectionId || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative aspect-[3/4] md:aspect-[4/3] bg-secondary rounded-xl md:rounded-2xl overflow-hidden shadow-xl"
            >
              <Link
                to={`/category/${col.collectionId || col.id}`}
                className="absolute inset-0 z-20"
              />
              {/* Background Image */}
              {col.image && (
                <img
                  src={col.image}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 z-0"
                />
              )}
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
              {/* Overlay Content */}
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 pr-4 md:pr-8">
                <h3 className="text-base md:text-2xl font-heading font-black tracking-tight uppercase text-white group-hover:translate-x-2 transition-transform duration-300 mb-2">
                  {col.name}
                </h3>
                <div className="h-[2px] w-0 bg-white group-hover:w-12 transition-all duration-500 ease-out"></div>
              </div>
              <div className="hidden md:flex absolute right-8 bottom-8 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <ArrowRight size={16} className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-32 bg-[#e5e5e5] text-primary overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <span className="text-primary/40 uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-4">
                The Narrative
              </span>
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                Crafting <br />
                <span className="text-primary/30 text-[0.8em]">
                  The Identity
                </span>
              </h2>
              <div className="space-y-6 text-lg font-sans font-medium text-primary/80 leading-relaxed">
                <p>
                  It started in a dorm room during my 3rd year of college.
                  Driven by a passion for aesthetics and the raw energy of
                  street culture, I founded{" "}
                  <span className="font-black text-primary italic">
                    Fungistyle
                  </span>
                  .
                </p>
                <p>
                  We aren't just making clothes; we're building a medium for
                  self-expression. Our focus has always been on premium quality
                  oversized t-shirts that don't just fit, but make a statement.
                </p>
                <p>
                  Every piece is a canvas. From unique, hand-crafted designs to
                  limitless customization, we ensure that what you wear is as
                  distinctive as your own story.
                </p>
              </div>
              <div className="mt-12">
                <div className="inline-flex items-center gap-4 py-2 px-6 bg-primary text-white rounded-full font-heading font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform cursor-default">
                  Est. 2024{" "}
                  <span className="w-1 h-1 bg-white/30 rounded-full"></span> 3rd
                  Year Roots
                </div>
              </div>
            </motion.div>

            {/* Right: Testimonial Marquee / Vertical Banner */}
            <div className="relative h-[500px] flex flex-col justify-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#e5e5e5] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#e5e5e5] to-transparent z-10 pointer-events-none"></div>

              <motion.div
                className="flex flex-col gap-6"
                animate={{ y: [0, -600] }}
                transition={{
                  repeat: Infinity,
                  duration: 30,
                  ease: "linear",
                }}
              >
                {[1, 2, 3, 4, 1, 2, 3, 4].map((n, i) => (
                  <div
                    key={i}
                    className="p-8 bg-white/40 backdrop-blur-sm border border-primary/5 rounded-2xl shadow-sm hover:bg-white/60 transition-colors"
                  >
                    <div className="flex gap-1 mb-4 text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className="w-3 h-3 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <p className="font-sans italic font-medium text-primary/70 text-sm mb-4">
                      {n === 1 &&
                        "The quality of the oversized t-shirts is unmatched. Truly premium quality."}
                      {n === 2 &&
                        "Love the customization options. My t-shirt feels unique and personally crafted."}
                      {n === 3 &&
                        "Fast delivery and amazing fit. The designs are unlike anything else in the market."}
                      {n === 4 &&
                        "Support a college entrepreneur! The brand energy is amazing and the quality is even better."}
                    </p>
                    <p className="font-heading font-black text-[10px] uppercase tracking-widest text-primary/40">
                      — Client Review {i + 1}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
