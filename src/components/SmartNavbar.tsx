import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, GraduationCap, MapPin, Settings, Bell, ChevronDown,
  LogOut, LayoutDashboard, User, FileText, Bookmark as BookmarkIcon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

/** Items shown when NOT logged in (landing page visitors) */
const PUBLIC_NAV = [
  { label: "Find Jobs", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Universities", href: "#for-universities" },
  { label: "FAQ", href: "#stats" },
];

/** Items shown to logged-in CANDIDATES */
const CANDIDATE_NAV = [
  { label: "Find Jobs ★", href: "/dashboard" },
  { label: "My Applications", href: "/applications" },
  { label: "Saved", href: "/saved" },
];

/** Items shown to logged-in HR */
const HR_NAV = [
  { label: "Post Job", href: "/hr/post-job" },
  { label: "My Jobs", href: "/hr/jobs" },
  { label: "Applications", href: "/hr/applications" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SmartNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, user, logout } = useAuthStore();
  const isLoggedIn = !!token;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const avatarRef = useRef<HTMLDivElement>(null);

  const isLanding = location.pathname === "/";

  /* Scroll-spy only on landing */
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => {
      const sections = PUBLIC_NAV.map((item) => document.querySelector(item.href)).filter(Boolean) as HTMLElement[];
      const current = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 140 && r.bottom >= 140;
      });
      if (current) setActiveHash(`#${current.id}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  /* Close avatar dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleScrollNav = (href: string) => {
    if (href.startsWith("#")) {
      if (!isLanding) {
        navigate("/");
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 350);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveHash(href);
      }
    } else {
      navigate(href);
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    document.cookie = "unihire_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "unihire_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    logout();
    navigate("/");
    setAvatarOpen(false);
  };

  const navItems = !isLoggedIn ? PUBLIC_NAV : role === "hr" || role === "admin" ? HR_NAV : CANDIDATE_NAV;

  const isActive = (href: string) => {
    if (href.startsWith("#")) return activeHash === href;
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ── Top navbar bar ────────────────────────────── */}
      <div className="bg-black px-6 md:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
            aria-label="Go to home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-white">
              <GraduationCap size={15} />
            </span>
            <span className="text-lg font-bold text-white tracking-tight">UniHire</span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleScrollNav(item.href)}
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
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/70">
              <MapPin size={13} />
              <span>India</span>
            </div>

            {isLoggedIn ? (
              <>
                {/* Settings */}
                <button
                  type="button"
                  onClick={() => navigate(role === "hr" ? "/hr/settings" : "/settings")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
                  aria-label="Settings"
                >
                  <Settings size={16} />
                </button>
                {/* Notifications */}
                <button
                  type="button"
                  onClick={() => navigate(role === "hr" ? "/hr/dashboard" : "/notifications")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                </button>
                {/* Avatar dropdown */}
                <div ref={avatarRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAvatarOpen((p) => !p)}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1 transition hover:bg-white/20"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                      {user ? getInitials(user.name) : "U"}
                    </span>
                    <ChevronDown size={14} className="text-white/60" />
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        className="absolute right-0 top-11 w-52 rounded-xl border border-border bg-white shadow-xl overflow-hidden"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="border-b border-border px-4 py-3">
                          <p className="text-sm font-bold text-foreground">{user?.name || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="py-1.5">
                          <DropdownItem icon={<LayoutDashboard size={14} />} label="My Dashboard" onClick={() => { navigate(role === "hr" ? "/hr/dashboard" : "/dashboard"); setAvatarOpen(false); }} />
                          <DropdownItem icon={<User size={14} />} label="Profile Settings" onClick={() => { navigate(role === "hr" ? "/hr/profile" : "/profile"); setAvatarOpen(false); }} />
                          <DropdownItem icon={<FileText size={14} />} label="My Applications" onClick={() => { navigate(role === "hr" ? "/hr/applications" : "/applications"); setAvatarOpen(false); }} />
                          {role === "candidate" && (
                            <DropdownItem icon={<BookmarkIcon size={14} />} label="Saved Jobs" onClick={() => { navigate("/saved"); setAvatarOpen(false); }} />
                          )}
                        </div>
                        <div className="border-t border-border py-1.5">
                          <DropdownItem icon={<LogOut size={14} />} label="Logout" onClick={handleLogout} danger />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Sign Up →
                </button>
              </>
            )}
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

      {/* ── Filter bar (desktop only, landing only) ─── */}
      {isLanding && (
        <div className="bg-[#111111] border-t border-white/10 px-6 md:px-10 hidden lg:block">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-4">
            <FilterPill icon="🔍" label="Role type" />
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
      )}

      {/* ── Mobile menu ────────────────────────────── */}
      <AnimatePresence>
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
                  onClick={() => handleScrollNav(item.href)}
                  className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive(item.href) ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-3 grid gap-2">
                {isLoggedIn ? (
                  <>
                    <button type="button" onClick={() => { navigate(role === "hr" ? "/hr/dashboard" : "/dashboard"); setMobileOpen(false); }} className="rounded-xl bg-secondary py-3 text-sm font-semibold text-white">
                      My Dashboard
                    </button>
                    <button type="button" onClick={() => { handleLogout(); setMobileOpen(false); }} className="rounded-xl border border-white/20 py-3 text-sm font-medium text-white">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { navigate("/signup"); setMobileOpen(false); }} className="rounded-xl bg-secondary py-3 text-sm font-semibold text-white">
                      Sign Up →
                    </button>
                    <button type="button" onClick={() => { navigate("/login"); setMobileOpen(false); }} className="rounded-xl border border-white/20 py-3 text-sm font-medium text-white">
                      Login
                    </button>
                  </>
                )}
              </div>
              {isLoggedIn && user && (
                <p className="mt-2 text-center text-xs text-white/40">Logged in as {user.name}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function FilterPill({ icon, label }: { icon: string; label: string }) {
  return (
    <button type="button" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white">
      <span>{icon}</span>
      <span>{label}</span>
      <span className="ml-1 text-white/40">▾</span>
    </button>
  );
}

function DropdownItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-muted ${danger ? "text-red-500 hover:text-red-600" : "text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}