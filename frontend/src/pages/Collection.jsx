import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Filter, ChevronDown, SlidersHorizontal, Settings } from "lucide-react";

const Collection = () => {
  const { id } = useParams(); // Category ID if any
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();

        let filtered = data;
        if (id) {
          filtered = data.filter((p) =>
            p.category.toLowerCase().includes(id.replace("-", " ")),
          );
        }
        setProducts(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  return (
    <div className="bg-[#f6f6f6] text-primary min-h-screen pt-28 md:pt-32 pb-20 md:pb-24 font-sans selection:bg-primary/20">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-7xl font-heading font-black tracking-tighter uppercase mb-3 md:mb-4 text-primary">
            {id ? id.replace("-", " ") : "All Products"}
          </h1>
          <p className="text-primary/60 text-sm uppercase tracking-[0.2em] font-heading font-bold">
            {products.length} Products Found
          </p>
        </div>

        {/* Mobile Toolbar */}
        <div className="mb-6 p-3 border border-primary/10 rounded-lg bg-white/70 flex items-center justify-between md:hidden">
          <span className="text-[10px] text-primary/50 font-heading font-bold uppercase tracking-widest">
            Sort By
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-sans font-bold uppercase tracking-widest border-none outline-none cursor-pointer focus:ring-0 text-primary/90"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-12 py-4 border-y border-primary/10 bg-[#f6f6f6] rounded-lg px-4 hidden md:flex">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-heading font-bold uppercase tracking-widest text-primary/80 hover:text-primary transition-colors"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-primary/40 font-heading font-bold uppercase tracking-widest">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-sans font-bold uppercase tracking-widest border-none outline-none cursor-pointer focus:ring-0 text-primary/90"
            >
              <option value="newest" className="bg-[#f6f6f6] text-primary">
                Newest
              </option>
              <option value="price-low" className="bg-[#f6f6f6] text-primary">
                Price: Low to High
              </option>
              <option value="price-high" className="bg-[#f6f6f6] text-primary">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Main Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="aspect-[4/5] bg-primary/5 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-primary/5 rounded-2xl">
                <p className="text-primary/40 text-xl italic font-sans font-medium mb-6">
                  "Silence everywhere. No products found."
                </p>
                <button
                  onClick={() => setProducts([])}
                  className="px-8 py-3 bg-primary text-white rounded-full text-sm uppercase tracking-widest font-heading font-bold hover:bg-primary/90 transition-colors shadow-xl"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
