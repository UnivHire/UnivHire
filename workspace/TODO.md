<instructions>
This file powers chat suggestion chips. Keep it focused and actionable.

# Be proactive
- Suggest ideas and things the user might want to add *soon*. 
- Important things the user might be overlooking (SEO, more features, bug fixes). 
- Look specifically for bugs and edge cases the user might be missing (e.g., what if no user has logged in).

# Rules
- Each task must be wrapped in a "<todo id="todo-id">" and "</todo>" tag pair.
- Inside each <todo> block:
  - First line: title (required)
  - Second line: description (optional)
- The id must be a short stable identifier for the task and must not change when you rewrite the title or description.
- You should proactively review this file after each response, even if the user did not explicitly ask, maintain it if there were meaningful changes (new requirement, task completion, reprioritization, or stale task cleanup).
- Think BIG: suggest ambitious features, UX improvements, technical enhancements, and creative possibilities.
- Balance quick wins with transformative ideas — include both incremental improvements and bold new features.
- Aim for 3-5 high-impact tasks that would genuinely excite the user.
- Tasks should be specific enough to act on, but visionary enough to inspire.
- Remove or rewrite stale tasks when completed, obsolete, or clearly lower-priority than current work.
- Re-rank by impact and user value, not just urgency.
- Draw inspiration from the project's existing features — what would make them 10x better?
- Don't be afraid to suggest features the user hasn't explicitly mentioned.
</instructions>

<todo id="seed-jobs">
Seed demo job postings to database
Add 5-10 real-looking verified job postings so the Candidate Dashboard shows live data instead of fallbacks
</todo>

<todo id="profile-pages">
Build Profile pages for Candidate and HR
Candidate /profile — edit name, role type, location, resume URL; HR /hr/profile — university info, contact details
</todo>

<todo id="notifications-page">
Build Notifications page for candidates
/notifications — list of application status updates, new matching jobs; badge count on navbar bell icon
</todo>

<todo id="mobile-polish">
Mobile responsiveness polish
Test hamburger menu, hero layout, bento grid on small screens — ensure no overflow
</todo>

<todo id="seo-meta">
Add SEO meta tags
Add og:image, description, and canonical URL meta tags to index.html for social sharing
</todo>

<todo id="forms-validation">
Add client-side form validation
DualCTA forms need field-level validation messages (phone format, email format, required fields)
</todo>