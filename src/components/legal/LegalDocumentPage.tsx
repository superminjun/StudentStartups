import { motion } from 'framer-motion';

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
  sections: LegalSection[];
};

export default function LegalDocumentPage({
  eyebrow,
  title,
  subtitle,
  lastUpdatedLabel,
  lastUpdatedValue,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div>
      <section className="section bg-charcoal pt-28 lg:pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl text-base leading-relaxed text-white/60"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{lastUpdatedLabel}</span>
              <span>{lastUpdatedValue}</span>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-2 pl-5 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="list-disc">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
