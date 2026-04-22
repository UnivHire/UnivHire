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

const ROLE_OPTIONS = ["Role type", "Faculty", "Operations", "Security", "Driver"];
const LOCATION_OPTIONS = ["Location", "Delhi", "Mumbai", "Pune", "Bangalore"];
const EXPERIENCE_OPTIONS = ["Experience", "Fresher", "1-3 years", "3-5 years", "5+ years"];
const SALARY_OPTIONS = [
  { label: "₹20k-₹2L/mo", min: 20, max: 200 },
  { label: "₹20k-₹80k/mo", min: 20, max: 80 },
  { label: "₹40k-₹1.2L/mo", min: 40, max: 120 },
  { label: "₹80k-₹2L/mo", min: 80, max: 200 },
];

const SALARY_MIN_K = 20;
const SALARY_MAX_K = 200;

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
  const [roleIndex, setRoleIndex] = useState(0);
  const [locationIndex, setLocationIndex] = useState(0);
  const [experienceIndex, setExperienceIndex] = useState(0);
  const [salaryMinK, setSalaryMinK] = useState(20);
  const [salaryMaxK, setSalaryMaxK] = useState(120);
  const [openFilter, setOpenFilter] = useState<"role" | "location" | "experience" | "salary" | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
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
    document.cookie = "univhire_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "univhire_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    logout();
    navigate("/");
    setAvatarOpen(false);
  };

  const navItems = !isLoggedIn ? PUBLIC_NAV : role === "hr" || role === "admin" ? HR_NAV : CANDIDATE_NAV;

  const isActive = (href: string) => {
    if (href.startsWith("#")) return activeHash === href;
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const formatSalary = (k: number) => {
    if (k >= 100) {
      const lpa = Number((k / 100).toFixed(1));
      return `₹${lpa % 1 === 0 ? lpa.toFixed(0) : lpa}L`;
    }
    return `₹${k}k`;
  };

  const salaryProgressStart = ((salaryMinK - SALARY_MIN_K) / (SALARY_MAX_K - SALARY_MIN_K)) * 100;
  const salaryProgressWidth = ((salaryMaxK - salaryMinK) / (SALARY_MAX_K - SALARY_MIN_K)) * 100;

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
            <span className="text-lg font-bold text-white tracking-tight">UnivHire</span>
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
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white">
              <MapPin size={13} className="text-white" />
              <span className="text-white">India</span>
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
                          <DropdownItem icon={<User size={14} />} label="My Profile" onClick={() => { navigate(role === "hr" ? "/hr/profile" : "/profile"); setAvatarOpen(false); }} />
                          <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={() => { navigate(role === "hr" ? "/hr/settings" : "/settings"); setAvatarOpen(false); }} />
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
          <div ref={filterBarRef} className="mx-auto flex h-14 max-w-7xl items-center gap-4">
            <FilterPill
              icon="🔍"
              value={ROLE_OPTIONS[roleIndex]}
              isOpen={openFilter === "role"}
              onToggle={() => setOpenFilter((p) => (p === "role" ? null : "role"))}
              options={ROLE_OPTIONS}
              onSelect={(index) => {
                setRoleIndex(index);
                setOpenFilter(null);
              }}
            />
            <FilterPill
              icon="📍"
              value={LOCATION_OPTIONS[locationIndex]}
              isOpen={openFilter === "location"}
              onToggle={() => setOpenFilter((p) => (p === "location" ? null : "location"))}
              options={LOCATION_OPTIONS}
              onSelect={(index) => {
                setLocationIndex(index);
                setOpenFilter(null);
              }}
            />
            <FilterPill
              icon="💼"
              value={EXPERIENCE_OPTIONS[experienceIndex]}
              isOpen={openFilter === "experience"}
              onToggle={() => setOpenFilter((p) => (p === "experience" ? null : "experience"))}
              options={EXPERIENCE_OPTIONS}
              onSelect={(index) => {
                setExperienceIndex(index);
                setOpenFilter(null);
              }}
            />
            <FilterPill
              icon="💰"
              value={`${formatSalary(salaryMinK)}-${formatSalary(salaryMaxK)}/mo`}
              isOpen={openFilter === "salary"}
              onToggle={() => setOpenFilter((p) => (p === "salary" ? null : "salary"))}
              options={SALARY_OPTIONS.map((s) => s.label)}
              onSelect={(index) => {
                setSalaryMinK(SALARY_OPTIONS[index].min);
                setSalaryMaxK(SALARY_OPTIONS[index].max);
                setOpenFilter(null);
              }}
            />
            <div className="ml-auto flex items-center gap-3 text-sm text-white/60">
              <span className="text-white/40">Salary range</span>
              <span className="font-semibold text-white">{formatSalary(salaryMinK)}–{formatSalary(salaryMaxK)}/mo</span>
              <div className="relative w-36">
                <div className="h-1 w-full rounded-full bg-white/20" />
                <div
                  className="absolute top-0 h-1 rounded-full bg-secondary"
                  style={{ left: `${salaryProgressStart}%`, width: `${salaryProgressWidth}%` }}
                />
                <input
                  type="range"
                  min={SALARY_MIN_K}
                  max={SALARY_MAX_K}
                  step={5}
                  value={salaryMinK}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSalaryMinK(Math.min(next, salaryMaxK - 5));
                  }}
                  className="absolute left-0 top-[-6px] h-4 w-full cursor-pointer appearance-none bg-transparent"
                  aria-label="Minimum salary"
                />
                <input
                  type="range"
                  min={SALARY_MIN_K}
                  max={SALARY_MAX_K}
                  step={5}
                  value={salaryMaxK}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSalaryMaxK(Math.max(next, salaryMinK + 5));
                  }}
                  className="absolute left-0 top-[-6px] h-4 w-full cursor-pointer appearance-none bg-transparent"
                  aria-label="Maximum salary"
                />
                <span className="pointer-events-none absolute top-[-4px] h-3 w-3 rounded-full border-2 border-white bg-secondary" style={{ left: `calc(${salaryProgressStart}% - 6px)` }} />
                <span className="pointer-events-none absolute top-[-4px] h-3 w-3 rounded-full bg-white" style={{ left: `calc(${salaryProgressStart + salaryProgressWidth}% - 6px)` }} />
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

function FilterPill({
  icon,
  value,
  isOpen,
  onToggle,
  options,
  onSelect,
}: {
  icon: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  options: string[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white transition hover:border-white/30"
      >
        <span className="text-white">{icon}</span>
        <span className="text-white">{value}</span>
        <span className="ml-1 text-white">▾</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 top-11 z-50 min-w-full rounded-xl border border-white/15 bg-[#161616] p-1.5 shadow-xl"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(index)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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