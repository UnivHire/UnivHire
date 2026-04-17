const logos = [
  "UP Universities",
  "Delhi HR Boards",
  "Maharashtra Campuses",
  "Faculty Councils",
  "Verified Recruiters",
  "Regional Institutions",
  "Bihar Universities",
  "Karnataka Campuses",
];

export function TrustBar() {
  return (
    <section className="bg-white border-b border-border py-5 px-6 md:px-10">
      <div className="mx-auto flex max-w-content flex-col gap-3 overflow-hidden">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by HR departments across India
        </p>
        <div className="overflow-hidden">
          <div className="flex w-[200%] animate-marquee gap-5">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="min-w-fit rounded-full border border-border bg-background px-5 py-2"
              >
                <span className="text-sm font-medium text-foreground">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}