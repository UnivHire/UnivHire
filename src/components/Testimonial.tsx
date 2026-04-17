export function Testimonial() {
  return (
    <section id="about" className="section-shell bg-background">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="section-title">A platform language HR teams can trust</h2>
          <p className="section-copy mt-3">
            UniHire is designed to feel institutional and humane, helping teams move faster without losing credibility.
          </p>
        </div>

        <article className="rounded-3xl border border-border bg-white p-8 md:p-12">
          <div className="mb-5 flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <span key={i} className="text-tertiary text-lg">★</span>
            ))}
          </div>
          <p className="mb-8 text-xl font-medium leading-9 text-foreground md:text-2xl">
            &#34;UniHire gives us one serious, elegant place to publish verified openings. The clarity matters not only for faculty roles, but also for the operational positions that often go unseen on traditional career portals.&#34;
          </p>
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <img
              src="https://c.animaapp.com/mo2h6vymSLfXrm/img/ai_4.png"
              alt="HR professional"
              loading="lazy"
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground">Anita Sharma</p>
              <p className="text-sm text-muted-foreground">Director of HR, Regional University Network</p>
            </div>
            <span className="rounded-full border border-tertiary/30 bg-tertiary/10 px-4 py-1.5 text-sm font-semibold text-tertiary">
              5.0 / 5 trusted partner
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}