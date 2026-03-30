import { motion } from 'framer-motion';
import { Lightbulb, Search, Layers, FlaskConical, Factory, Megaphone, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { workflowSteps } from '@/constants/mockData';
import ScrollReveal from './ScrollReveal';

const icons = [Lightbulb, Search, Layers, FlaskConical, Factory, Megaphone, BarChart3];

export default function WorkflowSteps() {
  const { lang, t } = useLanguage();

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            {t('workflow.title')}
          </h2>
          <p className="mt-3 text-base text-mid">{t('workflow.subtitle')}</p>
        </ScrollReveal>

        <div className="mt-14">
          <div className="flex flex-wrap justify-center gap-6">
            {workflowSteps.map((step, i) => {
              const Icon = icons[i];
              return (
                <ScrollReveal key={step.id} delay={i * 0.06} direction="up">
                  <motion.div
                    className="group flex w-[140px] flex-col items-center text-center sm:w-[160px]"
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl bg-[hsl(30,15%,92%)] transition-colors duration-200 group-hover:bg-[hsl(24,80%,50%)]"
                    >
                      <Icon
                        className="size-6 text-[hsl(20,5%,45%)] transition-colors duration-200 group-hover:text-white"
                      />
                    </div>
                    <span className="mt-3 text-xs font-semibold text-light">{step.id}</span>
                    <h3 className="mt-1 text-sm font-semibold leading-tight text-charcoal">
                      {lang === 'en' ? step.titleEn : step.titleKo}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-mid/80">
                      {lang === 'en' ? step.descEn : step.descKo}
                    </p>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
