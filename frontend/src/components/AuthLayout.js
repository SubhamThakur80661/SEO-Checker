import { motion } from 'framer-motion';
import { TrendingUp, FileText, KeyRound, History as HistoryIcon } from 'lucide-react';

const PANEL_POINTS = [
  { icon: FileText, text: 'Audit any page — title, description, and the basics search engines check.' },
  { icon: KeyRound, text: 'Find keyword ideas for a topic, in plain language.' },
  { icon: HistoryIcon, text: 'Past audits and searches stay in one place.' },
];

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex bg-parchment">
      <div className="hidden lg:flex w-[44%] bg-olivewood text-parchment flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="bg-parchment/10 ring-1 ring-parchment/20 p-2 rounded-lg">
            <TrendingUp className="text-olive" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">RankPilot</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-8">
            See what search engines see.
          </h1>
          <ul className="space-y-5">
            {PANEL_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3.5 text-[15px] leading-relaxed text-parchment/80">
                <span className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-parchment/10 ring-1 ring-parchment/15 flex items-center justify-center">
                  <Icon size={16} className="text-olive" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-parchment/50">
          A small tool for checking SEO — no dashboards full of noise.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="bg-olivewood p-2 rounded-lg">
              <TrendingUp className="text-olive" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-olivewood">RankPilot</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-olivewood">{title}</h2>
          <p className="text-bark mt-1.5 mb-8">{subtitle}</p>

          {children}

          {footer && (
            <p className="mt-8 text-center text-sm text-bark">{footer}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
