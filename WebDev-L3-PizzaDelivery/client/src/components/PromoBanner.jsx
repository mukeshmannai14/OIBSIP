
import { motion } from "motion/react";
import { ArrowRight, Tag, Sparkles } from "lucide-react";

function PromoBanner() {
  const handleExplore = () => {
    document.getElementById("menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]
        bg-gradient-to-r from-orange-600 via-red-600 to-rose-700
        px-6 py-12 sm:px-12 lg:px-16"
      >
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              <Sparkles size={16} />
              Limited Time Offer
            </div>

            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Big Hunger?
              <br />
              <span className="text-yellow-300">
                Bigger Savings!
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
              Enjoy your favourite pizzas, burgers and noodles.
              Discover delicious food and exciting offers.
            </p>

            <button
              onClick={handleExplore}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-bold text-red-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300"
            >
              <Tag size={18} />
              Explore Menu
              <ArrowRight size={18} />
            </button>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-48 w-48 shrink-0 flex-col items-center justify-center rounded-full border-4 border-dashed border-yellow-300 bg-yellow-300 text-center shadow-2xl sm:h-56 sm:w-56"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-red-700">
              Get up to
            </span>

            <span className="font-display text-6xl font-black text-red-700">
              30%
            </span>

            <span className="text-lg font-extrabold uppercase text-red-700">
              OFF
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default PromoBanner;
