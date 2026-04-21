import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, GraduationCap, MapPin, Settings, Bell } from "lucide-react";

const navItems = [
  { label: "Find Job", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Universities", href: "#for-universities" },
  { label: "Community", href: "#about" },
  { label: "FAQ", href: "#stats" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      const sections = navItems
        .map((item) => document.querySelector(item.href))
        .filter(Boolean) as HTMLElement[];
      const current = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 140 && r.bottom >= 140;
      });
      if (current) setActiveHash(`#${current.id}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveHash(href);
    setMobileOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Top dark navbar bar */}
      <div className="bg-black px-6 md:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("#home")}
            className="flex items-center gap-2 cursor-pointer"
            aria-label="Go to home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-white">
              <GraduationCap size={15} />
            </span>
            <span className="text-lg font-bold text-white tracking-tight">UnivHire</span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = activeHash === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className={`relative cursor-pointer px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white">
              <MapPin size={15} className="text-white" />
              <span className="ml-1 text-white">India</span>
            </div>
            <button
              type="button"
              onClick={() => handleNav("#for-universities")}
              className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Post a Job
            </button>
            <button
              type="button"
              onClick={() => handleNav("#for-candidates")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="rounded-lg bg-white/10 p-2 text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#111111] border-t border-white/10 px-6 md:px-10 hidden lg:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4">
          <FilterPill icon="🔍" label="Role type"/>
          <FilterPill icon="📍" label="Location" />
          <FilterPill icon="💼" label="Experience" />
          <FilterPill icon="💰" label="Salary range" />
          <div className="ml-auto flex items-center gap-3 text-sm text-white/60">
            <span className="text-white/40">Salary range</span>
            <span className="font-semibold text-white">₹20k – ₹2L/mo</span>
            <div className="relative flex w-28 items-center h-1 bg-white/20 rounded-full">
              <div className="absolute left-0 h-1 w-2/3 rounded-full bg-secondary" />
              <span className="absolute left-[42%] h-3 w-3 rounded-full bg-secondary border-2 border-white cursor-pointer" />
              <span className="absolute left-[62%] h-3 w-3 rounded-full bg-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="border-t border-white/10 bg-black lg:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex flex-col gap-1 px-5 py-5">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeHash === item.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => handleNav("#for-universities")}
                className="rounded-xl bg-secondary py-3 text-sm font-semibold text-white"
              >
                Post a Job
              </button>
              <button
                type="button"
                onClick={() => handleNav("#for-candidates")}
                className="rounded-xl border border-white/20 py-3 text-sm font-medium text-white"
              >
              Find Jobs
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function FilterPill({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-sm text-white transition hover:border-white/30"
    >
      <span className="text-white">{icon}</span>
      <span className="text-white">{label}</span>
      <span className="ml-1 text-white">▾</span>
    </button>
  );
}