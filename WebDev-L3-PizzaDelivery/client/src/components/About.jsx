
import { motion } from "motion/react";
import {
  ArrowRight,
  ChefHat,
  Heart,
  Leaf,
  Flame,
} from "lucide-react";

const highlights = [
  {
    icon: ChefHat,
    title: "Crafted with Passion",
    description: "Thoughtfully prepared pizzas with attention to detail.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "A focus on fresh toppings and delicious flavours.",
  },
  {
    icon: Heart,
    title: "Made for Sharing",
    description: "Good food and memorable moments belong together.",
  },
];

function About() {
  return (
    <section
      id="about"
      className="overflow-hidden bg-[#160d0b] px-5 py-24 text-white md:px-10 lg:px-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

        {/* LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full border border-orange-400/30" />

          <img
            src="https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1000"
            alt="Freshly prepared pizza"
            loading="lazy"
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl"
          />

          <div className="absolute -bottom-5 -right-3 rounded-2xl border border-white/10 bg-[#2b1915] p-5 shadow-xl sm:-right-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e85d2a]/15 text-[#ff784e]">
                <Flame size={25} />
              </div>
              <div>
                <p className="font-bold">Made with Passion</p>
                <p className="text-xs text-white/50">
                  Every single slice
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#ff784e]">
            Our Story
          </span>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight md:text-5xl">
            Bringing People
            <br />
            Together,{" "}
            <span className="text-[#ff784e]">
              One Slice at a Time.
            </span>
          </h2>

          <p className="mt-7 leading-8 text-white/60">
            At PizzaHouse, we believe great food creates great
            memories. Our goal is to make ordering delicious pizza
            simple, enjoyable and convenient.
          </p>

          <p className="mt-4 leading-8 text-white/60">
            From classic favourites to exciting combinations,
            explore a menu designed to bring more flavour to
            your everyday moments.
          </p>

          {/* Highlights */}
          <div className="mt-9 space-y-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="flex items-start gap-4"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e85d2a]/15 text-[#ff784e]">
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/50">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <a
            href="#menu"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#e85d2a] px-7 py-4 font-semibold transition hover:bg-[#ff784e]"
          >
            Explore Our Menu
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
