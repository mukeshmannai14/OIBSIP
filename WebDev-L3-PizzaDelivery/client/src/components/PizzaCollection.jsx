
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Pizza } from "lucide-react";
import PizzaCard from "./PizzaCard";

const categories = ["All", "Veg", "Non-Veg"];

function PizzaCollection({
  pizzas,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const filteredPizzas = useMemo(() => {
    let result = pizzas.filter((pizza) => {
      const matchesSearch =
        pizza.name.toLowerCase().includes(search.toLowerCase()) ||
        pizza.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" ||
        pizza.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [pizzas, search, activeCategory, sortBy]);

  return (
    <section
      id="menu"
      className="bg-[#fffaf3] px-5 py-20 md:px-10 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* SECTION HEADING */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#e85d2a]">
            Discover Your Favourite
          </p>

          <h2 className="text-3xl font-extrabold text-[#261713] md:text-5xl">
            Explore Our Menu
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            From timeless classics to bold new flavours,
            discover a pizza made just for you.
          </p>
        </div>

        {/* SEARCH AND SORT */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your favourite pizza..."
              className="w-full rounded-full border border-[#eadfd4] bg-white py-3 pl-12 pr-5 text-sm outline-none transition focus:border-[#e85d2a]"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-500" />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-[#eadfd4] bg-white px-4 py-3 text-sm outline-none focus:border-[#e85d2a]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-[#e85d2a] text-white shadow-lg shadow-orange-200"
                  : "border border-[#eadfd4] bg-white text-[#5b382b] hover:border-[#e85d2a]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* RESULT COUNT */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-[#261713]">
              {filteredPizzas.length}
            </span>{" "}
            pizzas
          </p>
        </div>

        {/* PIZZA GRID */}
        {filteredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPizzas.map((pizza) => (
              <PizzaCard
                key={pizza._id}
                pizza={pizza}
                onAddToCart={onAddToCart}
                isFavorite={favorites.includes(pizza._id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#e5d5c7] py-16 text-center">
            <Pizza
              size={42}
              className="mx-auto mb-4 text-[#e85d2a]"
            />

            <h3 className="text-xl font-bold text-[#261713]">
              No pizzas found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try a different search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setSortBy("featured");
              }}
              className="mt-5 rounded-full bg-[#e85d2a] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default PizzaCollection;
