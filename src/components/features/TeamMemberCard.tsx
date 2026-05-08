import { useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import MemberPortrait from '@/components/features/MemberPortrait';
import type { TeamMemberShowcase } from '@/types';
import { cn } from '@/lib/utils';

type TeamMemberCardProps = {
  member: TeamMemberShowcase;
  lang: 'en' | 'ko';
  joinedLabel: string;
  founderLabel: string;
  recentlyActiveLabel: string;
  viewProfileLabel: string;
  onSelect: (member: TeamMemberShowcase) => void;
  priority?: boolean;
};

export default function TeamMemberCard({
  member,
  lang,
  joinedLabel,
  founderLabel,
  recentlyActiveLabel,
  viewProfileLabel,
  onSelect,
  priority = false,
}: TeamMemberCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });
  const imageScale = useSpring(1, { stiffness: 220, damping: 24, mass: 0.7 });

  const handleMove = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleEnter = () => {
    imageScale.set(1.06);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    imageScale.set(1);
  };

  const joinedText = `${joinedLabel} ${new Date(`${member.joinDate}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })}`;
  const shortDescription = lang === 'ko'
    ? (member.shortDescriptionKo || member.shortDescriptionEn || '')
    : (member.shortDescriptionEn || member.shortDescriptionKo || '');

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(member)}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileHover={{ y: -6 }}
      className={cn(
        'group relative w-full overflow-hidden rounded-[28px] border border-border/70 bg-card text-left shadow-[0_20px_60px_-30px_rgba(15,23,42,0.24)] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2'
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.div style={{ scale: imageScale }} className="absolute inset-0">
          <MemberPortrait
            name={member.name}
            src={member.photo}
            alt={member.name}
            priority={priority}
            className="h-full w-full"
            imageClassName="transition-transform duration-500"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%),linear-gradient(180deg,transparent_26%,rgba(15,23,42,0.14)_70%,rgba(15,23,42,0.52)_100%)]" />

        {member.founder && (
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white backdrop-blur-md">
            {founderLabel}
          </div>
        )}

        {member.recentlyActive && (
          <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/18 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            {recentlyActiveLabel}
          </div>
        )}

        <motion.div
          initial={false}
          className="absolute inset-x-4 bottom-4 rounded-[22px] border border-white/16 bg-white/10 p-4 text-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.75)] backdrop-blur-xl transition-all duration-400 group-hover:bg-white/14"
        >
          <div className="space-y-1">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-base font-semibold tracking-tight">{member.name}</p>
                <p className="text-sm text-white/78">{member.role}</p>
              </div>
              <span className="hidden text-xs font-medium text-white/70 sm:block">{viewProfileLabel}</span>
            </div>
            {shortDescription && (
              <p className="text-xs leading-5 text-white/74 line-clamp-2">{shortDescription}</p>
            )}
            <p className="text-xs text-white/68">{joinedText}</p>
            {member.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {member.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/16 bg-black/12 px-2 py-0.5 text-[10px] font-medium text-white/76">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}
