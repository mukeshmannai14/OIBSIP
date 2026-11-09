import { motion } from "motion/react";
import { ArrowRight, Clock3, Flame, Star } from "lucide-react";

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] overflow-hidden bg-[#160d0b] px-5 py-20 text-white md:px-10 lg:px-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm text-orange-300">
            <Flame size={16} />
            Freshly baked, always delicious
          </span>

          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
            Every Slice
            <br />
            Tells a{" "}
            <span className="text-[#ff784e]">Story.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-white/65 md:text-lg">
            Discover handcrafted pizzas made with fresh ingredients,
            delicious sauces and flavours worth sharing.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 rounded-full bg-[#e85d2a] px-7 py-4 font-semibold transition hover:bg-[#ff784e]"
            >
              Explore Menu
              <ArrowRight size={18} />
            </a>

            <a
              href="#About"
              className="rounded-full border border-white/20 px-7 py-4 font-semibold transition hover:bg-white/10"
            >
              Our Story
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-bold">Fresh</p>
              <p className="mt-1 text-sm text-white/50">
                Quality ingredients
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">Hot</p>
              <p className="mt-1 text-sm text-white/50">
                Made to order
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">Tasty</p>
              <p className="mt-1 text-sm text-white/50">
                Crafted with care
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl" />

          <img
            src="https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1000"
            alt="Freshly baked pizza"
            className="relative aspect-square w-full rounded-full object-cover shadow-2xl"
          />

          <div className="absolute -bottom-5 left-0 rounded-2xl border border-white/10 bg-[#2b1915] p-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Clock3 className="text-orange-400" size={20} />
              <span className="font-semibold">Freshly prepared</span>
            </div>
          </div>

          <div className="absolute -right-3 top-10 rounded-2xl border border-white/10 bg-[#2b1915] p-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Star className="fill-orange-400 text-orange-400" size={18} />
              <span className="font-semibold">Made with care</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;