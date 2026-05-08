import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function HeroSection() {
  const { lang } = useLanguage();
  const copy = lang === 'ko'
    ? {
        kicker: 'Student Startups',
        title: '현실에 닿는 학생 주도 벤처.',
        subtitle: 'Student Startups는 학생들이 교실 밖에서 실제 프로젝트를 설계하고, 만들고, 출시하는 벤처 스튜디오입니다.',
        primary: '작업 보기',
        secondary: '팀 합류',
      }
    : {
        kicker: 'Student Startups',
        title: 'Student-led ventures, built for the real world.',
        subtitle: 'Student Startups helps students design, build, and launch real projects beyond the classroom.',
        primary: 'Explore Our Work',
        secondary: 'Join the Team',
      };

  return (
    <section id="intro" className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-border bg-background px-4 pt-16 sm:px-6">
      <motion.div className="w-full">
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-accent"
          >
            {copy.kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl"
          >
            {copy.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            {copy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/projects"
              className="btn btn-primary group"
            >
              {copy.primary}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {copy.secondary}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
