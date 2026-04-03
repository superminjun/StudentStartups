import { motion } from 'framer-motion';
import { Lightbulb, Search, Layers, FlaskConical, Factory, Megaphone, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import ScrollReveal from './ScrollReveal';

const steps = [
  { id: '01', titleKey: 'workflow.steps.step1Title', descKey: 'workflow.steps.step1Desc', icon: Lightbulb },
  { id: '02', titleKey: 'workflow.steps.step2Title', descKey: 'workflow.steps.step2Desc', icon: Search },
  { id: '03', titleKey: 'workflow.steps.step3Title', descKey: 'workflow.steps.step3Desc', icon: Layers },
  { id: '04', titleKey: 'workflow.steps.step4Title', descKey: 'workflow.steps.step4Desc', icon: FlaskConical },
  { id: '05', titleKey: 'workflow.steps.step5Title', descKey: 'workflow.steps.step5Desc', icon: Factory },
  { id: '06', titleKey: 'workflow.steps.step6Title', descKey: 'workflow.steps.step6Desc', icon: Megaphone },
  { id: '07', titleKey: 'workflow.steps.step7Title', descKey: 'workflow.steps.step7Desc', icon: BarChart3 },
];

export default function WorkflowSteps() {
  const { t } = useLanguage();

  return (
    <section className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            {t('workflow.title')}
          </h2>
          <p className="mt-3 text-base text-mid">{t('workflow.subtitle')}</p>
        </ScrollReveal>

        <div className="mt-14">
          <div className="flex flex-wrap justify-center gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={step.id} delay={i * 0.06} direction="up">
                  <motion.div
                    className="group flex w-[140px] flex-col items-center text-center sm:w-[160px]"
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl bg-muted transition-colors duration-200 group-hover:bg-[hsl(24,80%,50%)]"
                    >
                      <Icon
                        className="size-6 text-[hsl(20,5%,45%)] transition-colors duration-200 group-hover:text-white"
                      />
                    </div>
                    <span className="mt-3 text-xs font-semibold text-light">{step.id}</span>
                    <h3 className="mt-1 text-sm font-semibold leading-tight text-charcoal">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-mid/80">
                      {t(step.descKey)}
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
