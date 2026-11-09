
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Subscription failed");
      }

      setSubscribed(true);
      setEmail("");
      toast.success("Successfully subscribed!");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#fffaf3] px-5 py-20 md:px-10 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#e85d2a] px-6 py-14 text-center text-white md:px-16 md:py-20"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border-[35px] border-white/10" />

        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
            <Mail size={30} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/75">
            Stay Connected
          </p>

          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
            A Little More Pizza
            <br />
            in Your Inbox.
          </h2>

          <p className="mt-5 leading-7 text-white/80">
            Subscribe to receive updates about our menu,
            new flavours and special announcements.
          </p>

          {subscribed ? (
            <div className="mt-9 flex items-center justify-center gap-2 rounded-full bg-white/15 px-5 py-4 font-semibold">
              <CheckCircle2 size={21} />
              You're subscribed!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row sm:rounded-full"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Mail size={19} className="shrink-0 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#261713] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#40251c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Subscribing..." : "Subscribe"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          )}

          <p className="mt-5 text-xs text-white/70">
            No spam. Just pizza updates.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default Newsletter;