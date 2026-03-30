import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Megaphone, Hammer, PiggyBank, Palette } from 'lucide-react';
import type { TeamInfo } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  hammer: Hammer,
  piggybank: PiggyBank,
  palette: Palette,
};

export default function TeamCard({ team, index }: { team: TeamInfo; index: number }) {
  const { lang } = useLanguage();
  const Icon = iconMap[team.icon] || Megaphone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6 transition-shadow hover:shadow-lg"
    >
      <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${team.color} text-white`}>
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-charcoal">
        {lang === 'en' ? team.nameEn : team.nameKo}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-mid">
        {lang === 'en' ? team.descEn : team.descKo}
      </p>
    </motion.div>
  );
}
