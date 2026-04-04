import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Megaphone, Hammer, PiggyBank, Palette } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  hammer: Hammer,
  piggybank: PiggyBank,
  palette: Palette,
};

type TeamCardInfo = {
  nameKey: string;
  descKey: string;
  icon: string;
  color: string;
};

export default function TeamCard({ team, index }: { team: TeamCardInfo; index: number }) {
  const { t } = useLanguage();
  const Icon = iconMap[team.icon] || Megaphone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group card card-hover p-6"
    >
      <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${team.color} text-white`}>
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {t(team.nameKey)}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t(team.descKey)}
      </p>
    </motion.div>
  );
}
