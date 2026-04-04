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
    <section id="process" className="section bg-card scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-2xl">
          <p className="section-kicker">{t('workflow.kicker')}</p>
          <h2 className="section-title mt-3">{t('workflow.title')}</h2>
          <p className="section-lead">{t('workflow.subtitle')}</p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.id} delay={i * 0.05} direction="up">
                <motion.div
                  className="card card-hover p-5"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{step.id}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
