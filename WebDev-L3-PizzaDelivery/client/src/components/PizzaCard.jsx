import { motion } from "motion/react";
import { Heart, Plus, Flame } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800";

function PizzaCard({ pizza, isFavorite, onToggleFavorite }) {
  const { addToCart } = useCart();

  if (!pizza) return null;

  const handleAddToCart = () => {
    try {
      addToCart(pizza);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -7 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-3xl border border-[#eee5dc] bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      {/* Pizza Image */}
      <div className="relative h-56 overflow-hidden bg-[#f8f1e9]">
        <img
          src={pizza.image || FALLBACK_IMAGE}
          alt={pizza.name || "Pizza"}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Category */}
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5b382b] shadow">
          {pizza.category || "Pizza"}
        </span>

        {/* Favorite */}
        <button
          type="button"
          onClick={() => onToggleFavorite?.(pizza._id)}
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={Boolean(isFavorite)}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white shadow transition hover:scale-110"
        >
          <Heart
            size={19}
            className={
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }
          />
        </button>
      </div>

      {/* Pizza Details */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-[#261713]">
            {pizza.name || "Untitled Pizza"}
          </h3>

          <span className="shrink-0 font-bold text-[#e85d2a]">
            {formatCurrency(Number(pizza.price) || 0)}
          </span>
        </div>

        <p className="mb-5 min-h-12 text-sm leading-6 text-gray-500">
          {pizza.description || "Freshly prepared with delicious ingredients."}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Flame size={15} className="text-orange-500" />
            Freshly prepared
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!pizza.isAvailable}
            className="inline-flex items-center gap-2 rounded-full bg-[#e85d2a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9471d] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <Plus size={17} />
            {pizza.isAvailable ? "Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default PizzaCard;