// Reusable card showing an AI suggestion / recommendation.
import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const AiSuggestionCard: React.FC<Props> = ({ title = 'AI Recommendation', children, action }) => (
  <div className="rounded-xl border border-purple/20 bg-gradient-to-br from-purple-light to-info-light p-4 flex gap-3">
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple to-info flex items-center justify-center shrink-0">
      <Sparkles className="w-4.5 h-4.5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-purple mb-1">{title}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default AiSuggestionCard;
