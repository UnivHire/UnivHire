import { Linkedin, Twitter } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Universities", href: "#for-universities" },
  { label: "For Candidates", href: "#for-candidates" },
  { label: "About", href: "#about" },
];

export function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-content gap-10 px-8 py-14 md:px-12 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="text-2xl font-bold text-foreground">UniHire</p>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            India&#39;s first centralized hiring platform for verified university opportunities across academic and campus operations roles.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Navigation</p>
          <nav className="grid gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="w-fit rounded-lg px-2 py-2 text-sm text-foreground transition hover:text-secondary"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connect</p>
          <div className="flex gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-secondary hover:text-secondary"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-secondary hover:text-secondary"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">Made in India for transparent university hiring.</p>
        </div>
      </div>

      <div className="border-t border-border px-8 py-5 text-center md:px-12">
        <p className="text-xs text-muted-foreground">© 2026 UniHire. All rights reserved.</p>
      </div>
    </footer>
  );
}