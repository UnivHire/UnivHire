<instructions>
This file will be automatically added to your context. 
It serves multiple purposes:
  1. Storing frequently used tools so you can use them without searching each time
  2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
  3. Maintaining useful information about the codebase structure and organization
  4. Remembering tricky quirks from this codebase

When you spend time searching for certain configuration files, tricky code coupled dependencies, or other codebase information, add that to this CODER.md file so you can remember it for next time.
Keep entries sorted in DESC order (newest first) so recent knowledge stays in prompt context if the file is truncated.
</instructions>

<coder>
# UniHire Project — Coder Notes

## SDK Version Critical
- ALWAYS use `"@animaapp/playground-react-sdk": "0.10.0"` (exact, no caret). `^0.12.x` breaks AnimaProvider.
- AnimaProvider must be the outermost wrapper in `src/index.tsx`, before BrowserRouter.
- Mount target is `<div id="app">` in `index.html` — NOT `#root`.

## Project Structure
- Entry: `src/index.tsx` → `src/App.tsx` (BrowserRouter) → `src/pages/LandingPage.tsx`
- Components: `src/components/` — Navbar, Hero, TrustBar, ProblemSolution, HowItWorks, Features, Stats, Testimonial, DualCTA, Footer
- Styles: `src/index.css` (CSS custom props + Tailwind), `tailwind.css`, `tailwind.config.js`
- Fonts: DM Sans + Playfair Display loaded via Google Fonts in `src/index.css`

## Icon Libraries
- Primary: `lucide-react` (use this for new icons)
- Legacy: `@phosphor-icons/react` may still exist in some components

## Tailwind Config
- Custom colors via CSS vars: `bg-background`, `text-foreground`, `bg-primary`, `text-tertiary`, etc.
- `--color-tertiary` = gold (#F5C542 equivalent)
- `--color-primary` = indigo (#5B4CF5 equivalent)

## Navbar
- No SDK hooks — pure local state + scroll handler
- Uses lucide-react Menu/X/GraduationCap icons
</coder>