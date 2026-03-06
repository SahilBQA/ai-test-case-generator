import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { TestCase } from '../services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TestCaseCardProps {
  tc: TestCase;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onCopy: (text: string) => void;
}

const TestCaseCard = memo(({ tc, isExpanded, onToggle, onCopy }: TestCaseCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "border rounded-xl overflow-hidden transition-all",
        isExpanded ? "border-indigo-200 ring-1 ring-indigo-100 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-300"
      )}
    >
      <button
        onClick={() => onToggle(tc.id)}
        className="w-full p-4 flex items-start justify-between text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {tc.id}
            </span>
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded",
              tc.priority === 'High' ? 'bg-red-50 text-red-600' : 
              tc.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
              'bg-emerald-50 text-emerald-600'
            )}>
              {tc.priority}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
              {tc.type}
            </span>
          </div>
          <h3 className="font-medium text-zinc-900 leading-tight">{tc.title}</h3>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-100 bg-zinc-50/50"
          >
            <div className="p-4 space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Preconditions
                </h4>
                <ul className="list-disc list-inside text-zinc-600 pl-2 space-y-1">
                  {tc.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Steps
                </h4>
                <ol className="list-decimal list-inside text-zinc-600 pl-2 space-y-1">
                  {tc.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Expected Result
                </h4>
                <p className="text-zinc-600 pl-3.5 border-l-2 border-indigo-100 italic">
                  {tc.expectedResult}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(`Test Case ${tc.id}: ${tc.title}\n\nPreconditions:\n${tc.preconditions.join('\n')}\n\nSteps:\n${tc.steps.join('\n')}\n\nExpected Result: ${tc.expectedResult}`);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

TestCaseCard.displayName = 'TestCaseCard';

export default TestCaseCard;
