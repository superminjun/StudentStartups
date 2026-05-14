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
  const { lang, t } = useLanguage();

  return (
    <section id="process" className="section relative overflow-hidden bg-card scroll-mt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrollReveal className="max-w-2xl">
            <p className="section-kicker">{t('workflow.kicker')}</p>
            <h2 className="section-title mt-3">{t('workflow.title')}</h2>
            <p className="section-lead">{t('workflow.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.12} className="mt-8 hidden overflow-hidden rounded-[2rem] border border-border bg-background/70 p-4 shadow-xl shadow-foreground/5 backdrop-blur-xl lg:block">
            <div className="aspect-[4/3] rounded-[1.45rem] bg-[radial-gradient(circle_at_28%_20%,hsl(var(--color-accent)/0.22),transparent_26%),linear-gradient(135deg,hsl(var(--color-beige)),hsl(var(--color-warm-white)))] p-5">
              <div className="flex h-full flex-col justify-between rounded-[1.2rem] border border-border bg-card/75 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{lang === 'ko' ? '운영 시스템' : 'Operating system'}</p>
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-foreground">01–07</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {lang === 'ko' ? '초기 아이디어에서 공개 출시까지 이어지는 단계형 흐름입니다.' : 'A staged path from rough idea to public launch.'}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.id} delay={i * 0.04} direction={i % 2 === 0 ? 'left' : 'right'} amount={0.2}>
                <motion.div
                  className="group card card-hover grid gap-5 p-5 will-change-transform sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      {t(step.descKey)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground sm:text-right">{step.id}</span>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
