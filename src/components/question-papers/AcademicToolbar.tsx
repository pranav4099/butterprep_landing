import React, { useState } from 'react';
import {
  Bold, Italic, List, ListOrdered, Superscript, Subscript,
  Sigma, ImagePlus, TableProperties, FileText, StickyNote,
  ChevronDown,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AcademicToolbarProps {
  active: boolean;
  onInsertSymbol: (symbol: string) => void;
  onInsertFormatting: (type: 'bold' | 'italic' | 'superscript' | 'subscript' | 'bullet' | 'numbered') => void;
  onInsertBlock: (type: 'equation' | 'table' | 'image' | 'note') => void;
}

const mathSymbols = [
  { symbol: '±', label: 'Plus-minus' },
  { symbol: '×', label: 'Multiply' },
  { symbol: '÷', label: 'Divide' },
  { symbol: '√', label: 'Square root' },
  { symbol: 'π', label: 'Pi' },
  { symbol: 'θ', label: 'Theta' },
  { symbol: '≤', label: 'Less or equal' },
  { symbol: '≥', label: 'Greater or equal' },
  { symbol: '≠', label: 'Not equal' },
  { symbol: '∑', label: 'Summation' },
  { symbol: '∞', label: 'Infinity' },
  { symbol: '∈', label: 'Element of' },
  { symbol: '∴', label: 'Therefore' },
  { symbol: '∵', label: 'Because' },
  { symbol: '∠', label: 'Angle' },
  { symbol: '⊥', label: 'Perpendicular' },
  { symbol: '∥', label: 'Parallel' },
  { symbol: '△', label: 'Triangle' },
];

const scienceSymbols = [
  { symbol: 'μ', label: 'Mu' },
  { symbol: 'σ', label: 'Sigma' },
  { symbol: 'Δ', label: 'Delta' },
  { symbol: '→', label: 'Arrow' },
  { symbol: '°', label: 'Degree' },
  { symbol: 'α', label: 'Alpha' },
  { symbol: 'β', label: 'Beta' },
  { symbol: 'γ', label: 'Gamma' },
  { symbol: 'λ', label: 'Lambda' },
  { symbol: 'Ω', label: 'Omega' },
  { symbol: '⇌', label: 'Equilibrium' },
  { symbol: '↑', label: 'Up arrow' },
  { symbol: '↓', label: 'Down arrow' },
  { symbol: 'ℏ', label: 'h-bar' },
];

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onClick, disabled, active }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all',
          disabled
            ? 'text-muted-foreground/25 cursor-not-allowed'
            : active
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
  </Tooltip>
);

const Divider = () => <div className="w-5 h-px bg-border mx-auto my-0.5" />;

const AcademicToolbar: React.FC<AcademicToolbarProps> = ({
  active,
  onInsertSymbol,
  onInsertFormatting,
  onInsertBlock,
}) => {
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const [symbolTab, setSymbolTab] = useState<'math' | 'science'>('math');

  return (
    <div className={cn(
      'w-10 border-r border-border bg-card/80 backdrop-blur-sm flex flex-col items-center py-2 shrink-0 overflow-hidden transition-opacity sticky top-0 h-[calc(100vh-45px)] justify-evenly',
      !active && 'opacity-50'
    )}>
      <ToolButton
        icon={<Bold className="w-3.5 h-3.5" />}
        label="Bold"
        onClick={() => onInsertFormatting('bold')}
        disabled={!active}
      />
      <ToolButton
        icon={<Italic className="w-3.5 h-3.5" />}
        label="Italic"
        onClick={() => onInsertFormatting('italic')}
        disabled={!active}
      />
      <ToolButton
        icon={<List className="w-3.5 h-3.5" />}
        label="Bullet list"
        onClick={() => onInsertFormatting('bullet')}
        disabled={!active}
      />
      <ToolButton
        icon={<ListOrdered className="w-3.5 h-3.5" />}
        label="Numbered list"
        onClick={() => onInsertFormatting('numbered')}
        disabled={!active}
      />

      <Divider />

      <ToolButton
        icon={<Superscript className="w-3.5 h-3.5" />}
        label="Superscript (x²)"
        onClick={() => onInsertFormatting('superscript')}
        disabled={!active}
      />
      <ToolButton
        icon={<Subscript className="w-3.5 h-3.5" />}
        label="Subscript (H₂O)"
        onClick={() => onInsertFormatting('subscript')}
        disabled={!active}
      />

      <Divider />

      <Popover open={symbolsOpen} onOpenChange={setSymbolsOpen}>
        <PopoverTrigger asChild>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!active}
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-all relative',
                    !active
                      ? 'text-muted-foreground/25 cursor-not-allowed'
                      : symbolsOpen
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <span className="text-xs font-semibold">π</span>
                  <ChevronDown className="w-2 h-2 absolute bottom-0.5 right-0.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Symbols</TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-64 p-0" sideOffset={8}>
          <div className="p-2 border-b border-border">
            <div className="flex gap-1">
              <button
                onClick={() => setSymbolTab('math')}
                className={cn(
                  'flex-1 text-[10px] font-medium py-1.5 rounded-md transition-colors',
                  symbolTab === 'math' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                Math
              </button>
              <button
                onClick={() => setSymbolTab('science')}
                className={cn(
                  'flex-1 text-[10px] font-medium py-1.5 rounded-md transition-colors',
                  symbolTab === 'science' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                Science / Stats
              </button>
            </div>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-6 gap-1">
              {(symbolTab === 'math' ? mathSymbols : scienceSymbols).map(({ symbol, label }) => (
                <Tooltip key={symbol}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onInsertSymbol(symbol);
                      }}
                      className="w-9 h-9 rounded-md flex items-center justify-center text-sm hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                    >
                      {symbol}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Divider />

      <ToolButton
        icon={<Sigma className="w-3.5 h-3.5" />}
        label="Equation block"
        onClick={() => onInsertBlock('equation')}
        disabled={!active}
      />
      <ToolButton
        icon={<TableProperties className="w-3.5 h-3.5" />}
        label="Table block"
        onClick={() => onInsertBlock('table')}
        disabled={!active}
      />
      <ToolButton
        icon={<ImagePlus className="w-3.5 h-3.5" />}
        label="Image block"
        onClick={() => onInsertBlock('image')}
        disabled={!active}
      />
      <ToolButton
        icon={<StickyNote className="w-3.5 h-3.5" />}
        label="Note / instruction"
        onClick={() => onInsertBlock('note')}
        disabled={!active}
      />
    </div>
  );
};

export default AcademicToolbar;
