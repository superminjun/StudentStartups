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
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <header className="border-b border-[var(--ss-rule)] py-12 lg:py-16">
        <div className="ss-wrap max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ss-label text-[var(--ss-accent)]"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="ss-heading mt-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--ss-muted)]"
          >
            {subtitle}
          </motion.p>
        </div>
      </header>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap max-w-5xl">
          <div className="border-t border-border py-6">
            <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-border pb-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{lastUpdatedLabel}</span>
              <span>{lastUpdatedValue}</span>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="font-heading text-xl font-medium text-foreground">{section.heading}</h2>
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
