
import { motion } from "motion/react";
import {
  ChefHat,
  Leaf,
  Flame,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: ChefHat,
    number: "01",
    title: "Crafted by Passion",
    description:
      "Every pizza is carefully prepared with attention to flavour, texture and quality.",
  },
  {
    icon: Leaf,
    number: "02",
    title: "Fresh Ingredients",
    description:
      "We focus on fresh ingredients and carefully selected toppings in every order.",
  },
  {
    icon: Flame,
    number: "03",
    title: "Made to Order",
    description:
      "Your pizza is prepared when you order, so you can enjoy it fresh and warm.",
  },
  {
    icon: HeartHandshake,
    number: "04",
    title: "Customer First",
    description:
      "A simple ordering experience and friendly support are at the heart of our service.",
  },
];

function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#160d0b] px-5 py-24 text-white md:px-10 lg:px-20">
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-600/10 blur-[100px]" />
      <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-red-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#ff784e]">
            The Difference
          </span>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            More Than Pizza.
            <br />
            <span className="text-[#ff784e]">
              It's an Experience.
            </span>
          </h2>

          <p className="mt-5 leading-7 text-white/55">
            Great pizza starts with great ingredients, careful
            preparation and a passion for serving something special.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
                whileHover={{ y: -8 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-orange-400/40 hover:bg-white/[0.07]"
              >
                <div className="mb-9 flex items-center justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e85d2a]/15 text-[#ff784e] transition group-hover:bg-[#e85d2a] group-hover:text-white">
                    <Icon size={27} />
                  </div>

                  <span className="text-sm font-semibold text-white/25">
                    {feature.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/50">
                  {feature.description}
                </p>

                <div className="mt-7 flex justify-end">
                  <ArrowUpRight
                    size={20}
                    className="text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#ff784e]"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
