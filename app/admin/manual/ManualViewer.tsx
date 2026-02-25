'use client';

import { useMemo } from 'react';

interface ManualViewerProps {
  content: string;
}

export default function ManualViewer({ content }: ManualViewerProps) {
  const htmlContent = useMemo(() => {
    return content
      // Headers
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-slate-900 mt-5 mb-2">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 mt-10 mb-6">$1</h1>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-slate-200 my-8" />')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-purple-600 hover:text-purple-700 hover:underline">$1</a>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Process lists
      .split('\n')
      .map((line, index, lines) => {
        const trimmed = line.trim();
        
        if (/^\d+\.\s+/.test(trimmed)) {
          const isFirst = index === 0 || !/^\d+\.\s+/.test(lines[index - 1]?.trim() || '');
          const isLast = index === lines.length - 1 || !/^\d+\.\s+/.test(lines[index + 1]?.trim() || '');
          const content = trimmed.replace(/^\d+\.\s+/, '');
          if (isFirst) return `<ol class="list-decimal list-inside my-4 space-y-2 text-slate-700"><li class="ml-4">${content}`;
          if (isLast) return `<li class="ml-4">${content}</li></ol>`;
          return `<li class="ml-4">${content}`;
        }
        
        if (/^-\s+/.test(trimmed) || /^\*\s+/.test(trimmed)) {
          const isFirst = index === 0 || !(/^-\s+/.test(lines[index - 1]?.trim() || '') || /^\*\s+/.test(lines[index - 1]?.trim() || ''));
          const isLast = index === lines.length - 1 || !(/^-\s+/.test(lines[index + 1]?.trim() || '') || /^\*\s+/.test(lines[index + 1]?.trim() || ''));
          const content = trimmed.replace(/^[-\*]\s+/, '');
          if (isFirst) return `<ul class="list-disc list-inside my-4 space-y-2 text-slate-700"><li class="ml-4">${content}`;
          if (isLast) return `<li class="ml-4">${content}</li></ul>`;
          return `<li class="ml-4">${content}`;
        }
        
        if (trimmed === '') return '<br />';
        
        if (trimmed.startsWith('#')) return line;
        
        if (trimmed && !trimmed.startsWith('<')) {
          return `<p class="text-slate-700 leading-relaxed mb-4">${trimmed}</p>`;
        }
        
        return line;
      })
      .join('\n');
  }, [content]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8">
      <div
        className="prose prose-slate max-w-none
          prose-headings:text-slate-900
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
          prose-h4:text-lg prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-4
          prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-slate-900 prose-strong:font-semibold
          prose-em:text-slate-700 prose-em:italic
          prose-ul:text-slate-700 prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
          prose-ol:text-slate-700 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
          prose-li:my-2
          prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-blockquote:border-l-4 prose-blockquote:border-purple-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
          prose-hr:border-slate-200 prose-hr:my-8"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
