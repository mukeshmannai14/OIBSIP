
import {
  Pizza,
  ArrowUp,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Our Menu", href: "#menu" },
  { label: "About Us", href: "#about" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
  },
  {
    label: "Twitter",
    href: "https://x.com/",
  },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#120a08] px-5 pb-8 pt-16 text-white md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">

        {/* Main Footer */}
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <a href="#home" className="inline-flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e85d2a]">
                <Pizza size={27} />
              </div>

              <span className="text-2xl font-extrabold">
                Pizza<span className="text-[#ff784e]">House.</span>
              </span>
            </a>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/50">
              Bringing people together, one delicious slice
              at a time. Discover your favourite pizza with us.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-[#e85d2a] hover:bg-[#e85d2a] hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Quick Links
            </h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition hover:text-[#ff784e]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Contact Us
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin size={18} className="shrink-0 text-[#ff784e]" />
                <span>Residential Complex, Green Park- Tamilnadu</span>
              </li>

              <li className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={18} className="shrink-0 text-[#ff784e]" />
                <span>91+ 9874561201</span>
              </li>

              <li className="flex items-center gap-3 text-sm text-white/50">
                <Mail size={18} className="shrink-0 text-[#ff784e]" />
                <span>Pizzahut@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Opening Hours
            </h3>

            <div className="flex items-start gap-3">
              <Clock size={19} className="mt-1 shrink-0 text-[#ff784e]" />

              <div className="text-sm leading-7 text-white/50">
                <p>Monday – Sunday</p>
                <p className="font-semibold text-white">
                  10:00 AM – 10:00 PM
                </p>
                <p className="mt-2 text-xs">
                  Demo hours — update to actual business hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/40">
            © {currentYear} PizzaHut. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs font-semibold text-white/70 transition hover:border-[#e85d2a] hover:bg-[#e85d2a] hover:text-white"
          >
            Back to top
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
