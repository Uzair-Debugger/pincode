import { cn } from '@/utils/cn';

const LANG_COLORS: Record<string, string> = {
  typescript: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  javascript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  python: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rust: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  go: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

export function LanguageBadge({ language, className }: { language: string; className?: string }) {
  const color = LANG_COLORS[language.toLowerCase()] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color, className)}>
      {language}
    </span>
  );
}
